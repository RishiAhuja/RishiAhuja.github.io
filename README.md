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

## Publishing and discovery

This site is the canonical home for research pages and published blurbs. Only blurbs
with `status: 'published'` receive a route, appear in the footer-linked Blurbs archive, RSS, the sitemap, and
social cards. Draft blurbs stay out of those outputs. The `/blurb/` paths remain
stable so existing links keep working.

Writing mirrors the author’s Hashnode articles. Each local article links quietly
to its original and declares the Hashnode URL as its canonical URL. The Writing
archive remains discoverable, and RSS links to the local reading experience with
original-source attribution. Mirrored article URLs are intentionally omitted from
the local sitemap. Research metadata distinguishes workshop papers from main
conference publications and only exposes resources present in the source data.

`/feed.xml`, `/sitemap.xml`, `/robots.txt`, and `/404.html` are built statically.
Social cards are generated from the same content as the pages, including Blurbs.

## Reading and media

Blogs retain their original published Hashnode reading estimates from
`readTimeInMinutes` in their frontmatter, including archives, detail pages, and
social cards. Blurb estimates use 150 prose words per minute, 12 seconds per
photograph, 30 seconds per technical figure, and additional time for code.
Carousel estimates count all images. Video estimates use `durationSeconds` when
known, otherwise two minutes. The displayed “min read” total includes this media and study time.

Article figures carry descriptions in their Markdown and intrinsic dimensions in
`src/data/blog-image-dimensions.json`. Add an accurate description and dimensions
when adding a figure. Abstract cover art is decorative; cover links have explicit
accessible names. Existing short media captions remain separate from article
figure descriptions.

Video records support `captions` (an English WebVTT URL) and `transcript` (plain
text). Supply verified captions for meaningful speech and sound; do not infer a
transcript from a filename or surrounding prose. The controls never autoplay,
video data waits for interaction, and carousel neighbours warm only near the
viewport. Mobile covers stay visible at their full aspect ratio.

After building, run `npm run verify:site` to check canonical policy, internal
links, figure descriptions and dimensions, heading structure, discovery outputs,
and reading-time behavior. `npm run build` also verifies all social cards.
