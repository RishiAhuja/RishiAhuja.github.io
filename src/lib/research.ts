export const FEATURED_SLUGS = [
  'ahuja2026icfd31k',
  'ahuja2026scopebenchpr',
  'ahuja2026retrieval',
] as const;

type AwardEntry = {
  label: string;
  result?: string;
};

type AwardFields = {
  awards: AwardEntry[];
  award?: string;
  award_amount?: string;
};

export const formatAwardMark = (award: AwardEntry) =>
  award.result ? `${award.result} · ${award.label}` : award.label;

const formatGrantMark = (paper: AwardFields) => {
  if (!paper.award) return undefined;
  return paper.award_amount ? `${paper.award} · ${paper.award_amount}` : paper.award;
};

export const paperAwardMarks = (paper: AwardFields) =>
  [...paper.awards.map(formatAwardMark), formatGrantMark(paper)].filter(
    (mark): mark is string => Boolean(mark),
  );

export const paperCardAward = (paper: AwardFields) => paper.awards[0]?.label;

export const pubPath = (slug: string) => `/pub/${slug}`;

export const resourceLabel = (label: string) => {
  const value = label.toLowerCase();
  if (value.includes('openreview') || value.includes('paper')) return 'Paper';
  if (value.includes('github') || value.includes('code')) return 'Code';
  if (value.includes('data')) return 'Dataset';
  if (value.includes('poster')) return 'Poster';
  if (value.includes('blog')) return 'Blog';
  if (value.includes('workshop') || value.includes('project')) return 'Project';
  if (value.includes('conference') || value.includes('venue') || value.includes('site')) return 'Venue';
  return label;
};

export const isResourceLink = (label: string, primary?: boolean) => {
  if (primary) return true;
  const value = label.toLowerCase();
  return /paper|openreview|github|code|data|poster|arxiv|blog/.test(value);
};
