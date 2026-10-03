export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;

export type OgCard = {
  path: string;
  kind: 'home' | 'index' | 'research' | 'writing' | 'blurb';
  title: string;
  subtitle: string;
  eyebrow: string;
  metadata: string;
  cover?: string;
  artwork?: string;
  badge?: string;
  author?: string;
};

export const normalizePagePath = (pathname: string) =>
  `/${pathname.split('/').filter(Boolean).join('/')}`;

export const ogSlug = (pathname: string) =>
  normalizePagePath(pathname).slice(1) || 'index';

export const ogImagePath = (pathname: string) => `/og/${ogSlug(pathname)}.png`;
