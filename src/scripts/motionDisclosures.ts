import type { MotionScope } from '../lib/motion';

export function mountUpdates(scope: MotionScope) {
  const toggle = document.querySelector<HTMLButtonElement>('.updates-toggle');
  const list = document.getElementById('updates-list');
  const extra = [...document.querySelectorAll<HTMLElement>('[data-extra-update]')];
  if (!toggle || !list || !extra.length) return;
  const { signal } = scope;
  let animation: Animation | null = null;
  toggle.hidden = false;
  toggle.addEventListener('click', () => {
    const before = list.getBoundingClientRect().height;
    animation?.cancel();
    const expanded = toggle.getAttribute('aria-expanded') !== 'true';
    extra.forEach((row) => { row.hidden = !expanded; });
    toggle.setAttribute('aria-expanded', String(expanded));
    toggle.querySelector('span')!.textContent = expanded ? 'Show less' : `Show ${extra.length} more`;
    toggle.querySelector('.toggle-arrow')!.textContent = expanded ? '↑' : '↓';
    const after = list.getBoundingClientRect().height;
    list.style.overflow = 'clip';
    animation = scope.play(list, [{ height: `${before}px` }, { height: `${after}px` }], 180, () => {
      list.style.removeProperty('overflow');
      if (!expanded) toggle.scrollIntoView({ block: 'nearest', behavior: 'instant' });
    });
    if (expanded) extra.forEach((row) => scope.play(row, [{ opacity: .6 }, { opacity: 1 }], 120));
  }, { signal });
  scope.onCleanup(() => { animation?.cancel(); list.style.removeProperty('overflow'); });
}

export function mountContents(scope: MotionScope) {
  const toc = document.querySelector<HTMLElement>('.toc');
  const disclosure = toc?.querySelector<HTMLDetailsElement>('details');
  const summary = disclosure?.querySelector('summary');
  const navigation = disclosure?.querySelector('nav');
  if (!toc || !disclosure || !summary || !navigation) return;
  const { signal } = scope;
  const desktop = matchMedia('(min-width: 1100px)');
  let expanded = desktop.matches, animation: Animation | null = null;
  disclosure.open = expanded;
  const finish = () => { disclosure.open = expanded; disclosure.style.removeProperty('overflow'); };
  const setExpanded = (next: boolean, animate = true) => {
    const before = disclosure.getBoundingClientRect().height;
    animation?.cancel();
    expanded = next;
    disclosure.open = next;
    navigation.inert = !next;
    const after = disclosure.getBoundingClientRect().height;
    if (!animate || scope.reduced) { finish(); return; }
    disclosure.open = true;
    disclosure.style.overflow = 'clip';
    animation = scope.play(disclosure, [{ height: `${before}px` }, { height: `${after}px` }], 160, finish);
  };
  navigation.inert = !expanded;
  summary.addEventListener('click', (event) => { if (!desktop.matches) { event.preventDefault(); setExpanded(!expanded); } }, { signal });
  desktop.addEventListener('change', () => setExpanded(desktop.matches, false), { signal });
  const links = [...toc.querySelectorAll<HTMLAnchorElement>('a[href^="#"]')];
  const headings = links.map((link) => document.getElementById(decodeURIComponent(link.hash.slice(1)))).filter((node): node is HTMLElement => Boolean(node));
  const setActive = (id: string) => {
    links.forEach((link) => link.removeAttribute('aria-current'));
    toc.querySelectorAll('.is-current').forEach((node) => node.classList.remove('is-current'));
    const active = links.find((link) => link.hash === `#${id}`);
    active?.setAttribute('aria-current', 'location'); active?.closest('.toc-list > li')?.classList.add('is-current');
  };
  const observer = new IntersectionObserver((entries) => {
    const current = entries.filter((entry) => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0]?.target.id;
    if (current) setActive(current);
  }, { rootMargin: '0px 0px -72% 0px', threshold: 0 });
  headings.forEach((heading) => observer.observe(heading));
  if (headings[0]) setActive(headings[0].id);
  links.forEach((link) => link.addEventListener('click', (event) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const heading = document.getElementById(decodeURIComponent(link.hash.slice(1)));
    if (!desktop.matches) setExpanded(false, false);
    if (heading) { heading.tabIndex = -1; heading.focus({ preventScroll: true }); }
  }, { signal }));
  scope.onCleanup(() => { observer.disconnect(); animation?.cancel(); disclosure.style.removeProperty('overflow'); });
}
