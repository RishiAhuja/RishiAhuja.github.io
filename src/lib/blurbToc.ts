import type { BlurbContent } from '../data/blurb';
import type { TocItem } from './blogMarkdown';

const slugify = (value: string, used: Map<string, number>) => {
  const base =
    value
      .replace(/<[^>]+>/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '') || 'section';
  const count = used.get(base) ?? 0;
  used.set(base, count + 1);
  return count === 0 ? base : `${base}-${count + 1}`;
};

export const blurbHeadings = (content: BlurbContent[]): TocItem[] => {
  const used = new Map<string, number>();
  const headings: TocItem[] = [];

  for (const item of content) {
    if (item.type !== 'heading' || !item.content) continue;
    const depth = item.level || 2;
    if (depth < 2 || depth > 3) continue;
    headings.push({
      depth,
      text: item.content,
      id: slugify(item.content, used),
    });
  }

  return headings;
};
