import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';
import { SITE_ORIGIN, ARCHIVE_ORIGIN } from '../src/lib/siteConfig.mjs';

const plan = JSON.parse(await readFile('docs/portfolio-domain-migration.json', 'utf8'));
const config = JSON.parse(await readFile('vercel.json', 'utf8'));
assert.equal(config.trailingSlash, false);
assert.equal(config.cleanUrls, true);
const bySource = new Map(config.redirects.map(rule => [rule.source, rule]));
assert.equal(bySource.size, config.redirects.length, 'Duplicate redirect sources');
for (const route of plan.routes) {
  if (route.behavior === '308') {
    const rule = bySource.get(route.source);
    assert.ok(rule, `Missing compatibility redirect: ${route.source}`);
    assert.equal(rule.permanent, true);
    assert.equal(new URL(rule.destination, plan.primaryOrigin).href, route.destination);
    assert.notEqual(new URL(rule.destination, plan.primaryOrigin).pathname === route.source && new URL(rule.destination, plan.primaryOrigin).origin === plan.primaryOrigin, true, `Redirect loop: ${route.source}`);
  } else {
    assert.ok(!bySource.has(route.source), `Existing page must remain available: ${route.source}`);
    await access(`dist${route.source === '/' ? '' : route.source}/index.html`);
  }
}
// Catch a broad archive redirect before it can swallow the new site or assets.
for (const source of ['/:path*', '/blurb/:path*', '/blurb/:slug', '/_astro/:path*', '/og/:path*', '/research/:path*', '/writings/:path*', '/pub/:path*']) {
  assert.ok(!bySource.has(source), `Unsafe archive catch-all: ${source}`);
}
const home = await readFile('dist/index.html', 'utf8');
for (const id of ['blog','education','contact']) assert.ok(home.includes(`id="${id}"`), `Missing legacy fragment: ${id}`);
const resume = await readFile('dist/resume/index.html', 'utf8');
assert.ok(resume.includes(`href="${ARCHIVE_ORIGIN}/resume"`), 'Engineering PDF link must use the old resolver, not the listing itself');
assert.ok(resume.includes(`href="${ARCHIVE_ORIGIN}/research/resume"`), 'Research PDF link must retain its resolver');
const sitemap = await readFile('dist/sitemap.xml', 'utf8');
assert.ok(sitemap.includes(`${SITE_ORIGIN}/resume`), 'Resume listing must remain discoverable');
assert.ok(sitemap.includes(SITE_ORIGIN), 'Sitemap must use the configured site origin');
// Exercise the actual browser handler with initial loads, hash changes and
// Astro page swaps, including query preservation and archive-loop prevention.
const fragmentSource = ts.transpileModule(await readFile('src/scripts/legacyFragments.ts','utf8'), {compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.None}}).outputText;
const fixture = (hash, pathname='/', origin='https://rishia.in') => {
  const destination = [];
  const document = Object.assign(new EventTarget(), {readyState:'complete',body:{dataset:{archiveOrigin:'https://archive.rishia.in'}}});
  const window = new EventTarget();
  const location = {hash,pathname,origin,search:'?ref=old-link',replace:url=>destination.push(url)};
  runInNewContext(fragmentSource, {document, window, location, URL, Set});
  return {destination,document,window,location};
};
for (const section of ['papers','upstream','sidequests']) assert.deepEqual(fixture(`#${section}`).destination, [`https://archive.rishia.in/?ref=old-link#${section}`]);
for (const section of ['about','blog','education','contact','experience','writings']) assert.equal(fixture(`#${section}`).destination.length,0);
assert.equal(fixture('#papers','/research').destination.length,0);
assert.equal(fixture('#papers','/','https://archive.rishia.in').destination.length,0);
const changed = fixture('#about'); changed.location.hash='#upstream'; changed.window.dispatchEvent(new Event('hashchange')); assert.equal(changed.destination.length,1);
const swapped = fixture('#about'); swapped.location.hash='#papers'; swapped.document.dispatchEvent(new Event('astro:page-load')); assert.equal(swapped.destination.length,1);
console.log(`Verified ${plan.routes.length} migration URLs, PDF targets, legacy fragments, and ${config.redirects.length} redirect rules.`);

// Pass a deployment origin to exercise Vercel's real HTTP routing. External
// archive destinations are checked as Locations until its domain is attached.
const urlIndex = process.argv.indexOf('--url');
if (urlIndex >= 0) {
  const deployment = new URL(process.argv[urlIndex + 1]).origin;
  let completed = 0;
  const queue = plan.routes.flatMap(route => [route.source, ...(route.source === '/' ? [] : [route.source + '/'])].map(path => ({route,path})));
  const failures = [];
  async function worker() {
    while (queue.length) {
      const {route,path} = queue.shift();
      const query = '?migration_check=1';
      const expected = new URL(route.destination, deployment);
      if (expected.origin === plan.primaryOrigin) expected.host = new URL(deployment).host;
      expected.search = query;
      let requestURL = new URL(path + query, deployment);
      try {
        for (let hop=0;hop<4;hop++) {
          const response = await fetch(requestURL, {method:'HEAD',redirect:'manual',signal:AbortSignal.timeout(30000)});
          const location = response.headers.get('location');
          if (route.behavior === 'serve' && response.status === 200) {assert.equal(requestURL.pathname,route.source); completed++; break;}
          assert.equal(response.status,308, `${path}: expected ${route.behavior === 'serve' ? '200 or normalization 308' : '308'}, received ${response.status}`);
          assert.ok(location, `${path}: missing Location`);
          const next = new URL(location,requestURL);
          if (route.behavior === '308' && next.href === expected.href) {completed++; break;}
          assert.equal(next.origin,deployment, `${path}: unexpected destination ${next.href}`);
          assert.equal(next.search,query, `${path}: query lost`);
          assert.notEqual(next.href,requestURL.href, `${path}: redirect loop`);
          requestURL=next;
          if(hop===3) throw new Error(`${path}: too many redirect hops`);
        }
      } catch(error) { failures.push(error.message); }
    }
  }
  await Promise.all(Array.from({length:6},worker));
  if (failures.length) throw new Error(failures.join('\n'));
  console.log(`Verified ${completed} deployed HEAD requests, including slash variants and query preservation, at ${deployment}.`);
}
