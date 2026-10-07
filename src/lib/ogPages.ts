import { getCollection, type CollectionEntry } from 'astro:content';
import { blurbPosts } from '../data/blurb';
import { paperArtwork, writingArtwork, blurbArtwork } from './artwork';
import { PORTRAIT } from './constants';
import { paperAwardMarks, pubPath } from './research';
import { getWritings } from './blogs';
import { publishedBlurbs } from './blurbs';
import { COURSE } from '../data/teaching';
import type { OgCard } from './og';

const dateLabel = (date: Date) =>
  new Intl.DateTimeFormat('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC',
  }).format(date);

// The same collections and publication filter used by the actual page routes.
export async function getOgCards(): Promise<OgCard[]> {
  const [papers, writings] = await Promise.all([
    getCollection('research'), getWritings(),
  ]);
  papers.sort((a: CollectionEntry<'research'>, b: CollectionEntry<'research'>) => b.data.sort_date.valueOf() - a.data.sort_date.valueOf());
  writings.sort((a: CollectionEntry<'blogs'>, b: CollectionEntry<'blogs'>) => b.data.dateAdded.valueOf() - a.data.dateAdded.valueOf());

  return [
    {
      path: '/', kind: 'home', title: 'Rishi Ahuja',
      eyebrow: 'Hello', subtitle: 'Undergraduate researcher',
      metadata: 'NIT Jalandhar', artwork: PORTRAIT,
    },
    {
      path: '/research', kind: 'index', title: 'Research', eyebrow: 'Rishi Ahuja',
      subtitle: 'Benchmarks and papers on evaluating AI systems against the claims they actually make.',
      metadata: `${papers.length} papers · Trustworthy AI`,
      cover: papers[0]?.data.cover,
      artwork: papers[0] && paperArtwork(papers[0].slug)?.heroWebp,
    },
    {
      path: '/writings', kind: 'index', title: 'Writing', eyebrow: 'Rishi Ahuja',
      subtitle: 'Systems, protocols, and models.',
      metadata: `${writings.length} posts · Systems & machine learning`,
      cover: writings[0]?.data.cover,
      artwork: writings[0] && writingArtwork(writings[0].slug)?.heroWebp,
    },
    {
      path: '/blurb', kind: 'index', title: 'Blurbs', eyebrow: 'Rishi Ahuja',
      subtitle: 'Conference journeys, things I’m building, and experiences along the way.',
      metadata: `${publishedBlurbs().length} blurbs`, cover: publishedBlurbs()[0]?.cover,
      artwork: blurbArtwork(publishedBlurbs()[0]?.slug)?.heroWebp,
    },
    { path: '/community', kind: 'index', title: 'Community', eyebrow: 'Rishi Ahuja', subtitle: 'Teaching, mentoring, and building developer communities.', metadata: 'GDGC · HackMol · Flutter', cover: 'mint' },
    { path: '/flutter-bootcamp', kind: 'index', title: 'Applied Mobile Engineering', eyebrow: 'CS404 · Flutter Bootcamp', subtitle: 'Fourteen lectures, from your first widgets to signed releases.', metadata: `${COURSE.date} · 23+ hours`, cover: 'blue', artwork: '/images/teaching/lecture-01.webp' },
    { path: '/colophon', kind: 'index', title: 'Colophon', eyebrow: 'Rishi Ahuja', subtitle: 'How this site is made, and the choices behind it.', metadata: 'Type · Colour · Artwork · Code', cover: 'sand' },
    { path: '/archive', kind: 'index', title: 'Archive', eyebrow: 'Rishi Ahuja', subtitle: 'Earlier portfolios and pieces of the site’s history.', metadata: 'A record since 2021', cover: 'mist' },
    { path: '/links', kind: 'index', title: 'Links', eyebrow: 'Rishi Ahuja', subtitle: 'Find me elsewhere, get in touch, or explore my work.', metadata: 'Research · Engineering · Teaching', cover: 'sky' },
    { path: '/resume', kind: 'index', title: 'Résumés', eyebrow: 'Rishi Ahuja', subtitle: 'Engineering experience and academic work.', metadata: 'Research CV · Engineering résumé', cover: 'rose' },
    { path: '/404', kind: 'index', title: 'Page not found', eyebrow: 'Rishi Ahuja', subtitle: 'Explore research, writing, and blurbs.', metadata: '404' },
    ...papers.map((paper: CollectionEntry<'research'>): OgCard => ({
      path: pubPath(paper.slug), kind: 'research', eyebrow: 'Research',
      title: paper.data.short_name,
      subtitle: paper.data.title.startsWith(`${paper.data.short_name}:`)
        ? paper.data.title.slice(paper.data.short_name.length + 1).trim()
        : paper.data.title,
      metadata: paper.data.venue, cover: paper.data.cover,
      artwork: paperArtwork(paper.slug)?.heroWebp,
      badge: paperAwardMarks(paper.data)[0],
    })),
    ...writings.map((post: CollectionEntry<'blogs'>): OgCard => ({
      path: `/writings/${post.slug}`, kind: 'writing', eyebrow: 'Writing',
      title: post.data.title, subtitle: post.data.brief,
      metadata: `${dateLabel(post.data.dateAdded)} · ${post.data.readTimeInMinutes} min read`,
      cover: post.data.cover, artwork: writingArtwork(post.slug)?.heroWebp,
      author: post.data.author,
    })),
    ...blurbPosts.filter((post) => post.status === 'published').map((post): OgCard => ({
      path: `/blurb/${post.slug}`, kind: 'blurb', eyebrow: 'Blurb',
      title: post.title, subtitle: post.subtitle || post.description,
      cover: post.cover, artwork: blurbArtwork(post.slug)?.heroWebp,
      metadata: [
        dateLabel(new Date(`${post.publishedDate}T00:00:00Z`)),
        post.readTime && `${post.readTime} min read`,
      ].filter(Boolean).join(' · '),
    })),
  ];
}
