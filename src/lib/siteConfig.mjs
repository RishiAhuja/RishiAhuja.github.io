// Build-time origins: both deployments use the archived portfolio for legacy
// pages and PDF resolvers after the custom-domain move.
function origin(value) {
  const url = new URL(value);
  if (url.protocol !== 'https:' || url.pathname !== '/' || url.search || url.hash) {
    throw new Error(`Expected an HTTPS origin, received ${value}`);
  }
  return url.origin;
}

export const SITE_ORIGIN = origin(process.env.PORTFOLIO_SITE_URL || 'https://rishiahuja.github.io');
export const ARCHIVE_ORIGIN = origin(process.env.PORTFOLIO_ARCHIVE_ORIGIN || 'https://archive.rishia.in');
