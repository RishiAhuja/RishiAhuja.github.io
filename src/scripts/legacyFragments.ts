// Old homepage sections that live only in the archived portfolio. URL
// fragments never reach HTTP redirect rules, so handle just these locally.
const archivedSections = new Set(['papers', 'upstream', 'sidequests']);
function preserveLegacySection() {
  if (location.pathname !== '/' || !archivedSections.has(location.hash.slice(1))) return;
  const archiveOrigin = document.body?.dataset.archiveOrigin;
  if (!archiveOrigin || archiveOrigin === location.origin) return;
  location.replace(new URL(`/${location.search}${location.hash}`, archiveOrigin).href);
}
document.addEventListener('astro:page-load', preserveLegacySection);
window.addEventListener('hashchange', preserveLegacySection);
if (document.readyState !== 'loading') preserveLegacySection();
