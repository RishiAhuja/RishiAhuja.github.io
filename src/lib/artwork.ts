const RESEARCH_ARTWORK: Record<string, string> = {
  ahuja2026icfd31k: '/images/covers-final/research/research-icfd31k.png',
  ahuja2026scopebenchpr: '/images/covers-final/research/research-scopebench-pr.png',
  ahuja2026retrieval: '/images/covers-final/research/research-temporal-retrieval.png',
};

const WRITING_ARTWORK: Record<string, string> = {
  'bits-of-trust-the-elegance-of-aes': '/images/covers-final/writings/writing-aes.png',
  art: '/images/covers-final/writings/writing-android-runtime.png',
  'comprehensive-arch-linux-guide': '/images/covers-final/writings/writing-arch-linux-guide.png',
  'getting-started-at-bloc-architecture': '/images/covers-final/writings/writing-bloc-introduction.png',
  'getting-cracked-at-clean-and-bloc-architecture': '/images/covers-final/writings/writing-clean-bloc.png',
  'go-beneath-the-abstraction-building-interactive-uis-with-fernkit':
    '/images/covers-final/writings/writing-fernkit.png',
  'resource-management-with-probabilistic-scheduling-in-the-context-of-linux':
    '/images/covers-final/writings/writing-linux-scheduling.png',
  'towards-the-modern-transformer-architecture':
    '/images/covers-final/writings/writing-modern-transformer.png',
  'building-rosenblatts-perceptron-from-scratch-a-comprehensive-technical-deep-dive':
    '/images/covers-final/writings/writing-perceptron-flutter.png',
  'shamirs-secret-sharing-scheme-and-multi-party-computation':
    '/images/covers-final/writings/writing-shamir-secret-sharing.png',
  'your-hardest-hello-world-text-rasterization-1':
    '/images/covers-final/writings/writing-text-rasterization.png',
  'you-dont-know-websockets-yet': '/images/covers-final/writings/writing-websockets.png',
};

export const paperArtwork = (slug: string) => RESEARCH_ARTWORK[slug];

export const writingArtwork = (slug: string) => WRITING_ARTWORK[slug];
