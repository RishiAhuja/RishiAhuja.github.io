import type { APIRoute } from 'astro';
import { feedEntries, xmlEscape } from '../lib/discovery';
export const GET: APIRoute = async ({site}) => {
  const origin = new URL('/', site).href;
  const entries = await feedEntries();
  const items = entries.map((entry) => {
    const url = xmlEscape(new URL(entry.path, site).href);
    const description = entry.original ? `${entry.description} Originally published on Hashnode: ${entry.original}` : entry.description;
    return `<item><title>${xmlEscape(entry.title)}</title><link>${url}</link><guid isPermaLink="true">${url}</guid><description>${xmlEscape(description)}</description><pubDate>${entry.date.toUTCString()}</pubDate><category>${entry.category}</category></item>`;
  }).join('');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>Rishi Ahuja — Writing and blurbs</title><link>${origin}</link><description>Systems, machine learning, and experiences along the way.</description><language>en</language><atom:link href="${new URL('/feed.xml', site).href}" rel="self" type="application/rss+xml"/><lastBuildDate>${entries[0].date.toUTCString()}</lastBuildDate>${items}</channel></rss>`, {headers: {'Content-Type': 'application/rss+xml; charset=utf-8'}});
};
