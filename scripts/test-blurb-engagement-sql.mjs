// Optional local integration check; requires installed PostgreSQL binaries (PG_BIN).
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
const bin = process.env.PG_BIN;
const folder = await mkdtemp(join(tmpdir(), 'portfolio-blurbs-pg-'));
const data = join(folder, 'data');
const executable = name => bin ? join(bin, name) : name;
const args = ['-h', folder, '-d', 'postgres', '-v', 'ON_ERROR_STOP=1', '-At'];
const sql = input => execFileSync(executable('psql'), args, { input, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();
const asAnon = input => sql(`SET ROLE anon; ${input}`).split('\n').at(-1);
let started = false;
try {
  execFileSync(executable('initdb'), ['-D', data, '-A', 'trust', '--no-locale', '-E', 'UTF8'], { stdio: 'pipe' });
  execFileSync(executable('pg_ctl'), ['-D', data, '-l', join(folder, 'postgres.log'), '-o', `-F -k ${folder} -c listen_addresses='' -c timezone=UTC`, '-w', 'start'], { stdio: 'pipe' });
  started = true;
  sql('CREATE ROLE anon; CREATE ROLE authenticated; GRANT USAGE ON SCHEMA public TO anon;');
  sql('CREATE ROLE service_role BYPASSRLS; GRANT USAGE ON SCHEMA public TO service_role;');
  const migration = await readFile('sql/2026-11-18-blurb-likes-comments.sql', 'utf8');
  sql(migration);
  sql(migration);

  assert.equal(asAnon("SELECT public.set_blurb_like('health-update', 'session_aaaaaaaa', true)"), '1');
  assert.equal(asAnon("SELECT public.set_blurb_like('health-update', 'session_aaaaaaaa', true)"), '1', 'A browser likes once');
  assert.equal(asAnon("SELECT public.set_blurb_like('health-update', 'session_bbbbbbbb', true)"), '2');
  assert.equal(asAnon("SELECT public.set_blurb_like('health-update', 'session_bbbbbbbb', false)"), '1', 'Unliking removes it');
  assert.throws(() => asAnon("SELECT public.set_blurb_like('../etc', 'session_aaaaaaaa', true)"), 'Slugs are validated');

  const id = asAnon("SELECT public.submit_blurb_comment('health-update', '  Asha ', 'Great post')");
  assert.match(id, /^[0-9a-f-]{36}$/);
  assert.throws(() => asAnon("SELECT public.submit_blurb_comment('health-update', '', 'x')"), 'Names are required');
  assert.throws(() => asAnon(`SELECT public.submit_blurb_comment('health-update', 'A', '${'x'.repeat(2001)}')`), 'Bodies are capped');

  let engagement = JSON.parse(asAnon("SELECT public.get_blurb_engagement('health-update', 'session_aaaaaaaa')"));
  assert.deepEqual([engagement.likes, engagement.liked, engagement.comments.length], [1, true, 0], 'Pending comments stay hidden');

  assert.equal(sql(`SET ROLE service_role; SELECT name FROM public.blurb_comments WHERE status = 'pending'`).split('\n').at(-1), 'Asha', 'Names are trimmed; the admin can list pending comments');
  sql(`SET ROLE service_role; UPDATE public.blurb_comments SET status = 'approved', reviewed_at = now() WHERE id = '${id}'`);
  engagement = JSON.parse(asAnon("SELECT public.get_blurb_engagement('health-update')"));
  assert.deepEqual([engagement.liked, engagement.comments[0].body], [false, 'Great post'], 'Approved comments appear');

  assert.throws(() => asAnon('SELECT * FROM public.blurb_comments'), 'Raw comments are private');
  assert.throws(() => asAnon('SELECT * FROM public.blurb_likes'), 'Raw likes are private');
  assert.throws(() => asAnon(`UPDATE public.blurb_comments SET status = 'approved'`), 'Only the admin can approve');
  console.log('SQL integration checks passed: likes, unlikes, comment validation, hidden pending comments, admin-only review, private tables, and safe reruns.');
} finally {
  if (started) execFileSync(executable('pg_ctl'), ['-D', data, '-m', 'immediate', '-w', 'stop'], { stdio: 'pipe' });
  await rm(folder, { recursive: true, force: true });
}
