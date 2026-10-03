# Rishi Ahuja

Personal site: [rishiahuja.github.io](https://rishiahuja.github.io)


## Open Graph images

Every page has its own 1200 × 630 PNG at `/og/<page-path>.png` (the homepage uses
`/og/index.png`). Astro generates them during `npm run build`, so GitHub Pages
serves ordinary static files. New research, writing, and published blurbs get
cards automatically from their existing content; drafts are excluded.

The renderer uses the local Athletics fonts, colors from `src/styles/site.css`,
and the same optimized cover artwork as the page. Run `npm run dev` to preview
an image, such as `/og/pub/ahuja2026icfd31k.png`. No remote fonts or image fetches
are needed. `npm run build` verifies every generated page's sharing metadata and
PNG dimensions; `npm run verify:og` reruns those checks against `dist`.
