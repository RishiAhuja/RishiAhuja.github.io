import { latestRequest, type MotionScope } from '../lib/motion';

export function mountCarousels(scope: MotionScope) {
  const warmed = new Set<string>();
  const { signal } = scope;
  document.querySelectorAll<HTMLElement>('.media-carousel').forEach((carousel) => {
    const images: { src: string; alt: string }[] = JSON.parse(carousel.dataset.images || '[]');
    const photo = carousel.querySelector<HTMLImageElement>('img');
    const frame = carousel.querySelector<HTMLElement>('.blurb-media-frame');
    if (!photo || !frame || images.length < 2) return;
    carousel.dataset.ready = 'true';
    const request = latestRequest(signal);
    let current = 0, requested = 0, nearby = false, startX: number | null = null, startY = 0;
    let outgoing: HTMLImageElement | null = null, fade: Animation | null = null;
    const warmNeighbours = () => {
      const connection = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
      if (!nearby || connection?.saveData || connection?.effectiveType?.includes('2g')) return;
      [current - 1, current + 1].forEach((index) => {
        const src = images[(index + images.length) % images.length].src;
        if (warmed.has(src)) return;
        warmed.add(src);
        const image = new Image(); image.decoding = 'async'; image.src = src;
      });
    };
    const show = (index: number) => {
      requested = (index + images.length) % images.length;
      const target = requested;
      nearby = true;
      carousel.setAttribute('aria-busy', 'true');
      request(async () => {
        const image = new Image(); image.decoding = 'async'; image.src = images[target].src;
        await image.decode();
        return image;
      }, () => {
        fade?.cancel(); outgoing?.remove(); outgoing = null;
        if (!scope.reduced && photo.complete && current !== target) {
          outgoing = photo.cloneNode() as HTMLImageElement;
          outgoing.classList.add('carousel-outgoing'); outgoing.alt = ''; outgoing.setAttribute('aria-hidden', 'true');
          frame.appendChild(outgoing);
        }
        current = target;
        photo.src = images[current].src; photo.alt = images[current].alt;
        carousel.removeAttribute('aria-busy');
        const old = outgoing;
        if (old) fade = scope.play(old, [{ opacity: 1 }, { opacity: 0 }], 140, () => { old.remove(); if (outgoing === old) outgoing = null; });
        const counter = carousel.querySelector('.carousel-counter');
        if (counter) counter.textContent = `${current + 1} / ${images.length}`;
        carousel.querySelectorAll<HTMLElement>('[data-slide]').forEach((dot) => {
          if (Number(dot.dataset.slide) === current) dot.setAttribute('aria-current', 'true'); else dot.removeAttribute('aria-current');
        });
        if (!carousel.dataset.caption) {
          const caption = carousel.querySelector('figcaption');
          if (caption) caption.textContent = images[current].alt;
        }
        const announcement = carousel.querySelector('.carousel-announcement');
        if (announcement) announcement.textContent = `Image ${current + 1} of ${images.length}: ${images[current].alt}`;
        warmNeighbours();
      }, () => {
        requested = current;
        carousel.removeAttribute('aria-busy');
        const announcement = carousel.querySelector('.carousel-announcement');
        if (announcement) announcement.textContent = 'This image could not load. Please try again.';
      });
    };
    carousel.querySelectorAll<HTMLElement>('[data-direction]').forEach((button) => button.addEventListener('click', () => show(requested + Number(button.dataset.direction)), { signal }));
    carousel.querySelectorAll<HTMLElement>('[data-slide]').forEach((button) => button.addEventListener('click', () => show(Number(button.dataset.slide)), { signal }));
    carousel.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); show(requested + (event.key === 'ArrowLeft' ? -1 : 1)); }
      else if (event.key === 'Home' || event.key === 'End') { event.preventDefault(); show(event.key === 'Home' ? 0 : images.length - 1); }
    }, { signal });
    frame.addEventListener('touchstart', (event) => { startX = event.touches[0].clientX; startY = event.touches[0].clientY; }, { passive: true, signal });
    frame.addEventListener('touchend', (event) => {
      if (startX === null) return;
      const delta = event.changedTouches[0].clientX - startX, vertical = event.changedTouches[0].clientY - startY;
      startX = null;
      if (Math.abs(delta) >= 40 && Math.abs(delta) > Math.abs(vertical)) show(requested + (delta > 0 ? -1 : 1));
    }, { passive: true, signal });
    frame.addEventListener('touchcancel', () => { startX = null; }, { passive: true, signal });
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) { nearby = true; warmNeighbours(); observer.disconnect(); }
    }, { rootMargin: '250px' });
    observer.observe(carousel);
    scope.onCleanup(() => { observer.disconnect(); fade?.cancel(); outgoing?.remove(); });
  });
}
