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
};

export const formatAwardMark = (award: AwardEntry) =>
  award.result ? `${award.result} · ${award.label}` : award.label;

export const paperAwardMarks = (paper: AwardFields) =>
  [...paper.awards.map(formatAwardMark), paper.award].filter((mark): mark is string => Boolean(mark));

export const paperCardAward = (paper: AwardFields) => paper.awards[0]?.label ?? paper.award;

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
