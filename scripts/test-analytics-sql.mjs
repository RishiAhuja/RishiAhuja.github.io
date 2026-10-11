// Optional local integration check; requires installed PostgreSQL binaries (PG_BIN).
import assert from 'node:assert/strict';
import { execFileSync, execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
const bin = process.env.PG_BIN;
const folder = await mkdtemp(join(tmpdir(), 'portfolio-analytics-pg-'));
const data = join(folder, 'data');
const executable = name => bin ? join(bin, name) : name;
const args = ['-h', folder, '-d', 'postgres', '-v', 'ON_ERROR_STOP=1', '-At'];
const sql = input => execFileSync(executable('psql'), args, { input, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();
let started = false;
try {
  execFileSync(executable('initdb'), ['-D', data, '-A', 'trust', '--no-locale', '-E', 'UTF8'], {stdio:'pipe'});
  execFileSync(executable('pg_ctl'), ['-D',data,'-l',join(folder,'postgres.log'),'-o',`-F -k ${folder} -c listen_addresses='' -c timezone=UTC`,'-w','start'],{stdio:'pipe'});
  started = true;
  sql(`CREATE ROLE anon; CREATE ROLE authenticated;
    CREATE TABLE public.visitor_analytics (id bigserial PRIMARY KEY, visited_at timestamptz DEFAULT now(), page_path text, session_id text, created_at timestamptz DEFAULT now());
    CREATE TABLE public.daily_stats (date date PRIMARY KEY, total_visitors integer DEFAULT 0, unique_sessions integer DEFAULT 0, page_views integer DEFAULT 0, updated_at timestamptz DEFAULT now());
    ALTER TABLE public.visitor_analytics ENABLE ROW LEVEL SECURITY;
    GRANT USAGE ON SCHEMA public TO anon; GRANT SELECT ON public.visitor_analytics TO anon;
    INSERT INTO public.visitor_analytics (session_id,page_path,visited_at,created_at) VALUES
      ('historical_a','/one',CURRENT_DATE-1,CURRENT_DATE-1),
      ('historical_a','/two',CURRENT_DATE-1,CURRENT_DATE-1),
      ('historical_b','/one',CURRENT_DATE-1,CURRENT_DATE-1),
      ('historical_a','/one',CURRENT_DATE,CURRENT_DATE);
    INSERT INTO public.daily_stats (date,total_visitors,page_views) VALUES (CURRENT_DATE-1,3,3),(CURRENT_DATE,1,1);`);
  const migration = await readFile('sql/2026-10-12-fix-visitor-counts.sql','utf8');
  sql(migration);
  assert.equal(sql('SELECT public.get_total_visitors()'), '2', 'All-time visitors count sessions once across days');
  assert.equal(sql('SELECT unique_sessions FROM public.daily_stats WHERE date=CURRENT_DATE-1'), '2', 'Backfill daily sessions from history');
  assert.equal(sql('SELECT SUM(page_views) FROM public.daily_stats'), '4', 'Preserve historical page logs and roll back smoke records');
  assert.equal(sql('SELECT SUM(total_visitors) FROM public.daily_stats_before_session_fix_20261012'), '4', 'Back up the original counter');
  assert.equal(sql('SET ROLE anon; SELECT COUNT(*) FROM public.visitor_analytics').split('\n').at(-1), '0', 'Raw records remain private');
  assert.equal(sql('SET ROLE anon; SELECT public.get_total_visitors()').split('\n').at(-1), '2', 'Existing aggregate RPC remains available');
  assert.throws(()=>sql('SET ROLE anon; SELECT * FROM public.daily_stats_before_session_fix_20261012'), 'Backup is not publicly readable');
  const run = promisify(execFile);
  await Promise.all([
    run(executable('psql'),[...args,'-c',"BEGIN; SELECT public.log_visit('/parallel-one','parallel_session'); SELECT pg_sleep(0.25); COMMIT;"]),
    run(executable('psql'),[...args,'-c',"BEGIN; SELECT public.log_visit('/parallel-two','parallel_session'); COMMIT;"]),
  ]);
  assert.equal(sql('SELECT public.get_total_visitors()'), '3');
  assert.equal(sql('SELECT unique_sessions FROM public.daily_stats WHERE date=CURRENT_DATE'), '2', 'Concurrent requests count the daily session once');
  assert.equal(sql('SELECT page_views FROM public.daily_stats WHERE date=CURRENT_DATE'), '3', 'Each concurrent page view is counted');
  sql("SELECT public.log_visit('/another-page','parallel_session')");
  assert.equal(sql('SELECT public.get_total_visitors()'), '3', 'Revisiting pages does not add another visitor');
  assert.equal(sql('SELECT page_views FROM public.daily_stats WHERE date=CURRENT_DATE'), '4');
  sql(migration);
  assert.equal(sql('SELECT SUM(total_visitors) FROM public.daily_stats_before_session_fix_20261012'), '4', 'Rerunning does not overwrite the original snapshot');
  sql('UPDATE public.daily_stats SET page_views=page_views+1 WHERE date=CURRENT_DATE');
  assert.throws(()=>sql(migration), 'Refuse to reconstruct inconsistent history');
  console.log('SQL integration checks passed: historical repair, global and daily session counts, concurrent requests, page views, private backup, transactional smoke checks, and safe reruns.');
} finally {
  if (started) execFileSync(executable('pg_ctl'),['-D',data,'-m','immediate','-w','stop'],{stdio:'pipe'});
  await rm(folder,{recursive:true,force:true});
}
