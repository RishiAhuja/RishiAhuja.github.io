import { getCollection } from 'astro:content';
import { publishedBlurbs, blurbPath } from './blurbs';
import { getWritings, writingPath } from './blogs';
import { pubPath } from './research';

export const xmlEscape = (value: string) => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&apos;');

export async function canonicalPages() {
  const papers = await getCollection('research');
  return [
    { path: '/' }, { path: '/research' }, { path: '/writings' }, { path: '/blurb' },
    ...papers.map((paper) => ({path: pubPath(paper.slug)})),
    ...publishedBlurbs().map((note) => ({path: blurbPath(note.slug)})),
  ];
}

export async function feedEntries() {
  return [
    ...(await getWritings()).map((post) => ({ title: post.data.title, description: post.data.brief, path: writingPath(post.slug), date: post.data.dateAdded, category: 'Writing', original: post.data.hashnodeUrl })),
    ...publishedBlurbs().map((note) => ({ title: note.title, description: note.subtitle || note.description, path: blurbPath(note.slug), date: new Date(`${note.publishedDate}T00:00:00Z`), category: 'Blurbs', original: undefined })),
  ].sort((a, b) => b.date.getTime() - a.date.getTime());
}
