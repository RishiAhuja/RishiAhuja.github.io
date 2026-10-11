// Build-time origins: GitHub Pages retains its current URLs while the
// separately configured Vercel project prepares the custom-domain move.
function origin(value) {
  const url = new URL(value);
  if (url.protocol !== 'https:' || url.pathname !== '/' || url.search || url.hash) {
    throw new Error(`Expected an HTTPS origin, received ${value}`);
  }
  return url.origin;
}

export const SITE_ORIGIN = origin(process.env.PORTFOLIO_SITE_URL || 'https://rishiahuja.github.io');
export const ARCHIVE_ORIGIN = origin(process.env.PORTFOLIO_ARCHIVE_ORIGIN || 'https://rishia.in');
