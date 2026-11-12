export const FEATURED_SLUGS = [
  'ahuja2027doubtbench',
  'ahuja2026icfd31k',
  'ahuja2026scopebenchpr',
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
export const bibPath = (slug: string) => `/pub/${slug}.bib`;

type CitationFields = {
  title: string;
  authors: { name: string }[];
  venue: string;
  status: 'accepted' | 'published';
  sort_date: Date;
  published_date?: Date;
  bibtex?: string;
  citation?: { doi?: string; booktitle?: string; publisher?: string; publisher_short?: string; first_page?: number; last_page?: number };
  event?: { label: string };
};

// Citations name people without honorifics such as "Dr.".
export const citationName = (name: string) => name.replace(/^(?:Dr|Prof)\.?\s+/i, '');

// The year a paper is cited under: BibTeX's year when present (an accepted
// paper appears in next year's proceedings), otherwise its own dates.
export const paperYear = (paper: CitationFields) =>
  Number(paper.bibtex?.match(/\byear\s*=\s*\{?(\d{4})/)?.[1]) || (paper.published_date ?? paper.sort_date).getUTCFullYear();

const sentence = (text: string) => (/[.?!]$/.test(text) ? text : `${text}.`);
const joinNames = (names: string[], conjunction: string) =>
  names.length < 3 ? names.join(` ${conjunction} `) : `${names.slice(0, -1).join(', ')}, ${conjunction} ${names.at(-1)}`;
const pageRange = (paper: CitationFields) =>
  paper.citation?.first_page && paper.citation.last_page ? `${paper.citation.first_page}–${paper.citation.last_page}` : undefined;
// Accepted papers are forthcoming until their event; unarchived workshop papers
// that were already presented are cited as presentations.
const isForthcoming = (paper: CitationFields) => paper.status === 'accepted' && paper.event?.label.startsWith('Accepted') === true;
const isPresentation = (paper: CitationFields) => paper.status === 'accepted' && !isForthcoming(paper);
// Official proceedings title when published; otherwise the venue as displayed.
export const containerTitle = (paper: CitationFields) => paper.citation?.booktitle ?? paper.venue.replaceAll(' · ', ', ');
const citedPublisher = (paper: CitationFields) => paper.citation?.publisher_short ?? paper.citation?.publisher;
const doiUrl = (paper: CitationFields) => (paper.citation?.doi ? `https://doi.org/${paper.citation.doi}` : undefined);

export const acmCitation = (paper: CitationFields) => {
  const details = [citedPublisher(paper), pageRange(paper)].filter(Boolean).join(', ');
  return [
    sentence(joinNames(paper.authors.map((author) => citationName(author.name)), 'and')),
    `${paperYear(paper)}.`,
    sentence(paper.title),
    sentence(`${isPresentation(paper) ? 'Presented at' : 'In'} ${containerTitle(paper)}`),
    details && sentence(details),
    isForthcoming(paper) && 'To appear.',
    doiUrl(paper),
  ].filter(Boolean).join(' ');
};

const apaName = (name: string) => {
  const parts = citationName(name).split(/\s+/);
  const initials = parts.slice(0, -1).map((part) => `${part[0]}.`).join(' ');
  return initials ? `${parts.at(-1)}, ${initials}` : parts[0];
};

export const apaCitation = (paper: CitationFields) => {
  const names = paper.authors.map((author) => apaName(author.name));
  const authors = names.length < 2 ? names.join('') : `${names.slice(0, -1).join(', ')}, & ${names.at(-1)}`;
  const pages = pageRange(paper);
  const container = `${containerTitle(paper)}${pages ? ` (pp. ${pages})` : ''}`;
  return [
    authors,
    `(${isForthcoming(paper) ? 'in press' : paperYear(paper)}).`,
    sentence(paper.title),
    sentence(`${isPresentation(paper) ? 'Paper presented at' : 'In'} ${container}`),
    citedPublisher(paper) && sentence(citedPublisher(paper)!),
    doiUrl(paper),
  ].filter(Boolean).join(' ');
};

export const resourceLabel = (label: string) => {
  const value = label.toLowerCase();
  if (value.includes('openreview') || value.includes('paper')) return 'Paper';
  if (value.includes('pdf')) return 'PDF';
  if ((value.includes('github') || value.includes('code')) && value.includes('data')) return 'Code & data';
  if (value.includes('github') || value.includes('code')) return 'Code';
  if (value.includes('data')) return 'Dataset';
  if (value.includes('poster')) return 'Poster';
  if (value.includes('blog')) return 'Blog';
  if (value.includes('workshop')) return 'Workshop';
  if (value.includes('project')) return 'Project';
  if (value.includes('conference') || value.includes('venue') || value.includes('site')) return 'Venue';
  return label;
};

export const isResourceLink = (label: string, primary?: boolean) => {
  if (primary) return true;
  const value = label.toLowerCase();
  return /paper|openreview|github|code|data|poster|arxiv|blog|pdf/.test(value);
};
