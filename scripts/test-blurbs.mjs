import assert from 'node:assert/strict';
import { validateComment } from '../server/blurbs.mjs';
import handler from '../api/blurbs.js';

const calls = [];
const realFetch = globalThis.fetch;
globalThis.fetch = async (url, init) => {
  const body = JSON.parse(init.body);
  calls.push({ url, body, headers: init.headers });
  if (url.startsWith('https://api.resend.com/')) return Response.json({ id: 'email' });
  if (url.endsWith('/get_blurb_engagement')) return Response.json({ likes: 3, liked: true, comments: [] });
  if (url.endsWith('/set_blurb_like')) return Response.json(4);
  if (url.endsWith('/submit_blurb_comment')) return Response.json('9b2f6c1e-1d1a-4f63-9e55-2f4a9e1b3c77');
  return Response.json(null);
};
process.env.ANALYTICS_SUPABASE_URL = 'https://db.example.invalid';
process.env.ANALYTICS_SUPABASE_KEY = 'anonymous-test-key';
process.env.RESEND_API_KEY = 're_test';
process.env.RESEND_FROM_EMAIL = 'hello@example.invalid';
process.env.COMMENT_NOTIFY_EMAIL = 'me@example.invalid';

function response() { return { headers: {}, code: 0, data: null, html: '', setHeader(key, value) { this.headers[key] = value; }, status(code) { this.code = code; return this; }, json(data) { this.data = data; }, end(html) { this.html = html || ''; } }; }
const post = (body, headers = {}) => ({ method: 'POST', url: '/api/blurbs', headers: { origin: 'https://rishia.in', 'content-type': 'application/json', ...headers }, body: JSON.stringify(body) });
const run = async (request) => { const result = response(); await handler(request, result); return result; };

assert.deepEqual(validateComment({ slug: 'health-update', name: '  Asha ', body: ' Nice ' }), { slug: 'health-update', name: 'Asha', body: 'Nice' });
assert.equal(validateComment({ slug: 'health-update', name: 'A', body: 'x', website: 'spam.example' }), 'spam');
for (const bad of [{ slug: '../x', name: 'A', body: 'x' }, { slug: 'a', name: '', body: 'x' }, { slug: 'a', name: 'A', body: 'x'.repeat(2001) }, { slug: 'a', name: 'x'.repeat(61), body: 'x' }]) assert.equal(validateComment(bad), null);

let result = await run({ method: 'GET', url: '/api/blurbs?slug=health-update&session=like_abcdefgh', headers: {} });
assert.deepEqual([result.code, result.data.likes], [200, 3]);
assert.equal((await run({ method: 'GET', url: '/api/blurbs?slug=Bad%20Slug', headers: {} })).code, 400);

result = await run(post({ action: 'like', slug: 'health-update', sessionId: 'like_abcdefgh', liked: true }));
assert.deepEqual(result.data, { likes: 4, liked: true });
assert.deepEqual(calls.at(-1).body, { p_slug: 'health-update', p_session_id: 'like_abcdefgh', p_liked: true });

calls.length = 0;
result = await run(post({ action: 'comment', slug: 'health-update', name: 'Asha', body: 'Great post' }));
assert.deepEqual([result.code, result.data.status], [200, 'pending']);
assert.equal(calls.length, 2, 'Saves the comment, then emails it');
assert.equal(calls[1].body.to[0], 'me@example.invalid');
assert.match(calls[1].body.text, /Great post[\s\S]*https:\/\/archive\.rishia\.in\/admin#comments/);

calls.length = 0;
result = await run(post({ action: 'comment', slug: 'health-update', name: 'Bot', body: 'Buy now', website: 'https://spam.example' }));
assert.deepEqual([result.code, result.data.status, calls.length], [200, 'pending', 0], 'Trapped bots look accepted but nothing is stored or sent');

result = await run(post({ action: 'comment', slug: 'health-update', name: '', body: 'x' }));
assert.equal(result.code, 400);
assert.equal((await run({ ...post({ action: 'comment' }), headers: { origin: 'https://evil.example', 'content-type': 'application/json' } })).code, 403);

assert.equal((await run(post({ action: 'admin-list', status: 'pending' }))).code, 400, 'Review happens only in the archive admin');

globalThis.fetch = realFetch;
console.log('Blurb API checks passed: likes, comment validation, email notice, spam trap, and origin check.');
