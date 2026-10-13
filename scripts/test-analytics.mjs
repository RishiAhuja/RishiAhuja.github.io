import assert from 'node:assert/strict';
import { createAnalytics, normalizeDaily, validateVisit } from '../server/analytics.mjs';
import handler from '../api/visitors.js';
const fixed = new Date('2026-10-11T22:00:00Z');
const calls = [];
const analytics = createAnalytics({ url: 'https://example.invalid', key: 'anonymous-test-key', now: () => fixed, fetcher: async (url, init) => {
  calls.push({ name: url.split('/').pop(), parameters: JSON.parse(init.body) });
  if (url.endsWith('get_total_visitors')) return Response.json(4677);
  if (url.endsWith('get_daily_stats')) return Response.json([{date:'2026-10-11',visitors:38,page_views:45},{date:'2026-10-10',visitors:8,page_views:12}]);
  return Response.json(null);
} });
const summary = await analytics.total();
assert.equal(summary.totalVisitors, 10424, 'Keep the 5747 legacy offset exactly once');
const result = await analytics.stats(7);
assert.equal(result.dailyStats.length,7);
assert.deepEqual(result.dailyStats[6],{date:'2026-10-11',visitors:38,pageViews:45});
assert.equal(result.dailyStats[0].date,'2026-10-05');
assert.deepEqual(result.dailyStats[0],{date:'2026-10-05',visitors:0,pageViews:0});
assert.equal(calls.at(-1).parameters.days_back,7);
assert.equal(normalizeDaily([{date:'2026-10-11',visitors:0,page_views:0}],7,fixed).at(-1).visitors,0);
const visit = validateVisit({path:'/writings/art/',sessionId:'session_old_existing',email:'ignored',query:'ignored'});
assert.deepEqual(visit,{p_page_path:'/writings/art',p_session_id:'session_old_existing'});
await analytics.log(visit);
assert.deepEqual(calls.at(-2),{name:'log_visit',parameters:visit},'Reuse the existing RPC and session identifier');
for(const path of ['/article?private=1','/article#private','https://external.invalid','/api/visitors']) assert.equal(validateVisit({path,sessionId:'session_valid'}),null);
assert.equal(validateVisit({path:'/',sessionId:'x'}),null);
await assert.rejects(createAnalytics({url:'https://example.invalid',key:'test',fetcher:async()=>new Response('',{status:503})}).total());
await assert.rejects(createAnalytics({url:'https://example.invalid',key:'test',fetcher:async()=>Response.json(null)}).total());
await assert.rejects(analytics.stats(999));
function response(){return {headers:{},code:0,data:null,setHeader(key,value){this.headers[key]=value},status(code){this.code=code;return this},json(data){this.data=data},end(){}};}
for(const [request,code] of [
 [{method:'POST',headers:{origin:'https://external.invalid','content-type':'application/json'},body:{path:'/',sessionId:'session_valid'}},403],
 [{method:'POST',headers:{'content-type':'application/json'},body:{}},403],
 [{method:'POST',headers:{origin:'https://rishia.in','content-type':'application/json'},body:{path:'/?secret=1',sessionId:'session_valid'}},400],
 [{method:'GET',headers:{},url:'/api/visitors?days=999'},400],
 [{method:'OPTIONS',headers:{origin:'https://rishiahuja.github.io'},url:'/api/visitors'},204],
 [{method:'DELETE',headers:{},url:'/api/visitors'},405],
]) { const res=response(); await handler(request,res);assert.equal(res.code,code); }
const connection = [process.env.ANALYTICS_SUPABASE_URL, process.env.ANALYTICS_SUPABASE_KEY];
delete process.env.ANALYTICS_SUPABASE_URL; delete process.env.ANALYTICS_SUPABASE_KEY;
const failed=response();await handler({method:'GET',headers:{},url:'/api/visitors?summary=1'},failed);assert.equal(failed.code,503);assert.equal(failed.data.error,'Statistics are temporarily unavailable');
if(connection[0]) process.env.ANALYTICS_SUPABASE_URL=connection[0];
if(connection[1]) process.env.ANALYTICS_SUPABASE_KEY=connection[1];
console.log('Analytics checks passed: legacy continuity, daily history, visit validation, existing RPCs, CORS, and outage handling.');

// Exercise actual browser tracking across Astro page loads, without writing to the database.
const { readFile } = await import('node:fs/promises');
const { runInNewContext } = await import('node:vm');
const { default: ts } = await import('typescript');
const script = ts.transpileModule(await readFile('src/scripts/analytics.ts','utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.None}}).outputText;
const flush = () => new Promise(resolve=>setImmediate(resolve));
function browser({privacy=false, storageBlocked=false, failedPost=false}={}) {
  const requests=[], label={textContent:''};
  const document=Object.assign(new EventTarget(),{readyState:'complete',body:{dataset:{analyticsEndpoint:'https://rishia.in/api/visitors'}},querySelector(selector){return selector==='[data-visitor-label]'?label:null}});
  const location={hostname:'rishia.in',pathname:'/'};
  const context={document,location,navigator:{doNotTrack:privacy?'1':'0'},sessionStorage:{getItem(){if(storageBlocked)throw new Error('Storage disabled');return 'session_original_identifier'},setItem(){throw new Error('Existing session must be retained')}},crypto:{randomUUID(){return 'test-session'}},AbortController,Intl,URL,fetch:async(url,init={})=>{
    requests.push({url,method:init.method||'GET',body:init.body&&JSON.parse(init.body)});
    if(failedPost&&init.method==='POST') return new Response('',{status:503});
    return Response.json({totalVisitors:10424});
  }};
  runInNewContext(script,context);return {document,location,requests,label};
}
const active=browser();await flush();
active.document.dispatchEvent(new Event('astro:page-load'));await flush();
assert.equal(active.requests.filter(r=>r.method==='POST').length,1,'One recording on initial load despite duplicate page-load signals');
assert.equal(active.requests[0].body.sessionId,'session_original_identifier','Keep the original counter session');
active.document.body={dataset:{analyticsEndpoint:'https://rishia.in/api/visitors'}};active.location.pathname='/research';
active.document.dispatchEvent(new Event('astro:page-load'));await flush();
assert.equal(active.requests.filter(r=>r.method==='POST').length,2,'One recording for each Astro navigation');
assert.deepEqual(active.requests[1].body,{path:'/research',sessionId:'session_original_identifier'});
assert.equal(active.label.textContent,'10,424 visitors');
for(const options of [{privacy:true},{storageBlocked:true}]) {const state=browser(options);await flush();assert.equal(state.requests.some(r=>r.method==='POST'),false);assert.equal(state.label.textContent,'10,424 visitors');}
const fallback=browser({failedPost:true});await flush();await flush();assert.equal(fallback.requests.at(-1).method,'GET');assert.equal(fallback.label.textContent,'10,424 visitors');
console.log('Browser tracking checks passed: session reuse, one recording per page, navigation, privacy preferences, restricted storage, and read fallback.');

// Exercise the real chart renderer with measured site fonts and pointer/keyboard events.
const fontkit = await import('fontkit');
const axisFont = fontkit.openSync('public/fonts/athletics/Athletics-Regular.woff2');
class ChartElement extends EventTarget {
  constructor(tag) { super(); this.tag = tag; this.attributes = {}; this.style = {}; this.children = []; this.hidden = false; this.textContent = ''; }
  setAttribute(name, value) { this.attributes[name] = String(value); }
  getAttribute(name) { return this.attributes[name] ?? null; }
  append(...children) { for (const child of children) { child.parent = this; this.children.push(child); } }
  replaceChildren(...children) { this.children = []; this.append(...children); }
  getBoundingClientRect() { return this.bounds ?? this.parent?.getBoundingClientRect() ?? {left: 0, width: 500, height: 500 * 230 / 600}; }
  get offsetWidth() { return 180; }
  get offsetHeight() { return 60; }
}
const chartDocument = Object.assign(new EventTarget(), {readyState: 'loading', createElement: tag => new ChartElement(tag), createElementNS: (_, tag) => new ChartElement(tag)});
const chartContext = {document: chartDocument, Intl};
runInNewContext(script, chartContext);
const sample = [{date:'2026-09-14',visitors:12,pageViews:20},{date:'2026-10-12',visitors:2720,pageViews:3725},{date:'2026-10-13',visitors:97,pageViews:105}];
function dispatch(target, type, properties = {}) {
  const event = Object.assign(new Event(type, {cancelable: true}), properties);
  target.dispatchEvent(event); return event;
}
for (const metric of ['visitors', 'pageViews']) {
  for (const peak of [0, 2720, 3725, 10424, 1234567, 2147483647]) {
    const host = new ChartElement('div');
    chartContext.chart(host, sample.map(row => ({...row, [metric]: peak})), metric);
    const svg = host.children[0];
    const labels = svg.children.filter(node => node.tag === 'text');
    for (const size of [14, 24]) {
      for (const label of labels) {
        const width = axisFont.layout(label.textContent).advanceWidth / axisFont.unitsPerEm * size;
        const x = Number(label.getAttribute('x'));
        const start = label.getAttribute('text-anchor') === 'end' ? x - width : x;
        assert.ok(start >= 0 && start + width <= 600, `Entire ${label.textContent} label must fit at ${size}px, including large counts`);
      }
    }
  }
  for (const width of [343, 500, 900]) {
    const host = new ChartElement('div'); host.bounds = {left: 100, width, height: width * 230 / 600};
    chartContext.chart(host, sample, metric);
    const [svg, control, tooltip] = host.children;
    const dots = svg.children.filter(node => node.getAttribute('class') === 'stats-dot');
    const point = index => host.bounds.left + Number(dots[index].getAttribute('cx')) / 600 * width;
    assert.equal(tooltip.hidden, true);
    assert.equal(control.getAttribute('role'), 'slider');
    dispatch(control, 'pointermove', {clientX: point(1) + 4, pointerType: 'mouse'});
    assert.equal(tooltip.hidden, false, 'Hover near a day shows a tooltip without hitting its tiny dot');
    assert.equal(tooltip.children[0].textContent, 'Oct 12, 2026');
    assert.equal(tooltip.children[1].textContent, metric === 'visitors' ? '2,720 visitors' : '3,725 page views');
    assert.equal(control.getAttribute('aria-valuenow'), '1');
    assert.equal(svg.children.find(node => node.getAttribute('class') === 'stats-guide').getAttribute('visibility'), 'visible');
    dispatch(control, 'pointerleave', {pointerType: 'mouse'}); assert.equal(tooltip.hidden, true);
    dispatch(control, 'focus'); assert.equal(tooltip.hidden, false);
    assert.equal(dispatch(control, 'keydown', {key: 'Home'}).defaultPrevented, true);
    assert.equal(control.getAttribute('aria-valuenow'), '0');
    dispatch(control, 'keydown', {key: 'ArrowLeft'}); assert.equal(control.getAttribute('aria-valuenow'), '0');
    dispatch(control, 'keydown', {key: 'End'}); assert.equal(control.getAttribute('aria-valuenow'), '2');
    dispatch(control, 'keydown', {key: 'ArrowRight'}); assert.equal(control.getAttribute('aria-valuenow'), '2');
    dispatch(control, 'keydown', {key: 'ArrowLeft'}); assert.match(control.getAttribute('aria-valuetext'), /^Oct 12, 2026: /);
    dispatch(control, 'keydown', {key: 'Escape'}); assert.equal(tooltip.hidden, true);
    dispatch(control, 'pointerdown', {clientX: point(0), pointerType: 'touch'});
    assert.equal(control.getAttribute('aria-valuenow'), '0'); assert.equal(tooltip.hidden, false, 'Tap shows a value');
    dispatch(control, 'pointerleave', {pointerType: 'touch'}); assert.equal(tooltip.hidden, false, 'Touch value stays readable after finger lifts');
    dispatch(control, 'pointermove', {clientX: point(2), pointerType: 'touch'});
    assert.equal(control.getAttribute('aria-valuenow'), '0', 'Vertical touch scrolling must not scrub the chart');
    dispatch(control, 'blur'); assert.equal(tooltip.hidden, true);
    dispatch(control, 'pointermove', {clientX: point(2), pointerType: 'mouse'});
    assert.match(tooltip.style.left, /^clamp\(8px, /, 'Tooltip stays within the chart at its right edge');
    assert.match(tooltip.style.top, /^clamp\(8px, /, 'Tooltip stays within the chart vertically');
    chartContext.chart(host, sample.slice(0, 1), metric);
    dispatch(host.children[1], 'pointermove', {clientX: 100, pointerType: 'mouse'});
    assert.equal(host.children[1].getAttribute('aria-valuenow'), '0', 'Single-day series remains usable');
    chartContext.chart(host, [], metric); assert.equal(host.children.length, 1, 'Empty series has no invalid interactive range');
  }
}
console.log('Chart checks passed: measured large axis labels, full-plot hover, touch, keyboard, edge placement, and empty/single-day series.');
