import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import ts from 'typescript';

const source = await readFile(new URL('../src/lib/motion.ts', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext } });
const { MotionScope, latestRequest, motionDuration, MAX_MOTION_MS } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);
const deferred = () => { let resolve, reject; const promise = new Promise((yes, no) => { resolve = yes; reject = no; }); return { promise, resolve, reject }; };
class Media extends EventTarget {
  matches = false;
  reduce() { this.matches = true; this.dispatchEvent(new Event('change')); }
}
class Animation {
  done = deferred(); finished = this.done.promise; cancelled = false; ended = false;
  finish() { this.ended = true; this.done.resolve(); }
  cancel() { this.cancelled = true; this.done.reject(new Error('cancelled')); }
}
const flush = async () => { await Promise.resolve(); await Promise.resolve(); };
let passed = 0;
const test = async (name, run) => { await run(); passed++; console.log(`✓ ${name}`); };

await test('all scripted feedback is bounded and reduced motion is immediate', () => {
  assert.equal(MAX_MOTION_MS, 200);
  assert.equal(motionDuration(700, false), 200);
  assert.equal(motionDuration(-5, false), 0);
  assert.equal(motionDuration(160, true), 0);
});
await test('rapid carousel requests commit only the newest decoded image', async () => {
  const request = latestRequest(new AbortController().signal), first = deferred(), second = deferred(), seen = [];
  const old = request(() => first.promise, value => seen.push(value));
  const next = request(() => second.promise, value => seen.push(value));
  second.resolve('new'); assert.equal(await next, true);
  first.resolve('old'); assert.equal(await old, false);
  assert.deepEqual(seen, ['new']);
});
await test('an older image can finish before the latest without briefly flashing', async () => {
  const request = latestRequest(new AbortController().signal), first = deferred(), second = deferred(), seen = [];
  const old = request(() => first.promise, value => seen.push(value));
  const next = request(() => second.promise, value => seen.push(value));
  first.resolve('old'); assert.equal(await old, false); assert.deepEqual(seen, []);
  second.resolve('new'); await next; assert.deepEqual(seen, ['new']);
});
await test('a stale failed image cannot change the latest slide or error message', async () => {
  const request = latestRequest(new AbortController().signal), first = deferred(), seen = [];
  const old = request(() => first.promise, value => seen.push(value), () => seen.push('error'));
  await request(async () => 'new', value => seen.push(value));
  first.reject(new Error('network')); await old; assert.deepEqual(seen, ['new']);
});
await test('the latest image failure remains recoverable', async () => {
  const request = latestRequest(new AbortController().signal), seen = [];
  assert.equal(await request(async () => { throw new Error('network'); }, () => seen.push('bad'), () => seen.push('retry')), false);
  await request(async () => 'recovered', value => seen.push(value)); assert.deepEqual(seen, ['retry', 'recovered']);
});
await test('leaving a page suppresses pending image success and error callbacks', async () => {
  const controller = new AbortController(), request = latestRequest(controller.signal), image = deferred(), seen = [];
  const pending = request(() => image.promise, value => seen.push(value), () => seen.push('error'));
  controller.abort(); image.resolve('late'); await pending;
  await request(async () => { throw new Error('late error'); }, () => {}, () => seen.push('error'));
  assert.deepEqual(seen, []);
});
await test('reduced motion retains disclosure completion without creating animations', () => {
  const media = new Media(); media.matches = true;
  const scope = new MotionScope(media); let completed = 0;
  assert.equal(scope.play({ animate: () => { throw new Error('must not animate'); } }, [], 160, () => completed++), null);
  assert.equal(completed, 1); scope.dispose();
});
await test('turning reduced motion on finishes running feedback immediately', async () => {
  const media = new Media(), scope = new MotionScope(media), animation = new Animation(); let completed = 0;
  scope.play({ animate: (_, options) => { assert.equal(options.duration, 200); return animation; } }, [], 400, () => completed++);
  media.reduce(); await flush(); assert.equal(animation.ended, true); assert.equal(completed, 1); scope.dispose();
});
await test('page disposal cancels effects, removes listeners, and runs cleanup once', async () => {
  const media = new Media(), scope = new MotionScope(media), animation = new Animation(), target = new EventTarget();
  let events = 0, completed = 0; const cleaned = [];
  target.addEventListener('test', () => events++, { signal: scope.signal });
  scope.onCleanup(() => cleaned.push('first')); scope.onCleanup(() => cleaned.push('second'));
  scope.play({ animate: () => animation }, [], 140, () => completed++);
  target.dispatchEvent(new Event('test')); scope.dispose(); scope.dispose();
  target.dispatchEvent(new Event('test')); media.reduce(); await flush();
  assert.equal(scope.signal.aborted, true); assert.equal(animation.cancelled, true); assert.equal(animation.ended, false);
  assert.equal(events, 1); assert.equal(completed, 0); assert.deepEqual(cleaned, ['second', 'first']);
  assert.equal(scope.play({ animate: () => { throw new Error('disposed'); } }, [], 100), null);
});
await test('unsupported animation APIs preserve immediate interaction behaviour', () => {
  const scope = new MotionScope(new Media()); let completed = false;
  scope.play({}, [], 120, () => { completed = true; }); assert.equal(completed, true); scope.dispose();
});

// Exercise the real routing handlers against Astro 4's event sequence: its
// before events carry the loaded document; after-preparation is a plain Event.
const routingSource = await readFile(new URL('../src/scripts/siteMotion.ts', import.meta.url), 'utf8');
const routingJS = ts.transpileModule(routingSource.replace(/^import .*;\n/gm, ''), { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext } }).outputText;
let fixtureCount = 0;
async function navigationFixture() {
  const root = () => ({ style: { values: {}, setProperty(name, value) { this.values[name] = value; }, getPropertyValue(name) { return this.values[name] || ''; }, removeProperty(name) { delete this.values[name]; } } });
  const oldRoot = root(), nextRoot = root();
  const cover = () => ({ dataset: { coverId: 'research-example' }, style: { viewTransitionName: '', removeProperty() { this.viewTransitionName = ''; } }, getBoundingClientRect: () => ({ width: 100, height: 130, left: 20, right: 120, top: 20, bottom: 150 }) });
  const old = cover(), next = cover(), finished = deferred(); let focused = 0;
  const main = { focus() { focused++; } };
  const document = Object.assign(new EventTarget(), {
    readyState: 'loading', body: {}, documentElement: oldRoot,
    querySelectorAll: () => [], querySelector: () => old,
    getElementById: () => main,
  });
  const context = { document, innerWidth: 800, innerHeight: 600, location: { hash: '' }, MotionScope,
    mountHeader: () => () => {}, mountCarousels() {}, mountContents() {}, mountUpdates() {}, mountCitation() {}, mountReadingFeedback() {},
  };
  globalThis.__motionFixture = context;
  const prefix = `const {${Object.keys(context).join(',')}} = globalThis.__motionFixture;\n`;
  await import(`data:text/javascript;base64,${Buffer.from(prefix + routingJS + `\n// fixture ${++fixtureCount}`).toString('base64')}`);
  delete globalThis.__motionFixture;
  const prepare = (navigationType = 'push') => {
    const controller = new AbortController();
    const event = Object.assign(new Event('astro:before-preparation'), { navigationType, signal: controller.signal, newDocument: document });
    document.dispatchEvent(event);
    event.newDocument = { querySelectorAll: () => [next], documentElement: nextRoot };
    document.dispatchEvent(new Event('astro:after-preparation'));
    return controller;
  };
  const swap = () => {
    document.dispatchEvent(Object.assign(new Event('astro:before-swap'), { viewTransition: { finished: finished.promise } }));
    document.dispatchEvent(new Event('astro:after-swap'));
  };
  return { document, old, next, oldRoot, nextRoot, finished, prepare, swap, focused: () => focused };
}
await test('Astro plain after-preparation notifications pair the loaded cover safely', async () => {
  const fixture = await navigationFixture(); fixture.prepare();
  assert.equal(fixture.old.style.viewTransitionName, 'cover-research-example');
  assert.equal(fixture.next.style.viewTransitionName, 'cover-research-example');
  assert.equal(fixture.oldRoot.style.getPropertyValue('--shared-cover-duration'), '300ms');
  assert.equal(fixture.nextRoot.style.getPropertyValue('--shared-cover-duration'), '300ms');
  fixture.swap(); assert.equal(fixture.focused(), 1);
  // Keep names until the native snapshots finish, then remove both.
  assert.equal(fixture.next.style.viewTransitionName, 'cover-research-example');
  fixture.finished.resolve(); await flush(); assert.equal(fixture.old.style.viewTransitionName, ''); assert.equal(fixture.next.style.viewTransitionName, '');
  assert.equal(fixture.oldRoot.style.getPropertyValue('--shared-cover-duration'), ''); assert.equal(fixture.nextRoot.style.getPropertyValue('--shared-cover-duration'), '');
});
await test('Back navigation preserves focus and native scroll restoration', async () => {
  const fixture = await navigationFixture(); fixture.prepare('traverse'); fixture.swap();
  assert.equal(fixture.focused(), 0); fixture.finished.resolve(); await flush();
});
await test('aborted navigation removes temporary cover names', async () => {
  const fixture = await navigationFixture(), controller = fixture.prepare(); controller.abort();
  assert.equal(fixture.old.style.viewTransitionName, ''); assert.equal(fixture.next.style.viewTransitionName, '');
  assert.equal(fixture.oldRoot.style.getPropertyValue('--shared-cover-duration'), ''); assert.equal(fixture.nextRoot.style.getPropertyValue('--shared-cover-duration'), '');
});
// The indicator previews a destination without changing the selected route.
const headerSource = await readFile(new URL('../src/scripts/motionHeader.ts', import.meta.url), 'utf8');
const headerJS = ts.transpileModule(headerSource, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext } }).outputText;
let headerFixtureCount = 0;
async function headerFixture(activeId = 'home') {
  class Element extends EventTarget {
    dataset = {}; hidden = false; inert = false;
    attributes = new Map();
    style = { values: {}, setProperty(name, value) { this.values[name] = value; }, removeProperty(name) { delete this.values[name]; } };
    constructor(rect = { left: 0, top: 0, width: 0, bottom: 0 }) { super(); this.rect = rect; }
    setAttribute(name, value) { this.attributes.set(name, value); }
    getAttribute(name) { return this.attributes.get(name); }
    removeAttribute(name) { this.attributes.delete(name); }
    getBoundingClientRect() { return this.rect; }
    querySelector() { return null; }
    querySelectorAll() { return []; }
  }
  const nav = new Element({ left: 0, top: 0, width: 600, bottom: 60 });
  const toggle = new Element(), panel = new Element(), indicator = new Element(), list = new Element();
  indicator.hidden = true;
  const links = ['home', 'research', 'writings'].map((id, i) => {
    const link = new Element({ left: 20 + i * 160, top: 20, width: 80, bottom: 60 });
    link.dataset = { navId: id, active: String(id === activeId) };
    if (id === activeId) link.setAttribute('aria-current', 'page');
    return link;
  });
  list.querySelectorAll = () => links;
  nav.querySelector = (selector) => ({ '.nav-toggle': toggle, '.nav-panel': panel, '.nav-indicator': indicator, '.nav-links': list })[selector]
    || (selector.includes('[data-active="true"]') ? links.find(link => link.dataset.active === 'true') : null);
  nav.querySelectorAll = () => links;
  const document = {
    querySelector: () => nav,
    querySelectorAll: () => [],
    body: { classList: { remove() {} } },
    fonts: { ready: Promise.resolve() },
  };
  const desktop = new Media(); desktop.matches = true;
  const frames = new Map(); let frameId = 0;
  const context = {
    document, window: new EventTarget(), location: { pathname: '/research' },
    matchMedia: () => desktop,
    requestAnimationFrame: callback => { frames.set(++frameId, callback); return frameId; },
    cancelAnimationFrame: id => frames.delete(id),
  };
  globalThis.__headerFixture = context;
  const prefix = `const {${Object.keys(context).join(',')}} = globalThis.__headerFixture;\n`;
  const { mountHeader } = await import(`data:text/javascript;base64,${Buffer.from(prefix + headerJS + `\n// header fixture ${++headerFixtureCount}`).toString('base64')}`);
  delete globalThis.__headerFixture;
  const scope = new MotionScope(new Media());
  mountHeader(scope); await flush();
  const measure = () => { const pending = [...frames.values()]; frames.clear(); pending.forEach(callback => callback()); };
  const enter = (link, pointerType = 'mouse') => { link.dispatchEvent(Object.assign(new Event('pointerenter'), { pointerType })); measure(); };
  return { links, list, indicator, scope, frames, measure, enter };
}

await test('navigation hover and keyboard focus preview links without changing the active route', async () => {
  const fixture = await headerFixture(), [home, research, writing] = fixture.links;
  const position = () => fixture.indicator.style.values['--dot-x'];
  const baseline = fixture.indicator.style.values['--dot-y'];
  assert.equal(position(), '56px');
  fixture.enter(research); assert.equal(position(), '216px');
  fixture.enter(writing); assert.equal(position(), '376px');
  assert.equal(fixture.indicator.style.values['--dot-y'], baseline);
  assert.equal(home.getAttribute('aria-current'), 'page');
  assert.equal(research.getAttribute('aria-current'), undefined);
  fixture.list.dispatchEvent(new Event('pointerleave')); fixture.measure();
  assert.equal(position(), '56px');
  research.dispatchEvent(new Event('focus')); fixture.measure(); assert.equal(position(), '216px');
  research.dispatchEvent(new Event('blur')); fixture.measure(); assert.equal(position(), '56px');
  fixture.enter(writing, 'touch'); assert.equal(position(), '56px');
  fixture.scope.dispose();
});

await test('hover previews end cleanly on unselected pages and after page disposal', async () => {
  const fixture = await headerFixture('none');
  assert.equal(fixture.indicator.hidden, true);
  fixture.enter(fixture.links[1]); assert.equal(fixture.indicator.hidden, false);
  fixture.list.dispatchEvent(new Event('pointerleave')); fixture.measure();
  assert.equal(fixture.indicator.hidden, true);
  fixture.links[2].dispatchEvent(Object.assign(new Event('pointerenter'), { pointerType: 'mouse' }));
  assert.ok(fixture.frames.size > 0);
  fixture.scope.dispose(); assert.equal(fixture.frames.size, 0);
  fixture.enter(fixture.links[0]); assert.equal(fixture.indicator.hidden, true);
});

console.log(`Motion verification passed: ${passed} checks.`);
