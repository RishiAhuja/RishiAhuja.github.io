import type { APIRoute } from 'astro';
import { canonicalPages, xmlEscape } from '../lib/discovery';
export const GET: APIRoute = async ({ site }) => {
  const entries = (await canonicalPages()).map((page) => `<url><loc>${xmlEscape(new URL(page.path, site).href)}</loc>${page.lastmod ? `<lastmod>${page.lastmod.toISOString().slice(0, 10)}</lastmod>` : ''}</url>`).join('');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entries}</urlset>`, {headers: {'Content-Type': 'application/xml; charset=utf-8'}});
};
