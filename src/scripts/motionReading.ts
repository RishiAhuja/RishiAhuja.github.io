import type { MotionScope } from '../lib/motion';

export function mountReadingFeedback(scope: MotionScope) {
  const { signal } = scope;
  document.querySelectorAll<HTMLImageElement>('.blog-image, .blurb-content figure > .blurb-media-frame > img').forEach((image) => {
    if (image.complete || image.closest('.media-carousel')) return;
    image.addEventListener('load', () => scope.play(image, [{ opacity: .75 }, { opacity: 1 }], 110), { once: true, signal });
  });
  document.querySelectorAll<HTMLVideoElement>('.blurb-media-video[poster]').forEach((video) => {
    let poster: HTMLImageElement | null = null;
    const removePoster = () => { poster?.remove(); poster = null; };
    video.addEventListener('play', () => {
      if (scope.reduced || !video.poster || video.readyState >= 3) return;
      poster = new Image(); poster.src = video.poster; poster.alt = ''; poster.setAttribute('aria-hidden', 'true');
      poster.className = 'video-poster-fade';
      video.parentElement?.append(poster);
    }, { once: true, signal });
    video.addEventListener('playing', () => {
      const current = poster;
      if (current) scope.play(current, [{ opacity: 1 }, { opacity: 0 }], 110, removePoster);
    }, { signal });
    video.addEventListener('pause', removePoster, { signal });
    video.addEventListener('error', removePoster, { signal });
    scope.onCleanup(removePoster);
  });
  const article = document.querySelector<HTMLElement>('.writing-with-toc');
  if (!article) return;
  const bar = document.createElement('div');
  bar.className = 'reading-progress'; bar.setAttribute('aria-hidden', 'true');
  document.body.append(bar);
  let frame = 0;
  const update = () => {
    frame = 0;
    const bounds = article.getBoundingClientRect();
    const long = bounds.height > innerHeight * 3;
    const progress = Math.max(0, Math.min(1, -bounds.top / Math.max(1, bounds.height - innerHeight)));
    bar.dataset.visible = String(long && bounds.top <= 0 && bounds.bottom > 0);
    bar.style.transform = `scaleX(${progress})`;
  };
  const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
  window.addEventListener('scroll', schedule, { passive: true, signal });
  window.addEventListener('resize', schedule, { signal });
  const observer = new ResizeObserver(schedule); observer.observe(article);
  update();
  scope.onCleanup(() => { observer.disconnect(); cancelAnimationFrame(frame); bar.remove(); });
}

export function mountCitation(scope: MotionScope) {
  const button = document.getElementById('copy-bibtex');
  const code = document.getElementById('bibtex-code');
  const label = button?.querySelector('.copy-label');
  const feedback = document.getElementById('copy-feedback');
  if (!button || !code || !label) return;
  const { signal } = scope;
  let timer = 0, request = 0;
  button.addEventListener('click', async () => {
    const current = ++request;
    clearTimeout(timer);
    if (!code.textContent) return;
    try { await navigator.clipboard.writeText(code.textContent); }
    catch {
      if (!signal.aborted && current === request) {
        label.textContent = 'Copy';
        if (feedback) feedback.textContent = 'Select and copy the citation below.';
      }
      return;
    }
    if (signal.aborted || current !== request) return;
    if (feedback) feedback.textContent = '';
    label.textContent = '✓ Copied';
    scope.play(label, [{ opacity: .6 }, { opacity: 1 }], 110);
    timer = window.setTimeout(() => { label.textContent = 'Copy'; }, 1500);
  }, { signal });
  scope.onCleanup(() => clearTimeout(timer));
}
