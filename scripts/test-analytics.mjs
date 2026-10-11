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
