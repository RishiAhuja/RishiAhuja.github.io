import type { MotionScope } from '../lib/motion';

export function mountHeader(scope: MotionScope) {
  const nav = document.querySelector<HTMLElement>('.site-nav');
  const toggle = nav?.querySelector<HTMLButtonElement>('.nav-toggle');
  const panel = nav?.querySelector<HTMLElement>('.nav-panel');
  const indicator = nav?.querySelector<HTMLElement>('.nav-indicator');
  if (!nav || !toggle || !panel) return () => {};
  const desktop = matchMedia('(min-width: 901px)');
  const { signal } = scope;
  let open = false;
  let panelAnimation: Animation | null = null;
  let blocked: { element: HTMLElement; inert: boolean }[] = [];
  let measureFrame = 0;
  let hoveredLink: HTMLElement | null = null;
  let focusedLink: HTMLElement | null = null;
  const navLinks = nav.querySelector<HTMLElement>('.nav-links');
  nav.dataset.menuReady = 'true';
  const restoreBackground = () => {
    blocked.forEach(({ element, inert }) => { element.inert = inert; });
    blocked = [];
    document.body.classList.remove('nav-open');
  };
  const setOpen = (next: boolean, restoreFocus = true, animate = true) => {
    panelAnimation?.cancel();
    open = next && !desktop.matches;
    nav.dataset.open = String(open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    panel.inert = !open && !desktop.matches;
    if (open) {
      panel.hidden = false;
      document.body.classList.add('nav-open');
      if (!blocked.length) {
        blocked = [...document.querySelectorAll<HTMLElement>('body > :is(main, footer, .skip-link)')].map((element) => ({ element, inert: element.inert }));
        blocked.forEach(({ element }) => { element.inert = true; });
      }
      if (animate) {
        panelAnimation = scope.play(panel, [{ opacity: 0 }, { opacity: 1 }], 160);
        const links = panel.querySelector('.nav-links');
        if (links) scope.play(links, [{ transform: 'translateY(-4px)' }, { transform: 'translateY(0)' }], 160);
      }
      panel.querySelector<HTMLAnchorElement>('a')?.focus({ preventScroll: true });
    } else {
      restoreBackground();
      if (restoreFocus && !desktop.matches) toggle.focus({ preventScroll: true });
      const hide = () => { panel.hidden = !desktop.matches; };
      if (animate && !desktop.matches && !panel.hidden) panelAnimation = scope.play(panel, [{ opacity: 1 }, { opacity: 0 }], 120, hide);
      else hide();
    }
  };
  setOpen(false, false, false);
  toggle.addEventListener('click', () => setOpen(!open), { signal });
  nav.addEventListener('keydown', (event) => {
    if (!open) return;
    if (event.key === 'Escape') { event.preventDefault(); setOpen(false); return; }
    if (event.key !== 'Tab') return;
    const focusable = [...nav.querySelectorAll<HTMLElement>('button, a[href]')].filter((element) => element.getClientRects().length > 0);
    const first = focusable[0], last = focusable.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
  }, { signal });
  nav.querySelectorAll<HTMLAnchorElement>('a').forEach((link) => link.addEventListener('click', (event) => {
    if (!open) return;
    // A navigation takes precedence over the closing animation.
    setOpen(false, false, false);
    if (link.hash && link.pathname === location.pathname && !event.metaKey && !event.ctrlKey) {
      const destination = document.getElementById(decodeURIComponent(link.hash.slice(1)));
      if (destination) { destination.tabIndex = -1; destination.focus({ preventScroll: true }); }
    } else toggle.focus({ preventScroll: true });
  }, { signal }));
  const measureIndicator = (animate = true) => {
    measureFrame = 0;
    if (!indicator) return;
    const active = nav.querySelector<HTMLElement>('.nav-links [data-active="true"]');
    const target = hoveredLink || focusedLink || active;
    if (!target || !desktop.matches) { indicator.hidden = true; return; }
    const instant = !animate || indicator.hidden;
    const item = target.getBoundingClientRect(), frame = nav.getBoundingClientRect();
    const baseline = (active || target).getBoundingClientRect().bottom;
    if (instant) indicator.style.transition = 'none';
    indicator.style.setProperty('--dot-x', `${item.left - frame.left + item.width / 2 - 4}px`);
    indicator.style.setProperty('--dot-y', `${baseline - frame.top - 8}px`);
    indicator.hidden = false;
    nav.dataset.indicatorReady = 'true';
    if (instant) {
      // Commit its initial position before enabling active-item movement.
      indicator.getBoundingClientRect();
      indicator.style.removeProperty('transition');
    }
  };
  const requestMeasure = () => {
    if (!measureFrame) measureFrame = requestAnimationFrame(() => measureIndicator());
  };
  // Preview hovered or focused links without changing the current page.
  navLinks?.querySelectorAll<HTMLElement>('[data-nav-id]').forEach((link) => {
    link.addEventListener('pointerenter', (event) => {
      if (!desktop.matches || event.pointerType === 'touch') return;
      hoveredLink = link;
      requestMeasure();
    }, { signal });
    link.addEventListener('focus', () => {
      hoveredLink = null;
      focusedLink = link;
      requestMeasure();
    }, { signal });
    link.addEventListener('blur', () => {
      focusedLink = null;
      requestMeasure();
    }, { signal });
  });
  navLinks?.addEventListener('pointerleave', () => {
    hoveredLink = null;
    requestMeasure();
  }, { signal });
  const resizeIndicator = () => { cancelAnimationFrame(measureFrame); measureIndicator(false); };
  measureIndicator(false);
  window.addEventListener('resize', resizeIndicator, { signal });
  desktop.addEventListener('change', () => { hoveredLink = null; focusedLink = null; setOpen(false, false, false); resizeIndicator(); }, { signal });
  document.fonts.ready.then(() => { if (!signal.aborted) resizeIndicator(); });
  scope.onCleanup(() => {
    cancelAnimationFrame(measureFrame);
    panelAnimation?.cancel();
    restoreBackground();
    nav.dataset.open = 'false';
    toggle.setAttribute('aria-expanded', 'false');
  });
  return () => setOpen(false, false, false);
}

// Keeps the header in reach: it slides away while you scroll down and comes
// back as soon as you scroll up, at the top of the page, or when a key moves
// focus into it. Exposes its shown height as --header-shown for sticky
// sidebars to clear it.
export function mountHeadroom(scope: MotionScope) {
  const header = document.querySelector<HTMLElement>('.site-header');
  if (!header) return;
  const root = document.documentElement;
  let last = Math.max(0, scrollY), frame = 0, hidden = false;
  const show = (next: boolean) => {
    if (hidden === !next) return;
    hidden = !next;
    header.toggleAttribute('data-hidden', hidden);
    root.style.setProperty('--header-shown', hidden ? '0px' : `${header.offsetHeight}px`);
  };
  const update = () => {
    frame = 0;
    const y = Math.max(0, scrollY), delta = y - last;
    header.toggleAttribute('data-scrolled', y > 4);
    // Small movements accumulate until they add up to a deliberate scroll.
    if (y <= header.offsetHeight || document.body.classList.contains('nav-open')) { show(true); last = y; }
    else if (delta > 8) { show(false); last = y; }
    else if (delta < -8) { show(true); last = y; }
  };
  hidden = true; show(true);
  update();
  addEventListener('scroll', () => { frame ||= requestAnimationFrame(update); }, { passive: true, signal: scope.signal });
  header.addEventListener('focusin', () => show(true), { signal: scope.signal });
  scope.onCleanup(() => { cancelAnimationFrame(frame); root.style.removeProperty('--header-shown'); });
}
