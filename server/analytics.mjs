export const LEGACY_VISITORS = 5747;
export const PERIODS = [7, 30, 90];

const count = (value) => {
  const number = Number(value);
  if (value == null || !Number.isSafeInteger(number) || number < 0) throw new Error('Invalid aggregate');
  return number;
};

export function normalizeDaily(rows, days, now = new Date()) {
  if (!Array.isArray(rows)) throw new Error('Invalid daily aggregates');
  const source = new Map(rows.map(row => [String(row.date).slice(0, 10), { visitors: count(row.visitors), pageViews: count(row.page_views) }]));
  const end = new Date(now.toISOString().slice(0, 10) + 'T00:00:00Z');
  return Array.from({ length: days }, (_, index) => {
    const date = new Date(end);
    date.setUTCDate(date.getUTCDate() - days + 1 + index);
    const key = date.toISOString().slice(0, 10);
    return { date: key, ...(source.get(key) || { visitors: 0, pageViews: 0 }) };
  });
}

export function validateVisit(body) {
  if (!body || typeof body !== 'object' || typeof body.path !== 'string' || typeof body.sessionId !== 'string') return null;
  if (!/^\/[a-zA-Z0-9/_-]*$/.test(body.path) || body.path.length > 200 || body.path.startsWith('/api/')) return null;
  if (!/^[a-zA-Z0-9_-]{8,100}$/.test(body.sessionId)) return null;
  return { p_page_path: body.path.replace(/\/$/, '') || '/', p_session_id: body.sessionId };
}

export function createAnalytics({ url, key, fetcher = fetch, now = () => new Date() }) {
  async function rpc(name, parameters = {}) {
    if (!url || !key) throw new Error('Analytics connection unavailable');
    const response = await fetcher(`${url.replace(/\/$/, '')}/rest/v1/rpc/${name}`, {
      method: 'POST', headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(parameters), signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) throw new Error('Analytics database unavailable');
    const text = await response.text();
    return text ? JSON.parse(text) : null;
  }
  const total = async () => {
    const databaseVisitors = count(await rpc('get_total_visitors'));
    return { totalVisitors: databaseVisitors + LEGACY_VISITORS, legacyVisitors: LEGACY_VISITORS };
  };
  return {
    total,
    async stats(days) {
      if (!PERIODS.includes(days)) throw new Error('Invalid period');
      const [summary, daily] = await Promise.all([total(), rpc('get_daily_stats', { days_back: days })]);
      return { ...summary, days, dailyStats: normalizeDaily(daily, days, now()), updatedAt: now().toISOString() };
    },
    async log(parameters) { await rpc('log_visit', parameters); return total(); },
  };
}
