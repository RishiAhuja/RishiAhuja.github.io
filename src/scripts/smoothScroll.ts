import Lenis from 'lenis';

// Eases wheel and trackpad scrolling. Touch keeps the platform's own momentum,
// in-page anchors keep the browser's smooth jump, and Lenis stays off for
// anyone who prefers reduced motion. A fresh instance per page: view
// transitions replace <html>'s classes and reset the scroll position.
let lenis: Lenis | null = null;

document.addEventListener('astro:before-swap', () => { lenis?.destroy(); lenis = null; });
document.addEventListener('astro:page-load', () => {
  lenis ??= new Lenis({ autoRaf: true, allowNestedScroll: true, lerp: 0.11, stopInertiaOnNavigate: true });
});
