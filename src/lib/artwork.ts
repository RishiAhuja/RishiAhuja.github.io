export const COVER_WIDTH = 1086;
export const COVER_HEIGHT = 1448;

export type CoverSet = {
  stem: string;
  cardAvif: string;
  cardWebp: string;
  heroAvif: string;
  heroWebp: string;
  width: number;
  height: number;
};

const coverSet = (stem: string): CoverSet => ({
  stem,
  cardAvif: `/images/covers-opt/${stem}-card.avif`,
  cardWebp: `/images/covers-opt/${stem}-card.webp`,
  heroAvif: `/images/covers-opt/${stem}-hero.avif`,
  heroWebp: `/images/covers-opt/${stem}-hero.webp`,
  width: COVER_WIDTH,
  height: COVER_HEIGHT,
});

const RESEARCH_ARTWORK: Record<string, CoverSet> = {
  ahuja2026icfd31k: coverSet('research-icfd31k'),
  ahuja2026scopebenchpr: coverSet('research-scopebench-pr'),
  ahuja2026retrieval: coverSet('research-temporal-retrieval'),
};

const WRITING_ARTWORK: Record<string, CoverSet> = {
  'bits-of-trust-the-elegance-of-aes': coverSet('writing-aes'),
  art: coverSet('writing-android-runtime'),
  'comprehensive-arch-linux-guide': coverSet('writing-arch-linux-guide'),
  'getting-started-at-bloc-architecture': coverSet('writing-bloc-introduction'),
  'getting-cracked-at-clean-and-bloc-architecture': coverSet('writing-clean-bloc'),
  'go-beneath-the-abstraction-building-interactive-uis-with-fernkit': coverSet('writing-fernkit'),
  'resource-management-with-probabilistic-scheduling-in-the-context-of-linux':
    coverSet('writing-linux-scheduling'),
  'towards-the-modern-transformer-architecture': coverSet('writing-modern-transformer'),
  'building-rosenblatts-perceptron-from-scratch-a-comprehensive-technical-deep-dive':
    coverSet('writing-perceptron-flutter'),
  'shamirs-secret-sharing-scheme-and-multi-party-computation':
    coverSet('writing-shamir-secret-sharing'),
  'your-hardest-hello-world-text-rasterization-1': coverSet('writing-text-rasterization'),
  'you-dont-know-websockets-yet': coverSet('writing-websockets'),
};

export const paperArtwork = (slug: string) => RESEARCH_ARTWORK[slug];

export const writingArtwork = (slug: string) => WRITING_ARTWORK[slug];
