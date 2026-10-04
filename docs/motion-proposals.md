# Motion proposals for the researcher portfolio

Status: proposals for discussion. No new animations or page transitions are implemented by this document.

The site uses restrained typography, a blue interaction accent, pale cover colours, and abstract artwork. Motion should explain a click, connect a cover to its page, or acknowledge a change. Keep the introduction's bold links and the existing CTA appearance. Blurbs remain a quiet footer discovery.

## Proposed locations and behaviour

All durations are starting points to tune against the real page and device.

| Priority | Location and source | Trigger | Proposed animation | Timing |
| --- | --- | --- | --- | --- |
| Start | Internal page navigation: `src/layouts/BaseLayout.astro` and all page `<main>` elements | Home / Research / Writing / Blurbs / publication navigation, including Back | Crossfade the main content while the shared navigation stays visually steady. Avoid sliding an entire long page. Restore scroll on Back and move focus appropriately on new-page navigation. | 140–180 ms |
| Start | Cover links in `src/pages/index.astro`, `src/pages/research/index.astro`, `src/pages/writings/index.astro`, and `src/pages/blurb/index.astro`; destination hero covers in the detail routes | Open a paper, article, or blurb | Let the clicked cover move and resize into the destination hero cover. Fade the surrounding content. Use the reverse connection on Back where the cover is visible; fall back to the page fade otherwise. | 220–280 ms |
| Consider | Active navigation dot: `src/components/Header.astro`, `.nav-links` in `src/styles/site.css` | Selected route or observed homepage section changes | Move one indicator to the new link, with a small opacity fade when the navigation layout changes. Keep Research selected on publication pages and Writing on article pages. Blurbs selects no unrelated nav item. | 150–180 ms |
| Consider | Navbar text and social icons: `Header.astro` | Pointer hover / keyboard focus | Ease the colour into the blue accent. Keep the focus ring immediate and the text and icon positions steady. | 100–120 ms |
| Start | Mobile navigation panel: `Header.astro`, `.site-nav[data-open]` | Open / close menu | Fade the panel and move its links down 4 px into position as a single group. Close slightly faster. Focus trapping, Escape, inert background, and focus restoration take effect immediately. | 160 ms open; 120 ms close |
| Consider | Hamburger control: `Header.astro`, `.nav-toggle-bars` | Menu opens / closes | Turn the outer bars into a close icon and fade the middle bar. Keep the 44 px control fixed. | 160–180 ms |
| Consider | Homepage View research / CV and other existing grey CTAs: `src/pages/index.astro`, `.button` | Hover / press | Move the research arrow 2 px diagonally, the CV arrow 2 px down. Add a 1 px press response. Preserve the current colours, padding, and margins. | 100–120 ms hover; 70 ms press |
| Refine existing | Cover art across all indexes: `.project-cover-link`, `src/components/CoverArt.astro` | Hover / keyboard focus | Keep the existing 1% enlargement, but shorten the current 500 ms transition to make it feel responsive. A small shadow change can accompany it. Preserve the art's full aspect ratio. | 180–220 ms |
| Start | Updates and awards: `src/pages/index.astro`, `.updates-toggle`, `#updates-list` | Show 7 more / Show less | Expand or collapse the older rows smoothly; fade the newly revealed rows in together. On collapse, keep the toggle visible and focused. Avoid a long row-by-row cascade. | 180–220 ms height; 120 ms opacity |
| Consider | Research resources and Hashnode attribution: `.project-links`, `.original-publication`, publication resource buttons | Hover / keyboard focus | Move the existing external-link arrow 2 px diagonally. Keep link text and underlines stable. | 100–120 ms |
| Consider | BibTeX Copy button: `src/pages/pub/[slug].astro` | Successful copy / clipboard failure | Briefly fade to a checkmark and “Copied”; restore after roughly 1.5 seconds. Reserve enough width so the citation block does not jump. Failure keeps the readable manual-copy message. | 100–140 ms |
| Consider | Mobile article contents: `src/components/TableOfContents.astro`, `.toc-disclosure` | Open / close “On this page” | Expand the disclosure and fade its contents. Clicking a heading closes it without delaying keyboard focus or section navigation. | 160–180 ms |
| Consider | Active article contents item: `TableOfContents.astro`, `.toc a[aria-current]` | Reader crosses a section | Ease the active text and left marker into the page accent. Keep all subsection links available. | 100–120 ms |
| Start | Blurb photo carousels: `src/components/blurb/ImageCarousel.astro` | Arrow, dot, keyboard, or swipe | Crossfade the old and new photo once the requested image is decoded. Keep the frame fixed and update the caption, counter, and announcement together. Rapid clicks must not reveal an older pending image. | 120–160 ms |
| Consider | Carousel arrows and dots: `ImageCarousel.astro`, `.carousel-arrow`, `.carousel-dot` | Hover / active slide change | Ease arrow border and colour; scale the active dot slightly inside its existing hit area. Avoid resizing the control layout. | 100–120 ms |
| Optional | Blog figures and blurb photos: `src/lib/blogMarkdown.ts`, `src/components/blurb/BlurbContent.astro` | Image finishes loading | Fade the loaded image over its reserved frame once. Leave already cached images immediate. Keep dimensions stable and avoid shimmer or repeated scroll reveals. | 100–140 ms |
| Optional | Blurb videos: `BlurbContent.astro` | First decoded frame after the user presses Play | If an extra poster layer is worthwhile, fade it away when playback actually starts. Keep native controls and pause/end behaviour; this must not introduce autoplay. | 100–120 ms |
| Optional | Long writing and blurb pages: their detail routes | Reader scrolls through the article body | A thin 2 px progress line at the viewport top can track article-body progress. Update its transform directly with scrolling. It starts after the hero and finishes before related content; decorative and hidden from assistive technology. | Continuous; no trailing tween |
| Consider | Footer Blurbs link: `src/components/SiteFooter.astro`, `.footer-blurbs` | Hover / keyboard focus | Move its arrow 2 px to the right and ease the text colour into blue. Keep the small cover-colour mark still so the footer stays quiet. | 100–120 ms |

## Implementation order

Start with the page crossfade, cover-to-hero connection, mobile menu, updates disclosure, and carousel photo fade. Test those together before adding the smaller hover effects. The optional progress line and video poster transition need a separate visual decision.

Leave the Hello heading, waving hand, intro words, reading-time label, body text, cover illustrations, and achievement badges steady. The user's removed squiggly underlines and intro microanimations stay removed. Avoid parallax, cursor followers, looping animation, long entrance delays, and animation that hides content before JavaScript initializes.

## Routing and accessibility prerequisites

This repository uses Astro 4.16.7 and currently has no transition router. Astro 4 supports `ViewTransitions` in the shared layout, named element transitions, and fallback behaviour. Its bundled page scripts can behave differently during client navigation. Before enabling transitions, make initialization safe on `astro:page-load` and clean up observers and listeners before swapping pages. This applies to the header/menu, cover prefetching, homepage updates, contents observer, carousels, and citation copying. Refresh route-specific navigation state rather than persisting stale active attributes. Pause outgoing videos and restore body scrolling when leaving an open mobile menu. [Astro 4 view-transition documentation](https://v4.docs.astro.build/en/guides/view-transitions/)

Respect `prefers-reduced-motion` for both CSS and script-driven animation. Under reduced motion, navigation, disclosures, copy feedback, and carousel changes happen immediately while retaining their state and feedback. Existing keyboard focus outlines remain immediate. [MDN reduced-motion documentation](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion)

Prefer CSS opacity, transforms, and colour transitions. Reserve measured height animation for user-triggered disclosures. Keep image decoding separate from animation and avoid a new animation library for these interactions.

## Validation for a future implementation

- Test navigation through Home → Research → publication → Blurbs → article and Back/Forward. Verify titles, canonical URLs, active navigation, focus, scroll restoration, and no leftover menu lock.
- Test menu open/close with pointer, keyboard, Escape, and viewport changes; keep the background inert only while open.
- Test updates expansion and collapse, mobile contents navigation, citation-copy success and failure, and no-JavaScript fallbacks.
- Test rapid carousel clicks, slow image loading, failed image loading, swipes, keyboard controls, and reduced motion. Retain readable captions and polite announcements.
- Check desktop and mobile for layout shifts, clipped covers, long blank frames, duplicate listeners, and continuous CPU work.
