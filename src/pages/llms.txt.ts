import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { publishedBlurbs, blurbPath } from '../lib/blurbs';
import { getWritings, writingPath } from '../lib/blogs';
import { pubPath } from '../lib/research';
import { LINKS } from '../lib/constants';

// The llms.txt convention: a Markdown index for language-model agents. The
// complete structured profile lives at /machine.
export const GET: APIRoute = async ({ site }) => {
  const url = (path: string) => new URL(path, site).href;
  const papers = (await getCollection('research')).sort((a, b) => b.data.sort_date.getTime() - a.data.sort_date.getTime());
  const writings = await getWritings();
  const lines = [
    '# Rishi Ahuja',
    '',
    '> Undergraduate researcher at NIT Jalandhar working on trustworthy AI evaluation, temporal retrieval, and conversational fraud detection.',
    '',
    `The complete structured profile, with abstracts, experience, teaching, and contact details, is at ${url('/machine')}.`,
    '',
    '## Research',
    ...papers.map((paper) => `- [${paper.data.title}](${url(pubPath(paper.slug))}): ${paper.data.venue}. ${paper.data.tldr}`),
    '',
    '## Writing',
    ...writings.map((post) => `- [${post.data.title}](${url(writingPath(post.slug))}): ${post.data.brief}`),
    '',
    '## Blurbs',
    ...publishedBlurbs().map((note) => `- [${note.title}](${url(blurbPath(note.slug))}): ${note.subtitle || note.description}`),
    '',
    '## Profiles',
    `- [Machine-readable profile](${url('/machine')})`,
    `- [Résumés](${url('/resume')})`,
    `- [Google Scholar](${LINKS.GOOGLE_SCHOLAR})`,
    `- [ORCID](${LINKS.ORCID})`,
    `- [OpenReview](${LINKS.OPENREVIEW})`,
    `- [GitHub](${LINKS.GITHUB})`,
    `- Email: ${LINKS.EMAIL.replace('mailto:', '')}`,
    '',
  ];
  return new Response(lines.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
