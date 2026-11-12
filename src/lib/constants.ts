import { ARCHIVE_ORIGIN, SITE_ORIGIN } from './siteConfig.mjs';

export const PORTRAIT = '/images/rishi-ahuja.jpg';
// Responsive copies of PORTRAIT; the JPEG stays the OG card source.
export const PORTRAIT_WIDTHS = [480, 800, 1268] as const;
export const portraitSrcset = (format: 'avif' | 'webp') =>
  PORTRAIT_WIDTHS.map((width) => `/images/portrait/rishi-ahuja-${width}.${format} ${width}w`).join(', ');
export const PORTRAIT_SIZES = '(min-width: 769px) 42vw, 100vw';

export const TWITTER_HANDLE = '@Rishi2220';

// The site owner as a schema.org author, tied to the homepage Person entity.
export const authorSchema = (site: URL) => ({
  '@type': 'Person',
  '@id': personId(site),
  name: 'Rishi Ahuja',
  url: new URL('/', site).href,
});
export const personId = (site: URL) => new URL('/#person', site).href;

export const LINKS = {
  RESUME: '/resume',
  ARCHIVE: ARCHIVE_ORIGIN,
  // First-party URLs; vercel.json forwards them to the archive's live resolvers,
  // so moving the resolvers later only changes those two redirects.
  RESEARCH_RESUME: `${SITE_ORIGIN}/research/resume`,
  ENGINEERING_RESUME: `${SITE_ORIGIN}/engineering/resume`,
  CAL_COM: 'https://cal.com/rishi2220',
  HASHNODE: 'https://rishi2220.hashnode.dev/',
  YOUTUBE: 'https://www.youtube.com/@rishi2220',
  INSTAGRAM: 'https://www.instagram.com/rishia2220/',
  TWITTER: 'https://twitter.com/Rishi2220',
  GITHUB: 'https://github.com/RishiAhuja',
  LINKEDIN: 'https://www.linkedin.com/in/rishi-ahuja-b1a224310',
  GOOGLE_SCHOLAR: 'https://scholar.google.com/citations?hl=en&user=EZff3KsAAAAJ',
  OPENREVIEW: 'https://openreview.net/profile?id=~Rishi_Ahuja1',
  ORCID: 'https://orcid.org/0009-0000-3403-010X',
  EMAIL: 'mailto:rishia2220@gmail.com',
  MHI: 'https://bagcilab.com/people/rishi-ahuja/',
} as const;
