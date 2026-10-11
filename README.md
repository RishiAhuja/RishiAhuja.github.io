# Rishi Ahuja

Personal site: [rishiahuja.github.io](https://rishiahuja.github.io), with the custom-domain migration prepared for [rishia.in](https://rishia.in).


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

## Portfolio and teaching

Experience and Academics live on the homepage. Community documents teaching,
mentoring, GDGC leadership, and HackMol 7.0. The Flutter bootcamp is a completed
course from 18 December 2025 to 14 January 2026; its 14 published videos and
13 available slide links are preserved in `src/data/teaching.ts`. Lecture artwork
is generated individually and served as AVIF/WebP. Final prompts live in
`docs/teaching-artwork-prompts.json`. Colophon, Archive, Links, and Résumés are
first-party supporting pages. Résumé links continue to use the existing live
version resolvers on rishia.in.

## Vercel and domain migration

The `rishi-portfolio` Vercel project serves the same static build. `vercel.json`
contains the permanent compatibility redirects for old publication, blog,
journey, and archive-only URLs. `/resume` remains the new listing page.

Build origins are configured with `PORTFOLIO_SITE_URL` and
`PORTFOLIO_ARCHIVE_ORIGIN`. Vercel production and previews use
`https://rishia.in` and `https://archive.rishia.in`. Without these variables,
GitHub Pages continues to use its current origin and the current live résumé
resolvers on rishia.in. Uploaded PDFs and media remain on artifacts.rishia.in.

Run `npm run verify:migration` after building. To check the real deployed HTTP
routes, pass `-- --url https://<deployment-host>` with the same origin environment
variables used for the build. This checks the full known URL inventory, slash
variants, permanent status codes and query preservation.

The domain reassignment is manual: first attach archive.rishia.in to the existing
`my-portfolio` project and verify it; then move rishia.in to `rishi-portfolio`.
The implementation record and handoff are in `docs/portfolio-domain-migration.md`.
