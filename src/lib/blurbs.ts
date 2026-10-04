import { blurbPosts } from '../data/blurb';

export const blurbPath = (slug: string) => `/blurb/${slug}`;
export const publishedBlurbs = () => blurbPosts.filter((post) => post.status === 'published')
  .sort((a, b) => b.publishedDate.localeCompare(a.publishedDate));
export const paperBlurbs: Record<string, string[]> = {
  ahuja2026icfd31k: ['my-ijcai-ecai-2026-and-germany-experience-in-bremen'],
  ahuja2026scopebenchpr: ['my-ijcai-ecai-2026-and-germany-experience-in-bremen'],
  ahuja2026retrieval: ['iclr-2026-rio-de-janeiro'],
};
