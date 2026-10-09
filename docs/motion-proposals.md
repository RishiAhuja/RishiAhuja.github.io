# Motion proposals for the researcher portfolio

Status: implemented after approval. Scripted feedback stays within 200 ms. Decorative artwork responds over 220 ms, and the five-pose dumbbell lift completes once in 320 ms. The cover-to-hero transition takes 300 ms after the requested timing adjustment. Reduced motion keeps state changes immediate.

The site uses restrained typography, a blue interaction accent, pale cover colours, and abstract artwork. Motion should explain a click, connect a cover to its page, or acknowledge a change. Keep the introduction's bold links and the existing CTA appearance. Blurbs remain a quiet footer discovery.

## Locations and behaviour

Scripted animations are capped at 200 ms. Shared cover movement uses 300 ms; page fades stay unchanged, and the navigation dot glides over 240 ms. Native navigation is enabled only in supporting browsers; other browsers keep regular page navigation.

| Priority | Location and source | Trigger | Animation | Timing |
| --- | --- | --- | --- | --- |
| Start | Internal page navigation: `src/layouts/BaseLayout.astro` and all page `<main>` elements | Home / Research / Writing / Blurbs / publication navigation, including Back | Crossfade the main content while the shared navigation stays visually steady. Avoid sliding an entire long page. Restore scroll on Back and move focus appropriately on new-page navigation. | 70 ms out; 130 ms in |
| Start | Cover links in `src/pages/index.astro`, `src/pages/research/index.astro`, `src/pages/writings/index.astro`, and `src/pages/blurb/index.astro`; destination hero covers in the detail routes | Open a paper, article, or blurb | Let the clicked cover move and resize into the destination hero cover. Fade the surrounding content. Use the reverse connection on Back where the cover is visible; fall back to the page fade otherwise. | 300 ms |
| Consider | Active navigation dot: `src/components/Header.astro`, `.nav-links` in `src/styles/site.css` | Pointer hover / keyboard focus, selected route, or observed homepage section changes | Slide one dot horizontally to the hovered or focused link, then return to the selected link when the preview ends. Hover leaves the current-page state unchanged. Keep Research selected on publication pages and Writing on article pages. Blurbs selects no unrelated nav item. | 240 ms |
| Consider | Navbar text and social icons: `Header.astro` | Pointer hover / keyboard focus | Ease the colour into the blue accent. Keep the focus ring immediate and the text and icon positions steady. | 110 ms |
| Start | Mobile navigation panel: `Header.astro`, `.site-nav[data-open]` | Open / close menu | Fade the panel and move its links down 4 px into position as a single group. Close slightly faster. Focus trapping, Escape, inert background, and focus restoration take effect immediately. | 160 ms open; 120 ms close |
| Consider | Hamburger control: `Header.astro`, `.nav-toggle-bars` | Menu opens / closes | Turn the outer bars into a close icon and fade the middle bar. Keep the 44 px control fixed. | 160 ms |
| Consider | Homepage View research / CV and other existing grey CTAs: `src/pages/index.astro`, `.button` | Hover / press | Move the research arrow 2 px diagonally, the CV arrow 2 px down. Add a 1 px press response. Preserve the current colours, padding, and margins. | 110 ms hover; 70 ms press |
| Refine existing | Cover art across all indexes: `.project-cover-link`, `src/components/CoverArt.astro` | Hover / keyboard focus | Keep the existing 1% enlargement, but shorten the current 500 ms transition to make it feel responsive. A small shadow change can accompany it. Preserve the art's full aspect ratio. | 180 ms |
| Start | Updates and awards: `src/pages/index.astro`, `.updates-toggle`, `#updates-list` | Show 7 more / Show less | Expand or collapse the older rows smoothly; fade the newly revealed rows in together. On collapse, keep the toggle visible and focused. Avoid a long row-by-row cascade. | 180 ms height; 120 ms opacity |
| Consider | Research resources and Hashnode attribution: `.project-links`, `.original-publication`, publication resource buttons | Hover / keyboard focus | Move the existing external-link arrow 2 px diagonally. Keep link text and underlines stable. | 110 ms |
| Consider | BibTeX Copy button: `src/pages/pub/[slug].astro` | Successful copy / clipboard failure | Briefly fade to a checkmark and “Copied”; restore after roughly 1.5 seconds. Reserve enough width so the citation block does not jump. Failure keeps the readable manual-copy message. | 110 ms |
| Consider | Mobile article contents: `src/components/TableOfContents.astro`, `.toc-disclosure` | Open / close “On this page” | Expand the disclosure and fade its contents. Clicking a heading closes it without delaying keyboard focus or section navigation. | 160 ms |
| Consider | Active article contents item: `TableOfContents.astro`, `.toc a[aria-current]` | Reader crosses a section | Ease the active text and left marker into the page accent. Keep all subsection links available. | 110 ms |
| Start | Blurb photo carousels: `src/components/blurb/ImageCarousel.astro` | Arrow, dot, keyboard, or swipe | Crossfade the old and new photo once the requested image is decoded. Keep the frame fixed and update the caption, counter, and announcement together. Rapid clicks must not reveal an older pending image. | 140 ms |
| Consider | Carousel arrows and dots: `ImageCarousel.astro`, `.carousel-arrow`, `.carousel-dot` | Hover / active slide change | Ease arrow border and colour; scale the active dot slightly inside its existing hit area. Avoid resizing the control layout. | 110 ms |
| Optional | Blog figures and blurb photos: `src/lib/blogMarkdown.ts`, `src/components/blurb/BlurbContent.astro` | Image finishes loading | Fade the loaded image over its reserved frame once. Leave already cached images immediate. Keep dimensions stable and avoid shimmer or repeated scroll reveals. | 110 ms |
| Optional | Blurb videos: `BlurbContent.astro` | First decoded frame after the user presses Play | If an extra poster layer is worthwhile, fade it away when playback actually starts. Keep native controls and pause/end behaviour; this must not introduce autoplay. | 110 ms |
| Optional | Long writing and blurb pages: their detail routes | Reader scrolls through the article body | A thin 2 px progress line at the viewport top can track article-body progress. Update its transform directly with scrolling. It starts after the hero and finishes before related content; decorative and hidden from assistive technology. | Continuous; no trailing tween |
| Implemented | Footer travel stamp: `src/components/SiteFooter.astro`, `.footer-stamp` | Hover / keyboard focus | Tilt the paper stamp 2° and rest; clicking opens Blurbs. Keep the motion off for reduced-motion preferences. | 200 ms |
| Implemented | Colophon and Links introduction artwork | Fine-pointer hover over the artwork | A 2px lift and slight tilt for the proof; a 2.5% expansion for Links. Settle while hovered and return smoothly on leave. | 220 ms |
| Implemented | Archive introduction artwork | Fine-pointer hover | Three separately generated cards fan by a few pixels and at most 2 degrees. | 220 ms |
| Implemented | Community introduction artwork | Fine-pointer hover | Five separate pieces move 1–2px inward; the thread contracts by 1%. | 220 ms |
| Implemented | About, beside the gym paragraph | Fine-pointer hover over the dumbbell | One CSS lift through five poses: rest, small lift, peak, small lift, rest. No repetition while hovered. | 320 ms once |
| Implemented | Course curriculum introduction | Fine-pointer hover | Lift the simple lesson sheet 2px and tilt 1 degree. | 220 ms |
| Implemented | Bookmark signature after blog and blurb bodies | Fine-pointer hover | Lift the printed bookplate 2px and tilt 1 degree. | 220 ms |


## Implementation details

One page scope owns listeners, observers, pending requests, and animations. It is disposed before each Astro page swap and mounted once after page load. Only the clicked or visible matching cover participates in the shared transition. Off-screen covers use the ordinary page fade. Image requests decode before committing and ignore stale completions. The optional progress line appears only on articles longer than three viewports; the video poster fade occurs only during the first user-initiated playback.

Leave the Hello heading, waving hand, intro words, reading-time label, body text, cover illustrations, and achievement badges steady. The user's removed squiggly underlines and intro microanimations stay removed. Avoid parallax, cursor followers, looping animation, long entrance delays, and animation that hides content before JavaScript initializes.

## Routing and accessibility prerequisites

This repository uses Astro 4.16.7 with `ViewTransitions` in the shared layout. Initialization runs once on `astro:page-load`, and observers and listeners are cleaned up before swapping pages. This applies to the header/menu, cover prefetching, homepage updates, contents observer, carousels, and citation copying. Refresh route-specific navigation state rather than persisting stale active attributes. Pause outgoing videos and restore body scrolling when leaving an open mobile menu. [Astro 4 view-transition documentation](https://v4.docs.astro.build/en/guides/view-transitions/)

Respect `prefers-reduced-motion` for both CSS and script-driven animation. Under reduced motion, navigation, disclosures, copy feedback, and carousel changes happen immediately while retaining their state and feedback. Existing keyboard focus outlines remain immediate. [MDN reduced-motion documentation](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion)

Prefer CSS opacity, transforms, and colour transitions. Reserve measured height animation for user-triggered disclosures. Keep image decoding separate from animation and avoid a new animation library for these interactions.

## Validation

- Test navigation through Home → Research → publication → Blurbs → article and Back/Forward. Verify titles, canonical URLs, active navigation, focus, scroll restoration, and no leftover menu lock.
- Test menu open/close with pointer, keyboard, Escape, and viewport changes; keep the background inert only while open.
- Test updates expansion and collapse, mobile contents navigation, citation-copy success and failure, and no-JavaScript fallbacks.
- Test rapid carousel clicks, slow image loading, failed image loading, swipes, keyboard controls, and reduced motion. Retain readable captions and polite announcements.
- Check desktop and mobile for layout shifts, clipped covers, long blank frames, duplicate listeners, and continuous CPU work.

## Verification results

- Production build: 24 pages and 24 OG cards, with the existing accessibility and discovery checks passing.
- TypeScript: `npx tsc --noEmit` passed.
- Motion suite: 15 checks cover request races and failures, page disposal, reduced motion and changes to that preference, the Astro 4 plain-event contract, Back focus restoration, aborted navigation, hover/focus previews that preserve route state, and indicator cleanup.
- Browser QA at 1440 × 1000 and 390 × 844: navigation through Home, Research, publications, Writing, articles, and Blurbs; Back restoration; correct active dots; Copy feedback; menu Escape/focus/background release; updates expansion/collapse; mobile contents selection; stable carousel dimensions and counters during rapid clicks and keyboard changes; no horizontal overflow on checked pages.
- Native videos retain controls, posters, and user-initiated playback without autoplay or looping. No-JavaScript navigation and disclosure fallbacks were reviewed in the generated markup and CSS.
- Reduced-motion script behaviour is covered by automated tests; the preference was not changed at the operating-system level during browser QA.

The new artwork uses CSS only, adds no focus stops or buttons, and stays static on touch-primary devices and when reduced motion is requested. `/machine` receives no new artwork. The five dumbbell poses share one bitmap to keep the illustration consistent between poses.
