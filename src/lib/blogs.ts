import { getCollection, type CollectionEntry } from 'astro:content';
import { calculateMarkdownReadTime } from './readTime';

export type BlogEntry = CollectionEntry<'blogs'>;

export const writingPath = (slug: string) => `/writings/${slug}`;

export const formatPostDate = (date: Date): string =>
  date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

export const getWritings = async (): Promise<BlogEntry[]> => {
  const blogs = await getCollection('blogs');
  return blogs.map((post) => ({ ...post, data: { ...post.data, readTimeInMinutes: calculateMarkdownReadTime(post.body || '') } })).sort((a, b) => b.data.dateAdded.getTime() - a.data.dateAdded.getTime());
};
