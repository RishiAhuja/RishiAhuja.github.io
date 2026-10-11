# Portfolio domain migration

Implemented on 11 October 2026 in the new `rishi-portfolio` Vercel project. Existing domain assignments remain unchanged; the user will perform the cutover manually.

## Intended addresses

- New portfolio: https://rishia.in
- Existing portfolio: https://archive.rishia.in
- Keep artifacts.rishia.in and every other existing service subdomain unchanged.

The audit combines 73 URLs in the live old sitemap with route files and published content. It maps 92 known URLs. All destinations on the new portfolio exist in the current static build. Archive destinations are the original paths; attaching and verifying archive.rishia.in is the first manual cutover step. This inventory does not claim to cover all historic backlinks: check Search Console and traffic logs before cutover.

## Hosting recommendation

The existing site uses Astro hybrid output on Vercel, including dynamic latest-resume resolvers and admin/data endpoints. Keep that deployment and its environment configuration for the archive. Create a separate Vercel project for the new static repository and attach rishia.in after preview validation. This gives the new domain real HTTP redirects through vercel.json. Do not rely on client-side or meta-refresh redirects for the main backlink migration. The current GitHub Pages deployment can remain accessible; choose rishia.in as the primary canonical origin for migrated first-party pages. No GitHub custom-domain setting is required with this approach.

## Resume behavior (confirmed)

Keep /resume as the new resume listing page. The user accepts that an old /resume backlink will open this page instead of immediately opening the engineering PDF. No /resumes page or rename is needed. At cutover, point the engineering PDF button to https://archive.rishia.in/resume so it continues opening the latest document rather than returning to the listing. Keep /research/resume and /rsh/resume as latest research-PDF links through the existing archive resolver. Do not permanently redirect PDF resolvers to a particular file version: their final PDF hop remains a temporary 302 so future uploads are reflected.

## Redirect behavior

Use permanent HTTP 308 redirects for moved page URLs, directly to the closest matching page. Retain queries, case, and trailing-slash variants appropriately. Limit legacy path-family redirects to known families: /projects, /gallery, /uncompiled, /blurb entries missing from the new site, /ledger, /graph, /stats, and existing short links. Use the exact publication and article maps first, with /research/resume and /rsh/resume before research rules. Never blanket-redirect every path to the homepage or redirect the archive host back to itself. Keep old-only content on the archive. Keep the new /archive page as its own history index and update its old-portfolio entry to archive.rishia.in.

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
| `/stats` | 308 | `https://archive.rishia.in/stats` |
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
- Existing project: `my-portfolio`; its code, environment values and domain assignments were not changed by this implementation.
- GitHub repository: `RishiAhuja/RishiAhuja.github.io`, connected for subsequent Vercel deployments.
- Production and preview build variables: `PORTFOLIO_SITE_URL=https://rishia.in`, `PORTFOLIO_ARCHIVE_ORIGIN=https://archive.rishia.in`.
- `vercel.json` implements 89 rules: exact mapped URLs first, sitemap aliases, the old dynamic /og endpoint and safe legacy-family fallbacks. New /research, /blurb, /_astro and /og/*.png URLs are preserved.
- Canonical URLs, feeds, sitemaps, social-image URLs, JSON-LD, archive links and PDF buttons use the configured build origins. The GitHub Pages build keeps its existing defaults.
- Legacy /#blog, /#education and /#contact links have matching anchors. Only the old reading/upstream/side-quest fragments leave for the archived homepage.
- `npm run build` verifies the migration inventory in addition to all existing checks. `npm run verify:migration -- --url <deployment-origin>` exercises the deployed HTTP routes.

### Manual domain handoff

1. In Vercel's existing `my-portfolio` project, add `archive.rishia.in`, complete the indicated DNS setup if required, and wait for HTTPS to become valid. Keep rishia.in on the old project while checking the archive.
2. Verify archive.rishia.in, a project, a gallery collection, /blurb/openlearn, /resume and /research/resume. The PDF URLs should resolve to the latest files.
3. Move rishia.in from `my-portfolio` to `rishi-portfolio`. If www.rishia.in is configured, assign it to the new project as well and redirect it to rishia.in. Vercel may require only project reassignment when existing DNS already points to Vercel; follow its domain instructions rather than changing unrelated DNS records.
4. After the archive assignment, rebuild the old portfolio with its site metadata origin set to https://archive.rishia.in. Its currently hardcoded site origin and publication metadata were recorded in the initial audit; avoid changing this before the old domain move. This improves the archive's own canonical and sharing metadata without affecting the new project's compatibility redirects.
5. Leave artifacts.rishia.in and other service subdomains in their current projects. Check the 92-route map on the primary domain after the swap.

Until step 1 completes, links from the new deployment to archive-only pages and PDF resolvers cannot reach the future archive hostname. The main new pages and same-project publication/blog redirects can be tested before that step.
