# Portfolio domain migration

Implemented on 11 October 2026 in the new `rishi-portfolio` Vercel project. Domain cutover completed on 11 October 2026 using the authenticated Vercel API and Cloudflare dashboard.

## Intended addresses

- New portfolio: https://rishia.in
- Existing portfolio: https://archive.rishia.in
- Keep artifacts.rishia.in and every other existing service subdomain unchanged.

The audit combines 73 URLs in the live old sitemap with route files and published content. It maps 93 known URLs. All destinations on the new portfolio exist in the current static build. Archive destinations are the original paths; attaching and verifying archive.rishia.in is the first manual cutover step. This inventory does not claim to cover all historic backlinks: check Search Console and traffic logs before cutover.

## Hosting recommendation

The existing site uses Astro hybrid output on Vercel, including dynamic latest-resume resolvers and admin/data endpoints. Keep that deployment and its environment configuration for the archive. Create a separate Vercel project for the new static repository and attach rishia.in after preview validation. This gives the new domain real HTTP redirects through vercel.json. Do not rely on client-side or meta-refresh redirects for the main backlink migration. The current GitHub Pages deployment can remain accessible; choose rishia.in as the primary canonical origin for migrated first-party pages. No GitHub custom-domain setting is required with this approach.

## Resume behavior (confirmed)

Keep /resume as the new resume listing page. The user accepts that an old /resume backlink will open this page instead of immediately opening the engineering PDF. No /resumes page or rename is needed. At cutover, point the engineering PDF button to https://archive.rishia.in/resume so it continues opening the latest document rather than returning to the listing. Keep /research/resume and /rsh/resume as latest research-PDF links through the existing archive resolver. Do not permanently redirect PDF resolvers to a particular file version: their final PDF hop remains a temporary 302 so future uploads are reflected.

## Redirect behavior

Use permanent HTTP 308 redirects for moved page URLs, directly to the closest matching page. Retain queries, case, and trailing-slash variants appropriately. Limit legacy path-family redirects to known families: /projects, /gallery, /uncompiled, /blurb entries missing from the new site, /ledger, /graph, and existing short links. Use the exact publication and article maps first, with /research/resume and /rsh/resume before research rules. Never blanket-redirect every path to the homepage or redirect the archive host back to itself. Keep old-only content on the archive. Keep the new /archive page as its own history index and update its old-portfolio entry to archive.rishia.in.

There are 6 published legacy blurbs and 4 published new blurbs. A published old blurb absent from the new site goes to its original archive page. A draft should not become public merely to satisfy a wildcard rule.

## Fragment links

Fragments are not sent to servers, so HTTP redirect rules cannot inspect them. /#about and /#experience already have matching targets. At cutover add anchor aliases for /#blog -> the Writing section and /#education -> Academics. Preserve old-only /#papers, /#upstream and /#sidequests through a small client-side legacy-fragment handler leading to the same archive fragment. Check any other known homepage fragments against traffic/backlink records. Do not confuse the old papers-reading section with the new featured research section.

## Implementation at cutover

1. Deploy the old site at archive.rishia.in and verify pages, gallery, published Uncompiled entries, media, social short links, and latest resume selection. Preserve its existing environment values. Update its site origin and remaining hardcoded origin-specific metadata. Use per-page canonical targets for copied migrated content, with self-canonicals for archive-only material.
2. Prepare a preview of the new Vercel project. Add the mapped redirects to that project only. Keep /resume as the listing page and update its engineering PDF button to the archive resolver. Keep all current new pages, including the footer-linked Blurbs archive.
3. Change the new Astro site origin to rishia.in; adjust the hardcoded host expectations in scripts/verify-site.mjs. Regenerate canonical URLs, sitemap, feed, OG URLs and structured data. Keep the existing Hashnode canonical policy for mirrored writing. Update the old-site link in the new Archive page.
4. Preserve custom asset/download URLs referenced by old backlinks. artifacts.rishia.in already serves uploaded media and PDFs, so its domain and storage must stay available. Check old /gallery/<file> and other local asset paths separately.
5. Keep admin and API integrations on their intended old deployment. Inventory external callers, CORS/origin checks, cookies and form actions before routing anything across hosts. Do not add a blanket /api redirect without this check.
6. Test the preview with the complete URL inventory, slash variants, query strings, HEAD requests, fragment links and the latest PDF updates. New page targets must return 200, moved-page responses 308, and resume resolvers 302 to the current PDF. Confirm no redirect loops or irrelevant targets.
7. Attach rishia.in to the verified new project; retain archive.rishia.in on the existing project. Keep the previous deployment available for rollback. Verify the production map after propagation. Submit the updated sitemap and inspect representative URLs in Search Console. Do not submit a whole rishia.in -> archive.rishia.in Change of Address: the main site remains at rishia.in.
8. Keep compatibility redirects indefinitely for readers. Google recommends at least one year. Audit the remaining GitHub Pages links separately: /my-portfolio/ belongs to the earlier project site and must not be swallowed by a catch-all redirect.

## URL inventory

The source paths below refer to rishia.in. The mapped redirects are implemented in vercel.json for the new project. These changes reach rishia.in only when that domain is assigned to it.

| Existing path | Planned response | Destination |
| --- | --- | --- |
| `/` | Keep page | `https://rishia.in/` |
| `/admin` | 308 | `https://archive.rishia.in/admin` |
| `/archive` | Keep page | `https://rishia.in/archive` |
| `/blogs` | 308 | `https://rishia.in/writings` |
| `/blogs/art` | 308 | `https://rishia.in/writings/art` |
| `/blogs/bits-of-trust-the-elegance-of-aes` | 308 | `https://rishia.in/writings/bits-of-trust-the-elegance-of-aes` |
| `/blogs/building-rosenblatts-perceptron-from-scratch-a-comprehensive-technical-deep-dive` | 308 | `https://rishia.in/writings/building-rosenblatts-perceptron-from-scratch-a-comprehensive-technical-deep-dive` |
| `/blogs/comprehensive-arch-linux-guide` | 308 | `https://rishia.in/writings/comprehensive-arch-linux-guide` |
| `/blogs/getting-cracked-at-clean-and-bloc-architecture` | 308 | `https://rishia.in/writings/getting-cracked-at-clean-and-bloc-architecture` |
| `/blogs/getting-started-at-bloc-architecture` | 308 | `https://rishia.in/writings/getting-started-at-bloc-architecture` |
| `/blogs/go-beneath-the-abstraction-building-interactive-uis-with-fernkit` | 308 | `https://rishia.in/writings/go-beneath-the-abstraction-building-interactive-uis-with-fernkit` |
| `/blogs/resource-management-with-probabilistic-scheduling-in-the-context-of-linux` | 308 | `https://rishia.in/writings/resource-management-with-probabilistic-scheduling-in-the-context-of-linux` |
| `/blogs/shamirs-secret-sharing-scheme-and-multi-party-computation` | 308 | `https://rishia.in/writings/shamirs-secret-sharing-scheme-and-multi-party-computation` |
| `/blogs/towards-the-modern-transformer-architecture` | 308 | `https://rishia.in/writings/towards-the-modern-transformer-architecture` |
| `/blogs/you-dont-know-websockets-yet` | 308 | `https://rishia.in/writings/you-dont-know-websockets-yet` |
| `/blogs/your-hardest-hello-world-text-rasterization-1` | 308 | `https://rishia.in/writings/your-hardest-hello-world-text-rasterization-1` |
| `/blurb/cisco-interview` | Keep page | `https://rishia.in/blurb/cisco-interview` |
| `/blurb/fern` | Keep page | `https://rishia.in/blurb/fern` |
| `/blurb/iclr-2026-rio-de-janeiro` | Keep page | `https://rishia.in/blurb/iclr-2026-rio-de-janeiro` |
| `/blurb/level-supermind-hackathon` | 308 | `https://archive.rishia.in/blurb/level-supermind-hackathon` |
| `/blurb/my-ijcai-ecai-2026-and-germany-experience-in-bremen` | Keep page | `https://rishia.in/blurb/my-ijcai-ecai-2026-and-germany-experience-in-bremen` |
| `/blurb/openlearn` | 308 | `https://archive.rishia.in/blurb/openlearn` |
| `/cal` | 308 | `https://archive.rishia.in/cal` |
| `/colophon` | Keep page | `https://rishia.in/colophon` |
| `/community` | Keep page | `https://rishia.in/community` |
| `/flutter-bootcamp` | Keep page | `https://rishia.in/flutter-bootcamp` |
| `/gallery` | 308 | `https://archive.rishia.in/gallery` |
| `/gallery/2023` | 308 | `https://archive.rishia.in/gallery/2023` |
| `/gallery/2024` | 308 | `https://archive.rishia.in/gallery/2024` |
| `/gallery/apr-2025` | 308 | `https://archive.rishia.in/gallery/apr-2025` |
| `/gallery/apr-2026` | 308 | `https://archive.rishia.in/gallery/apr-2026` |
| `/gallery/aug-2026` | 308 | `https://archive.rishia.in/gallery/aug-2026` |
| `/gallery/dec-2025` | 308 | `https://archive.rishia.in/gallery/dec-2025` |
| `/gallery/feb-2025` | 308 | `https://archive.rishia.in/gallery/feb-2025` |
| `/gallery/feb-2026` | 308 | `https://archive.rishia.in/gallery/feb-2026` |
| `/gallery/jan-2025` | 308 | `https://archive.rishia.in/gallery/jan-2025` |
| `/gallery/jan-2026` | 308 | `https://archive.rishia.in/gallery/jan-2026` |
| `/gallery/jul-2025` | 308 | `https://archive.rishia.in/gallery/jul-2025` |
| `/gallery/jul-2026` | 308 | `https://archive.rishia.in/gallery/jul-2026` |
| `/gallery/jun-2025` | 308 | `https://archive.rishia.in/gallery/jun-2025` |
| `/gallery/jun-2026` | 308 | `https://archive.rishia.in/gallery/jun-2026` |
| `/gallery/mar-2025` | 308 | `https://archive.rishia.in/gallery/mar-2025` |
| `/gallery/mar-2026` | 308 | `https://archive.rishia.in/gallery/mar-2026` |
| `/gallery/may-2025` | 308 | `https://archive.rishia.in/gallery/may-2025` |
| `/gallery/nov-2025` | 308 | `https://archive.rishia.in/gallery/nov-2025` |
| `/gallery/oct-2025` | 308 | `https://archive.rishia.in/gallery/oct-2025` |
| `/gallery/sep-2025` | 308 | `https://archive.rishia.in/gallery/sep-2025` |
| `/github` | 308 | `https://archive.rishia.in/github` |
| `/graph` | 308 | `https://archive.rishia.in/graph` |
| `/ig` | 308 | `https://archive.rishia.in/ig` |
| `/instagram` | 308 | `https://archive.rishia.in/instagram` |
| `/journey/cisco-interview` | 308 | `https://rishia.in/blurb/cisco-interview` |
| `/journey/fern` | 308 | `https://rishia.in/blurb/fern` |
| `/journey/iclr-2026-rio-de-janeiro` | 308 | `https://rishia.in/blurb/iclr-2026-rio-de-janeiro` |
| `/journey/level-supermind-hackathon` | 308 | `https://archive.rishia.in/blurb/level-supermind-hackathon` |
| `/journey/my-ijcai-ecai-2026-and-germany-experience-in-bremen` | 308 | `https://rishia.in/blurb/my-ijcai-ecai-2026-and-germany-experience-in-bremen` |
| `/journey/openlearn` | 308 | `https://archive.rishia.in/blurb/openlearn` |
| `/ledger` | 308 | `https://archive.rishia.in/ledger` |
| `/linkedin` | 308 | `https://archive.rishia.in/linkedin` |
| `/links` | Keep page | `https://rishia.in/links` |
| `/machine` | Keep page | `https://rishia.in/machine` |
| `/projects/axon` | 308 | `https://archive.rishia.in/projects/axon` |
| `/projects/blood4life` | 308 | `https://archive.rishia.in/projects/blood4life` |
| `/projects/fern` | 308 | `https://archive.rishia.in/projects/fern` |
| `/projects/fingenie` | 308 | `https://archive.rishia.in/projects/fingenie` |
| `/projects/ipqs` | 308 | `https://archive.rishia.in/projects/ipqs` |
| `/projects/kisaanmithraa` | 308 | `https://archive.rishia.in/projects/kisaanmithraa` |
| `/projects/nexus` | 308 | `https://archive.rishia.in/projects/nexus` |
| `/projects/openlearn` | 308 | `https://archive.rishia.in/projects/openlearn` |
| `/projects/sahlplus` | 308 | `https://archive.rishia.in/projects/sahlplus` |
| `/projects/soulbuddy` | 308 | `https://archive.rishia.in/projects/soulbuddy` |
| `/research` | Keep page | `https://rishia.in/research` |
| `/research/ahuja2026icfd31k` | 308 | `https://rishia.in/pub/ahuja2026icfd31k` |
| `/research/ahuja2026retrieval` | 308 | `https://rishia.in/pub/ahuja2026retrieval` |
| `/research/ahuja2026scopebenchpr` | 308 | `https://rishia.in/pub/ahuja2026scopebenchpr` |
| `/research/resume` | 308 | `https://archive.rishia.in/research/resume` |
| `/resume` | Keep page | `https://rishia.in/resume` |
| `/rsh` | 308 | `https://rishia.in/research` |
| `/rsh/ahuja2026icfd31k` | 308 | `https://rishia.in/pub/ahuja2026icfd31k` |
| `/rsh/ahuja2026retrieval` | 308 | `https://rishia.in/pub/ahuja2026retrieval` |
| `/rsh/ahuja2026scopebenchpr` | 308 | `https://rishia.in/pub/ahuja2026scopebenchpr` |
| `/rsh/resume` | 308 | `https://archive.rishia.in/research/resume` |
| `/stats` | serve | `https://rishia.in/stats` |
| `/uncompiled` | 308 | `https://archive.rishia.in/uncompiled` |
| `/uncompiled/conditional-architecture` | 308 | `https://archive.rishia.in/uncompiled/conditional-architecture` |
| `/uncompiled/the-defensive-reframe` | 308 | `https://archive.rishia.in/uncompiled/the-defensive-reframe` |
| `/uncompiled/the-horizon-effect` | 308 | `https://archive.rishia.in/uncompiled/the-horizon-effect` |
| `/uncompiled/the-receipts-problem` | 308 | `https://archive.rishia.in/uncompiled/the-receipts-problem` |
| `/uncompiled/the-utility-of-ego` | 308 | `https://archive.rishia.in/uncompiled/the-utility-of-ego` |
| `/uncompiled/writing-on-water` | 308 | `https://archive.rishia.in/uncompiled/writing-on-water` |
| `/youtube` | 308 | `https://archive.rishia.in/youtube` |
| `/yt` | 308 | `https://archive.rishia.in/yt` |

## Sources

- [Live old sitemap](https://rishia.in/sitemap-0.xml)
- [Vercel configuration redirects](https://vercel.com/docs/routing/redirects/configuration-redirects)
- [Vercel redirect and query-string behavior](https://vercel.com/docs/routing/redirects)
- [Google site moves and URL mapping](https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes)

## Implemented deployment setup

- New Vercel project: `rishi-portfolio` in `rishiahujas-projects`.
- Existing project: `my-portfolio`; its code and environment values remain unchanged. It now serves archive.rishia.in; the primary and www domains moved to the new project.
- GitHub repository: `RishiAhuja/RishiAhuja.github.io`, connected for subsequent Vercel deployments.
- Production and preview build variables: `PORTFOLIO_SITE_URL=https://rishia.in`, `PORTFOLIO_ARCHIVE_ORIGIN=https://archive.rishia.in`.
- `vercel.json` implements 90 rules: exact mapped URLs first, sitemap aliases, the old dynamic /og endpoint and safe legacy-family fallbacks. New /research, /blurb, /_astro and /og/*.png URLs are preserved.
- Canonical URLs, feeds, sitemaps, social-image URLs, JSON-LD, archive links and PDF buttons use the configured build origins. The GitHub Pages build keeps its existing defaults.
- Legacy /#blog, /#education and /#contact links have matching anchors. Only the old reading/upstream/side-quest fragments leave for the archived homepage.
- `npm run build` verifies the migration inventory in addition to all existing checks. `npm run verify:migration -- --url <deployment-origin>` exercises the deployed HTTP routes.

### Completed domain cutover

- `rishia.in` is assigned to `rishi-portfolio` and serves the new portfolio.
- `www.rishia.in` is assigned to the same project with a permanent 308 redirect to `rishia.in`, retaining paths and query strings.
- `archive.rishia.in` is assigned to `my-portfolio`. Cloudflare has an A record pointing to `76.76.21.21`, with proxying enabled and TTL Auto. Vercel issued its HTTPS certificate.
- Existing apex and www DNS records, nameservers, Cloudflare security settings, artifacts.rishia.in and unrelated service subdomains were preserved.
- Verified all 183 primary-domain HEAD requests and 52 unique archive targets. The archive homepage and old-only pages return 200; both resume resolvers return 302 to their latest PDFs. Verified the engineering PDF itself returns 200.
- The old project's site metadata still uses its former primary origin. A separate archive metadata cleanup can update self-canonicals for archive-only pages and point copied content at the corresponding primary page. This does not affect the completed domain routing or PDF resolution.

For rollback, reassign rishia.in and www.rishia.in to my-portfolio; retain the archive domain and its DNS record. No DNS change is required for the apex or www records used in this cutover.

### Shared visitor statistics (12 October 2026)

`/stats` now serves the new portfolio's Statistics page. `/api/visitors` is a Vercel Node function using the original anonymous Supabase connection and the existing `log_visit`, `get_total_visitors`, and `get_daily_stats` functions. The existing 5,747-visitor legacy offset is retained once. The RPC signatures stay compatible with the archive. The SQL correction in `sql/2026-10-12-fix-visitor-counts.sql` repairs the counting logic without deleting visit records or page-view history. It saves the original daily totals in a private backup table.

The footer counter and Statistics page share the total. Daily charts and an accessible table offer 7-, 30-, and 90-day periods. The GitHub Pages mirror reads the primary Vercel endpoint. Tracking reuses `visitor_session_id` in session storage, records the page path without query strings or fragments, and honours Do Not Track and Global Privacy Control. Local development and Vercel previews read totals without logging visits.

`ANALYTICS_SUPABASE_URL` and `ANALYTICS_SUPABASE_KEY` are server-only Vercel variables. For local development, put those two values in the ignored `.env.local` and run `npm run dev:api` alongside `npm run dev`. The old portfolio continues using its existing database configuration.

The previous `log_visit` function incremented visitors and page views together on every call. The correction counts each session once per UTC day for daily visitors, counts each session once across the complete database for the all-time total, and records each page load as a page view. Historical session counts are reconstructed from all 7,896 stored visits (4,677 distinct sessions at the audit). The 5,747 legacy baseline remains unchanged. Earlier page-view totals may include duplicate recordings from the archive footer; its responsive counters now share one recording.

The SQL correction was applied in the existing production Supabase SQL Editor on 12 October 2026. Its checks passed; the final result was 4,677 recorded sessions, 10,424 including the legacy baseline, and 7,896 preserved page logs. The migration reconciles historical daily page-view totals with stored records, locks the analytics tables during the transaction, backs up the original totals, and runs a smoke check whose test records are rolled back. Any failed check rolls back the migration. `npm run test:analytics:sql` verifies it against a temporary local PostgreSQL instance, including concurrent requests, session deduplication across days, private raw records/backup, and safe reruns. PostgreSQL binaries must be on PATH, or set `PG_BIN` to their directory. The normal website build does not require PostgreSQL.

Function definitions pin an empty search path and qualify their tables, following [Supabase's database-function guidance](https://supabase.com/docs/guides/database/functions). Transaction-level advisory locks serialize same-session/day recordings, using [PostgreSQL's documented locking function](https://www.postgresql.org/docs/15/functions-admin.html).

### Singular blog compatibility (12 October 2026)

`/blog` now permanently redirects to `/writings`, and `/blog/<slug>` redirects to the matching `/writings/<slug>` article. The existing `/blogs` redirects remain. Migration verification exercises the singular article aliases against every mapped published writing destination, including their deployed slash variants and query strings.
