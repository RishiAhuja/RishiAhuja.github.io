import { MotionScope } from '../lib/motion';
import { mountHeader } from './motionHeader';
import { mountCarousels } from './motionCarousels';
import { mountContents, mountUpdates } from './motionDisclosures';
import { mountCitation, mountReadingFeedback } from './motionReading';

type NavigationEvent = Event & {
  signal: AbortSignal; from: URL; to: URL; navigationType: string; sourceElement?: Element;
  newDocument: Document; viewTransition?: { finished: Promise<void>; skipTransition(): void };
};
let scope: MotionScope | null = null;
let body: HTMLElement | null = null;
let closeMenu = () => {};
let focusDestination = false;
let pairedCover: { old: HTMLElement; next: HTMLElement } | null = null;
let preparation: NavigationEvent | null = null;
const warmed = new Set<string>();

const visible = (element: HTMLElement) => {
  const rect = element.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0 && rect.bottom > 0 && rect.top < innerHeight && rect.right > 0 && rect.left < innerWidth;
};
const clearCover = () => {
  pairedCover?.old.style.removeProperty('view-transition-name');
  pairedCover?.next.style.removeProperty('view-transition-name');
  pairedCover = null;
};
const mountPage = () => {
  if (body === document.body) return;
  scope?.dispose();
  body = document.body;
  scope = new MotionScope();
  closeMenu = mountHeader(scope);
  mountCarousels(scope);
  mountContents(scope);
  mountUpdates(scope);
  mountCitation(scope);
  mountReadingFeedback(scope);
  const { signal } = scope;
  const fromTarget = (target: EventTarget | null) => {
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
    if (connection?.saveData || connection?.effectiveType?.includes('2g') || !(target instanceof Element)) return;
    const host = target.closest<HTMLElement>('[data-cover-prefetch]');
    const url = host?.dataset.coverPrefetch;
    if (!url || warmed.has(url) || document.querySelector(`link[href="${url}"]`)) return;
    warmed.add(url);
    const link = document.createElement('link'); link.rel = 'prefetch'; link.as = 'image'; link.href = url;
    document.head.append(link);
  };
  document.addEventListener('pointerenter', (event) => fromTarget(event.target), { capture: true, signal });
  document.addEventListener('focusin', (event) => fromTarget(event.target), { signal });
  document.addEventListener('touchstart', (event) => fromTarget(event.target), { capture: true, passive: true, signal });
};
document.addEventListener('astro:before-preparation', (event) => {
  const navigation = event as NavigationEvent;
  preparation = navigation;
  closeMenu();
  document.querySelectorAll('video').forEach((video) => video.pause());
  focusDestination = navigation.navigationType !== 'traverse';
});
document.addEventListener('astro:after-preparation', () => {
  clearCover();
  // Astro 4's after-preparation notification is a plain Event. The before
  // event retains the document populated by its loader, before snapshots run.
  const navigation = preparation;
  if (!navigation || navigation.signal.aborted || scope?.reduced) return;
  const source = navigation.sourceElement;
  const old = source?.closest('article')?.querySelector<HTMLElement>('[data-cover-id]')
    || document.querySelector<HTMLElement>('.project-hero-cover [data-cover-id]');
  const id = old?.dataset.coverId;
  if (!old || !id || !visible(old)) return;
  const next = [...navigation.newDocument.querySelectorAll<HTMLElement>('[data-cover-id]')].find((cover) => cover.dataset.coverId === id);
  if (!next) return;
  old.style.viewTransitionName = next.style.viewTransitionName = `cover-${id}`;
  pairedCover = { old, next };
  navigation.signal?.addEventListener('abort', clearCover, { once: true });
});
document.addEventListener('astro:before-swap', (event) => {
  const navigation = event as NavigationEvent;
  preparation = null;
  if (scope?.reduced) navigation.viewTransition?.skipTransition();
  scope?.dispose(); scope = null; body = null;
  const pair = pairedCover;
  navigation.viewTransition?.finished.finally(() => {
    if (pair === pairedCover) clearCover();
  }).catch(() => {});
});
document.addEventListener('astro:after-swap', () => {
  // An off-screen destination cover should not fly into or out of the viewport.
  if (pairedCover && !visible(pairedCover.next)) pairedCover.next.style.removeProperty('view-transition-name');
  if (!focusDestination) return;
  const destination = location.hash ? document.getElementById(decodeURIComponent(location.hash.slice(1))) : document.getElementById('main-content');
  if (destination) { destination.tabIndex = -1; destination.focus({ preventScroll: true }); }
  focusDestination = false;
});
document.addEventListener('astro:page-load', mountPage);
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mountPage, { once: true });
else mountPage();
