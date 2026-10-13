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
  const unit = metric === 'visitors' ? 'visitors' : 'page views';
  const peak = Math.max(0, ...rows.map(row => row[metric]));
  const peakRow = rows.find(row => row[metric] === peak);
  svg.setAttribute('aria-label', `${label} over ${rows.length} days. Peak: ${format.format(peak)}${peakRow ? ` on ${dateLabel(peakRow.date)}` : ''}. Exact values are available in Daily figures.`);
  const max = Math.max(5, Math.ceil(peak / 5) * 5);
  // Budget for the larger mobile labels, including comma separators.
  const left = Math.max(56, format.format(max).length * 15 + 22);
  const right = 586;
  const x = (index: number) => left + (index / Math.max(1, rows.length - 1)) * (right - left);
  const y = (value: number) => 194 - (value / max) * 164;
  const node = (tag: string, attributes: Record<string, string>) => {
    const element = document.createElementNS(ns, tag);
    Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value));
    svg.append(element); return element;
  };
  for (const value of [0, max / 2, max]) {
    node('line', { x1: String(left), x2: String(right), y1: String(y(value)), y2: String(y(value)), class: 'stats-gridline' });
    node('text', { x: String(left - 14), y: String(y(value) + 4), 'text-anchor': 'end', class: 'stats-axis' }).textContent = format.format(Math.round(value));
  }
  const points = rows.map((row, index) => `${x(index)},${y(row[metric])}`).join(' ');
  node('polygon', { points: `${left},194 ${points} ${right},194`, class: 'stats-area' });
  node('polyline', { points, class: 'stats-line', fill: 'none' });
  rows.forEach((row, index) => {
    node('circle', { cx: String(x(index)), cy: String(y(row[metric])), r: rows.length > 30 ? '2' : '3', class: 'stats-dot' });
  });
  if (!rows.length) { host.replaceChildren(svg); return; }
  node('text', { x: String(left), y: '222', class: 'stats-axis' }).textContent = dateLabel(rows[0].date);
  node('text', { x: String(right), y: '222', 'text-anchor': 'end', class: 'stats-axis' }).textContent = dateLabel(rows[rows.length - 1].date);

  const guide = node('line', { y1: '30', y2: '194', class: 'stats-guide', visibility: 'hidden' });
  const selectedDot = node('circle', { r: '5', class: 'stats-dot-active', visibility: 'hidden' });
  const tooltip = document.createElement('div');
  tooltip.className = 'stats-tooltip'; tooltip.hidden = true; tooltip.setAttribute('aria-hidden', 'true');
  const tooltipDate = document.createElement('span');
  const tooltipCount = document.createElement('strong');
  tooltip.append(tooltipDate, tooltipCount);
  const instructions = document.createElement('span');
  instructions.id = `stats-chart-help-${metric}`; instructions.className = 'sr-only';
  instructions.textContent = 'Hover or tap to inspect a day. Use the arrow keys to change the day, Home or End to jump, and Escape to dismiss. Dates are in UTC.';
  const control = document.createElement('div');
  control.className = 'stats-chart-control'; control.tabIndex = 0;
  control.setAttribute('role', 'slider'); control.setAttribute('aria-label', `Explore ${label.toLowerCase()} by date`);
  control.setAttribute('aria-orientation', 'horizontal'); control.setAttribute('aria-valuemin', '0');
  control.setAttribute('aria-valuemax', String(rows.length - 1)); control.setAttribute('aria-describedby', instructions.id);
  control.style.left = `${left / 600 * 100}%`; control.style.width = `${(right - left) / 600 * 100}%`;
  control.style.top = `${30 / 230 * 100}%`; control.style.height = `${164 / 230 * 100}%`;
  host.replaceChildren(svg, control, tooltip, instructions);

  let selected = rows.length - 1;
  const fullDate = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
  const describe = () => {
    const row = rows[selected];
    const date = fullDate.format(new Date(`${row.date}T00:00:00Z`));
    control.setAttribute('aria-valuenow', String(selected));
    control.setAttribute('aria-valuetext', `${date}: ${format.format(row[metric])} ${unit}`);
    tooltipDate.textContent = date; tooltipCount.textContent = `${format.format(row[metric])} ${unit}`;
  };
  const show = (index: number) => {
    selected = Math.max(0, Math.min(rows.length - 1, index)); describe();
    const pointX = x(selected); const pointY = y(rows[selected][metric]);
    guide.setAttribute('x1', String(pointX)); guide.setAttribute('x2', String(pointX)); guide.setAttribute('visibility', 'visible');
    selectedDot.setAttribute('cx', String(pointX)); selectedDot.setAttribute('cy', String(pointY)); selectedDot.setAttribute('visibility', 'visible');
    tooltip.hidden = false;
    const bounds = svg.getBoundingClientRect();
    const width = tooltip.offsetWidth; const height = tooltip.offsetHeight;
    // CSS clamps keep the first/last day and narrow-screen tooltips inside the chart, even after resizing.
    tooltip.style.left = `clamp(8px, calc(${pointX / 600 * 100}% - ${width / 2}px), calc(100% - ${width + 8}px))`;
    const above = pointY / 230 * bounds.height >= height + 20;
    tooltip.style.top = `clamp(8px, calc(${pointY / 230 * 100}% ${above ? '-' : '+'} ${above ? height + 12 : 12}px), calc(100% - ${height + 8}px))`;
  };
  const hide = () => {
    tooltip.hidden = true; guide.setAttribute('visibility', 'hidden'); selectedDot.setAttribute('visibility', 'hidden');
  };
  const atPointer = (event: PointerEvent) => {
    const bounds = svg.getBoundingClientRect();
    if (!bounds.width) return;
    const position = (event.clientX - bounds.left) / bounds.width * 600;
    show(Math.round((position - left) / (right - left) * (rows.length - 1)));
  };
  control.addEventListener('pointermove', event => { if (event.pointerType !== 'touch') atPointer(event); });
  control.addEventListener('pointerdown', atPointer);
  control.addEventListener('pointerleave', event => { if (event.pointerType !== 'touch') hide(); });
  control.addEventListener('focus', () => show(selected));
  control.addEventListener('blur', hide);
  control.addEventListener('keydown', event => {
    if (event.key === 'Escape') { hide(); return; }
    let index = selected;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') index--;
    else if (event.key === 'ArrowRight' || event.key === 'ArrowUp') index++;
    else if (event.key === 'Home') index = 0;
    else if (event.key === 'End') index = rows.length - 1;
    else return;
    event.preventDefault(); show(index);
  });
  describe();
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
