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
      panel.querySelector<HTMLAnchorElement>('a')?.focus();
    } else {
      restoreBackground();
      if (restoreFocus && !desktop.matches) toggle.focus();
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
    } else toggle.focus();
  }, { signal }));
  const measureIndicator = (animate = true) => {
    measureFrame = 0;
    if (!indicator) return;
    const active = nav.querySelector<HTMLElement>('.nav-links [data-active="true"]');
    if (!active || !desktop.matches) { indicator.hidden = true; return; }
    const instant = !animate || indicator.hidden;
    const item = active.getBoundingClientRect(), frame = nav.getBoundingClientRect();
    if (instant) indicator.style.transition = 'none';
    indicator.style.setProperty('--dot-x', `${item.left - frame.left + item.width / 2 - 4}px`);
    indicator.style.setProperty('--dot-y', `${item.bottom - frame.top - 8}px`);
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
  const resizeIndicator = () => { cancelAnimationFrame(measureFrame); measureIndicator(false); };
  measureIndicator(false);
  window.addEventListener('resize', resizeIndicator, { signal });
  desktop.addEventListener('change', () => { setOpen(false, false, false); resizeIndicator(); }, { signal });
  if (location.pathname === '/') {
    const sections = ['home', 'research', 'writings', 'about'].map((id) => document.getElementById(id)).filter((node): node is HTMLElement => Boolean(node));
    const observer = new IntersectionObserver((entries) => {
      const current = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]?.target.id;
      if (!current) return;
      nav.querySelectorAll<HTMLElement>('[data-nav-id]').forEach((link) => {
        const selected = link.dataset.navId === current;
        link.dataset.active = String(selected);
        if (selected) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current');
      });
      requestMeasure();
    }, { rootMargin: '-20% 0px -55% 0px', threshold: 0 });
    sections.forEach((section) => observer.observe(section));
    scope.onCleanup(() => observer.disconnect());
  }
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
