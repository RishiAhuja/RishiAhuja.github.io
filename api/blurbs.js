import { createBlurbStore, notifyComment, StoreError, validateComment, validSession, validSlug } from '../server/blurbs.mjs';

const SITE = 'https://rishia.in';

export default async function handler(request, response) {
  const origin = request.headers.origin;
  const allowed = new Set([SITE, 'https://www.rishia.in', 'https://rishiahuja.github.io']);
  for (const host of [process.env.VERCEL_URL, process.env.VERCEL_PROJECT_PRODUCTION_URL]) if (host) allowed.add(`https://${host}`);
  if (process.env.NODE_ENV !== 'production') { for (const local of ['http://127.0.0.1:4322', 'http://localhost:4322']) allowed.add(local); }
  response.setHeader('Vary', 'Origin');
  response.setHeader('Cache-Control', 'no-store');
  response.setHeader('X-Content-Type-Options', 'nosniff');
  if (origin && !allowed.has(origin)) return response.status(403).json({ error: 'Origin not allowed' });
  if (origin) response.setHeader('Access-Control-Allow-Origin', origin);
  if (request.method === 'OPTIONS') {
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return response.status(204).end();
  }
  if (!['GET', 'POST'].includes(request.method)) {
    response.setHeader('Allow', 'GET, POST, OPTIONS');
    return response.status(405).json({ error: 'Method not allowed' });
  }
  const url = new URL(request.url, SITE);
  const store = createBlurbStore({ url: process.env.ANALYTICS_SUPABASE_URL, key: process.env.ANALYTICS_SUPABASE_KEY });
  try {
    if (request.method === 'GET') {
      const slug = url.searchParams.get('slug');
      const session = url.searchParams.get('session');
      if (!validSlug(slug) || (session && !validSession(session))) return response.status(400).json({ error: 'Invalid request' });
      return response.status(200).json(await store.engagement(slug, session));
    }
    if (!origin) return response.status(403).json({ error: 'Origin required' });
    if (!request.headers['content-type']?.startsWith('application/json')) return response.status(415).json({ error: 'JSON required' });
    const raw = typeof request.body === 'string' ? request.body : JSON.stringify(request.body || {});
    if (raw.length > 8192) return response.status(413).json({ error: 'Request too large' });
    let body;
    try { body = JSON.parse(raw); } catch { return response.status(400).json({ error: 'Invalid request' }); }

    if (body?.action === 'like') {
      if (!validSlug(body.slug) || !validSession(body.sessionId) || typeof body.liked !== 'boolean') return response.status(400).json({ error: 'Invalid like' });
      return response.status(200).json(await store.like(body.slug, body.sessionId, body.liked));
    }
    if (body?.action === 'comment') {
      const comment = validateComment(body);
      if (!comment) return response.status(400).json({ error: 'Add your name and a comment of up to 2,000 characters.' });
      // Bots that fill the hidden field get the same answer as everyone else.
      if (comment === 'spam') return response.status(200).json({ status: 'pending' });
      await store.comment(comment);
      await notifyComment({
        apiKey: process.env.RESEND_API_KEY, from: process.env.RESEND_FROM_EMAIL, to: process.env.COMMENT_NOTIFY_EMAIL,
        origin: SITE, reviewUrl: 'https://archive.rishia.in/admin#comments', comment,
      });
      return response.status(200).json({ status: 'pending' });
    }

    return response.status(400).json({ error: 'Unknown action' });
  } catch (error) {
    const status = error instanceof StoreError ? error.status : 503;
    return response.status(status).json({ error: status === 503 ? 'Comments are temporarily unavailable' : error.message });
  }
}
