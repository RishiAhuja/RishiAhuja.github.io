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
  const cover = () => ({ dataset: { coverId: 'research-example' }, style: { viewTransitionName: '', removeProperty() { this.viewTransitionName = ''; } }, getBoundingClientRect: () => ({ width: 100, height: 130, left: 20, right: 120, top: 20, bottom: 150 }) });
  const old = cover(), next = cover(), finished = deferred(); let focused = 0;
  const main = { focus() { focused++; } };
  const document = Object.assign(new EventTarget(), {
    readyState: 'loading', body: {},
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
    event.newDocument = { querySelectorAll: () => [next] };
    document.dispatchEvent(new Event('astro:after-preparation'));
    return controller;
  };
  const swap = () => {
    document.dispatchEvent(Object.assign(new Event('astro:before-swap'), { viewTransition: { finished: finished.promise } }));
    document.dispatchEvent(new Event('astro:after-swap'));
  };
  return { document, old, next, finished, prepare, swap, focused: () => focused };
}
await test('Astro plain after-preparation notifications pair the loaded cover safely', async () => {
  const fixture = await navigationFixture(); fixture.prepare();
  assert.equal(fixture.old.style.viewTransitionName, 'cover-research-example');
  assert.equal(fixture.next.style.viewTransitionName, 'cover-research-example');
  fixture.swap(); assert.equal(fixture.focused(), 1);
  // Keep names until the native snapshots finish, then remove both.
  assert.equal(fixture.next.style.viewTransitionName, 'cover-research-example');
  fixture.finished.resolve(); await flush(); assert.equal(fixture.old.style.viewTransitionName, ''); assert.equal(fixture.next.style.viewTransitionName, '');
});
await test('Back navigation preserves focus and native scroll restoration', async () => {
  const fixture = await navigationFixture(); fixture.prepare('traverse'); fixture.swap();
  assert.equal(fixture.focused(), 0); fixture.finished.resolve(); await flush();
});
await test('aborted navigation removes temporary cover names', async () => {
  const fixture = await navigationFixture(), controller = fixture.prepare(); controller.abort();
  assert.equal(fixture.old.style.viewTransitionName, ''); assert.equal(fixture.next.style.viewTransitionName, '');
});
console.log(`Motion verification passed: ${passed} checks.`);
