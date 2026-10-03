import type { APIRoute, GetStaticPaths } from 'astro';
import { ogSlug, type OgCard } from '../../lib/og';
import { getOgCards } from '../../lib/ogPages';
import { renderOgImage } from '../../lib/ogImage';

export const prerender = true;

export const getStaticPaths = (async () =>
  (await getOgCards()).map((card) => ({
    params: { slug: ogSlug(card.path) }, props: { card },
  }))
) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ props, site }) => {
  if (!site) throw new Error('OG images require a site URL in astro.config.mjs.');
  const png = await renderOgImage(props.card as OgCard, site);
  return new Response(new Uint8Array(png), {
    headers: { 'Content-Type': 'image/png' },
  });
};
