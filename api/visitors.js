import { createAnalytics, PERIODS, validateVisit } from '../server/analytics.mjs';

export default async function handler(request, response) {
  const origin = request.headers.origin;
  const allowed = new Set(['https://rishia.in', 'https://www.rishia.in', 'https://rishiahuja.github.io']);
  for (const host of [process.env.VERCEL_URL, process.env.VERCEL_PROJECT_PRODUCTION_URL]) if (host) allowed.add(`https://${host}`);
  if (process.env.NODE_ENV !== 'production') allowed.add('http://127.0.0.1:4322');
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
  const analytics = createAnalytics({ url: process.env.ANALYTICS_SUPABASE_URL, key: process.env.ANALYTICS_SUPABASE_KEY });
  try {
    if (request.method === 'POST') {
      if (!origin) return response.status(403).json({ error: 'Origin required' });
      if (!request.headers['content-type']?.startsWith('application/json')) return response.status(415).json({ error: 'JSON required' });
      const raw = typeof request.body === 'string' ? request.body : JSON.stringify(request.body || {});
      if (raw.length > 1024) return response.status(413).json({ error: 'Request too large' });
      let body;
      try { body = JSON.parse(raw); } catch { return response.status(400).json({ error: 'Invalid request' }); }
      const parameters = validateVisit(body);
      if (!parameters) return response.status(400).json({ error: 'Invalid visit' });
      return response.status(200).json(await analytics.log(parameters));
    }
    const url = new URL(request.url, 'https://rishia.in');
    if (url.searchParams.get('summary') === '1') return response.status(200).json(await analytics.total());
    const days = Number(url.searchParams.get('days') || 30);
    if (!PERIODS.includes(days)) return response.status(400).json({ error: 'Invalid period' });
    return response.status(200).json(await analytics.stats(days));
  } catch {
    return response.status(503).json({ error: 'Statistics are temporarily unavailable' });
  }
}
