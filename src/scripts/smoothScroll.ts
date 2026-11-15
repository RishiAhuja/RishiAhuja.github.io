import Lenis from 'lenis';

// Eases wheel and trackpad scrolling. Touch keeps the platform's own momentum,
// in-page anchors keep the browser's smooth jump, and Lenis stays off for
// anyone who prefers reduced motion. A fresh instance per page: view
// transitions replace <html>'s classes and reset the scroll position.
let lenis: Lenis | null = null;

document.addEventListener('astro:before-swap', () => { lenis?.destroy(); lenis = null; });
document.addEventListener('astro:page-load', () => {
  // While the menu is open the page behind it stays put.
  lenis ??= new Lenis({
    autoRaf: true, allowNestedScroll: true, lerp: 0.11, stopInertiaOnNavigate: true,
    virtualScroll: () => !document.body.classList.contains('nav-open'),
  });
});
