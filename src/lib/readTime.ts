import type { BlurbContent } from '../data/blurb';

export const READING_WORDS_PER_MINUTE = 150;
const PHOTO_SECONDS = 12;
const FIGURE_SECONDS = 30;
const VIDEO_FALLBACK_SECONDS = 120;
const countWords = (text = '') => text.replace(/<[^>]*>/g, ' ').replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
  .replace(/https?:\/\/\S+/g, '').trim().split(/\s+/).filter(Boolean).length;

export function getReadTimeBreakdown(content: BlurbContent[]) {
  let totalWords = 0, mediaSeconds = 0, codeSeconds = 0;
  const breakdown: Record<string, number> = {};
  for (const item of content) {
    breakdown[item.type] = (breakdown[item.type] || 0) + 1;
    switch (item.type) {
      case 'paragraph': case 'heading': case 'quote':
        totalWords += countWords(item.content); break;
      case 'list': totalWords += (item.items || []).reduce((sum, text) => sum + countWords(text), 0); break;
      case 'code': codeSeconds += Math.max(15, countWords(item.content) / 80 * 60); break;
      case 'image': mediaSeconds += item.technical ? FIGURE_SECONDS : PHOTO_SECONDS; break;
      case 'tweetImage': mediaSeconds += FIGURE_SECONDS; break;
      case 'carousel': mediaSeconds += (item.images?.length || 0) * PHOTO_SECONDS; break;
      case 'video': mediaSeconds += item.durationSeconds ?? VIDEO_FALLBACK_SECONDS; break;
      case 'twitter': mediaSeconds += 20; break;
      case 'linkEmbed': totalWords += countWords(item.title) + countWords(item.description); break;
    }
  }
  const readingTime = totalWords / READING_WORDS_PER_MINUTE + codeSeconds / 60;
  const mediaTime = mediaSeconds / 60;
  return { totalWords, readingTime, mediaTime, totalTime: Math.max(1, Math.ceil(readingTime + mediaTime)), breakdown };
}

export const calculateReadTime = (content: BlurbContent[]) => getReadTimeBreakdown(content).totalTime;

export function calculateMarkdownReadTime(markdown: string): number {
  let studySeconds = 0;
  const prose = markdown
    .replace(/```[^\n]*\n([\s\S]*?)```/g, (_, code: string) => {
      studySeconds += Math.max(15, countWords(code) / 80 * 60); return ' ';
    })
    .replace(/\$\$([\s\S]*?)\$\$|<latex-preview[^>]*>([\s\S]*?)<\/latex-preview>/g, (_, math: string, preview: string) => {
      studySeconds += (math || preview).length > 100 ? 15 : 5; return ' ';
    })
    .replace(/!\[[^\]]*\]\([^)]+\)|<img\b[^>]*>/g, () => { studySeconds += FIGURE_SECONDS; return ' '; });
  return Math.max(1, Math.ceil(countWords(prose) / READING_WORDS_PER_MINUTE + studySeconds / 60));
}
