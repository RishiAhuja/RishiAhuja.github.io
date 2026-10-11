type DailyStat = { date: string; visitors: number; pageViews: number };
type Statistics = { totalVisitors: number; legacyVisitors: number; days: number; dailyStats: DailyStat[]; updatedAt: string };
const format = new Intl.NumberFormat('en-US');
const dateLabel = (date: string) => new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' }).format(new Date(`${date}T00:00:00Z`));
let mountedBody: HTMLElement | null = null;
let scope: AbortController | null = null;

function chart(host: HTMLElement, rows: DailyStat[], metric: 'visitors' | 'pageViews') {
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('viewBox', '0 0 600 230');
  svg.setAttribute('role', 'img');
  const label = metric === 'visitors' ? 'Daily visitors' : 'Daily page views';
  const peak = Math.max(0, ...rows.map(row => row[metric]));
  const peakRow = rows.find(row => row[metric] === peak);
  svg.setAttribute('aria-label', `${label} over ${rows.length} days. Peak: ${format.format(peak)}${peakRow ? ` on ${dateLabel(peakRow.date)}` : ''}. Exact values are available in Daily figures.`);
  const max = Math.max(5, Math.ceil(peak / 5) * 5);
  const x = (index: number) => 42 + (index / Math.max(1, rows.length - 1)) * 544;
  const y = (value: number) => 194 - (value / max) * 164;
  const node = (tag: string, attributes: Record<string, string>) => {
    const element = document.createElementNS(ns, tag);
    Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value));
    svg.append(element); return element;
  };
  for (const value of [0, max / 2, max]) {
    node('line', { x1: '42', x2: '586', y1: String(y(value)), y2: String(y(value)), class: 'stats-gridline' });
    node('text', { x: '32', y: String(y(value) + 4), 'text-anchor': 'end', class: 'stats-axis' }).textContent = format.format(Math.round(value));
  }
  const points = rows.map((row, index) => `${x(index)},${y(row[metric])}`).join(' ');
  node('polygon', { points: `42,194 ${points} 586,194`, class: 'stats-area' });
  node('polyline', { points, class: 'stats-line', fill: 'none' });
  rows.forEach((row, index) => {
    const dot = node('circle', { cx: String(x(index)), cy: String(y(row[metric])), r: rows.length > 30 ? '2' : '3', class: 'stats-dot' });
    const title = document.createElementNS(ns, 'title'); title.textContent = `${dateLabel(row.date)}: ${format.format(row[metric])}`; dot.append(title);
  });
  if (rows.length) {
    node('text', { x: '42', y: '222', class: 'stats-axis' }).textContent = dateLabel(rows[0].date);
    node('text', { x: '586', y: '222', 'text-anchor': 'end', class: 'stats-axis' }).textContent = dateLabel(rows[rows.length - 1].date);
  }
  host.replaceChildren(svg);
}

async function mountAnalytics() {
  if (mountedBody === document.body) return;
  mountedBody = document.body;
  scope?.abort(); scope = new AbortController();
  const { signal } = scope;
  const local = ['localhost', '127.0.0.1'].includes(location.hostname);
  const endpoint = local ? 'http://127.0.0.1:4326/api/visitors' : document.body.dataset.analyticsEndpoint!;
  const counter = document.querySelector<HTMLElement>('[data-visitor-label]');
  const setCounter = (total: number) => { if (!signal.aborted && counter) counter.textContent = `${format.format(total)} visitors`; };
  async function read(query: string, requestSignal = signal) {
    const response = await fetch(`${endpoint}${query}`, { signal: requestSignal, credentials: 'omit' });
    if (!response.ok) throw new Error('Statistics unavailable');
    return response.json();
  }
  // Reuse the original session key; never send query strings, referrers or browser fingerprints.
  const privacy = navigator.doNotTrack === '1' || (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl;
  const track = !privacy && ['rishia.in', 'www.rishia.in', 'rishiahuja.github.io'].includes(location.hostname) && location.pathname !== '/404';
  let visit: Promise<{ totalVisitors: number }> | null = null;
  if (track) {
    try {
      let sessionId = sessionStorage.getItem('visitor_session_id');
      if (!sessionId) { sessionId = `session_${crypto.randomUUID()}`; sessionStorage.setItem('visitor_session_id', sessionId); }
      visit = fetch(endpoint, { method: 'POST', credentials: 'omit', keepalive: true, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ path: location.pathname, sessionId }) })
        .then(response => { if (!response.ok) throw new Error('Counter unavailable'); return response.json(); });
      visit.then(data => setCounter(data.totalVisitors)).catch(() => {});
    } catch { /* Restricted storage leaves the counter readable without recording. */ }
  }
  const page = document.querySelector<HTMLElement>('[data-statistics]');
  if (!page) {
    (visit ? visit.catch(() => read('?summary=1')) : read('?summary=1')).then(data => setCounter(data.totalVisitors)).catch(() => {});
    return;
  }
  const period = page.querySelector<HTMLSelectElement>('#stats-period')!;
  const status = page.querySelector<HTMLElement>('.stats-status')!;
  const retry = page.querySelector<HTMLButtonElement>('.stats-retry')!;
  const results = page.querySelector<HTMLElement>('.stats-results')!;
  let request: AbortController | null = null;
  const load = async () => {
    request?.abort(); request = new AbortController();
    const current = request;
    signal.addEventListener('abort', () => current.abort(), { once: true });
    status.textContent = 'Loading statistics…'; status.hidden = false; retry.hidden = true;
    results.hidden = true; page.setAttribute('aria-busy', 'true');
    try {
      const data = await read(`?days=${period.value}`, current.signal) as Statistics;
      if (current.signal.aborted) return;
      setCounter(data.totalVisitors);
      page.querySelector('[data-stat="total"]')!.textContent = format.format(data.totalVisitors);
      page.querySelector('[data-stat="views"]')!.textContent = format.format(data.dailyStats.reduce((sum, row) => sum + row.pageViews, 0));
      page.querySelector('[data-stat="average"]')!.textContent = format.format(Math.round(data.dailyStats.reduce((sum, row) => sum + row.visitors, 0) / data.days));
      page.querySelector('[data-period-label]')!.textContent = `In the last ${data.days} days`;
      chart(page.querySelector<HTMLElement>('[data-chart="visitors"]')!, data.dailyStats, 'visitors');
      chart(page.querySelector<HTMLElement>('[data-chart="pageViews"]')!, data.dailyStats, 'pageViews');
      const body = page.querySelector('tbody')!;
      const rows = [...data.dailyStats].reverse().map(day => {
        const row = document.createElement('tr');
        const date = document.createElement('th'); date.scope = 'row'; date.textContent = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${day.date}T00:00:00Z`)); row.append(date);
        for (const count of [day.visitors, day.pageViews]) { const cell = document.createElement('td'); cell.textContent = format.format(count); row.append(cell); }
        return row;
      });
      body.replaceChildren(...rows); results.hidden = false;
      const empty = data.dailyStats.every(row => row.visitors === 0 && row.pageViews === 0);
      status.textContent = empty ? 'No visits recorded in this period.' : `Figures loaded for the last ${data.days} days.`;
      status.classList.toggle('sr-only', !empty);
    } catch {
      if (current.signal.aborted) return;
      status.classList.remove('sr-only'); status.textContent = 'Statistics are temporarily unavailable. Please try again.'; retry.hidden = false;
    } finally { if (!current.signal.aborted) page.removeAttribute('aria-busy'); }
  };
  period.addEventListener('change', load, { signal }); retry.addEventListener('click', load, { signal });
  // Include the current visit in the first snapshot, without blocking if tracking fails.
  if (visit) await visit.catch(() => null);
  if (!signal.aborted) await load();
}
document.addEventListener('astro:page-load', mountAnalytics);
if (document.readyState !== 'loading') void mountAnalytics();
