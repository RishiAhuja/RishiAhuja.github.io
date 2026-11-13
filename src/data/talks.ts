// Talks, posters, and teaching, newest first. Dates are ISO (YYYY-MM-DD or
// YYYY-MM); `display` is the date as shown. `confirm` marks a detail that
// still needs checking: the build refuses to publish while any remain.

export type TalkFormat = 'Talk' | 'Poster' | 'Lightning talk' | 'Flash talk' | '3MT' | 'Lecture series' | 'Orientation talk' | 'Presentation';

export interface Talk {
  id: string;
  title: string;
  event: string;
  place: string;
  date: string;
  display: string;
  formats: TalkFormat[];
  note?: string;
  award?: string;
  paper?: string;
  links: { label: string; url: string }[];
  photo?: { src: string; alt: string; width: number; height: number };
  story?: { label: string; url: string };
  confirm?: string;
}

export const talks: Talk[] = [
  {
    id: 'wsdm-2027',
    title: 'DoubtBench: Does Self-Doubt Help Language Models—or Just Make Them Check?',
    event: 'Findings of WSDM 2027',
    place: 'Hong Kong',
    date: '2027-02-15',
    display: '15–19 Feb 2027',
    formats: ['Presentation'],
    note: 'The exact day is not announced yet.',
    paper: '/pub/ahuja2027doubtbench',
    links: [{ label: 'Code', url: 'https://github.com/RishiAhuja/ahuja2027doubtbench' }],
  },
  {
    id: 'indoml-2026',
    title: 'DoubtBench: Does Self-Doubt Help Language Models—or Just Make Them Check?',
    event: 'IndoML 2026 · Undergraduate Forum',
    place: 'Kolkata, India',
    date: '2026-12-20',
    display: '20 Dec 2026',
    formats: ['Poster'],
    note: 'At the IIT Kharagpur Kolkata Extension Centre, on the conference’s third day.',
    paper: '/pub/ahuja2027doubtbench',
    links: [
      { label: 'Poster', url: 'https://artifacts.rishia.in/talks/2026-indoml-doubtbench-poster.pdf' },
      { label: 'IndoML 2026', url: 'https://indoml.in' },
    ],
  },
  {
    id: 'confai-2026',
    title: 'ICFD-31k: A Large-Scale Dataset and Benchmark for Real-Time Conversational Fraud Detection',
    event: 'ConfAI, Plaksha University',
    place: 'Mohali, India',
    date: '2026-11-01',
    display: '31 Oct – 1 Nov 2026',
    formats: ['Flash talk', 'Poster'],
    paper: '/pub/ahuja2026icfd31k',
    links: [
      { label: 'Slide', url: 'https://artifacts.rishia.in/talks/2026-confai-icfd31k-flash-talk.pdf' },
      { label: 'Poster', url: 'https://artifacts.rishia.in/talks/2026-confai-icfd31k-poster.pdf' },
    ],
    photo: { src: '/images/talks/confai-podium.webp', alt: 'Rishi presenting at a podium, the slide titled “Why a new benchmark?”', width: 960, height: 640 },
  },
  {
    id: 'ijcai-2026-icfd',
    title: 'ICFD-31k: A Large-Scale Dataset and Benchmark for Real-Time Conversational Fraud Detection',
    event: 'IJCAI–ECAI 2026 · AI for Social Good',
    place: 'Bremen, Germany',
    date: '2026-08-20',
    display: '20 Aug 2026',
    formats: ['Talk', 'Poster'],
    note: 'A morning talk in Room 4.1 B, then the evening poster session.',
    paper: '/pub/ahuja2026icfd31k',
    links: [
      { label: 'Slides', url: 'https://artifacts.rishia.in/talks/2026-ijcai-icfd31k-slides.pdf' },
      { label: 'Poster', url: 'https://artifacts.rishia.in/talks/2026-ijcai-icfd31k-poster.pdf' },
      { label: 'Paper', url: 'https://www.ijcai.org/proceedings/2026/786' },
    ],
    photo: { src: '/images/talks/icfd-talk.webp', alt: 'Rishi on stage beside the ICFD-31k title slide', width: 960, height: 720 },
    story: { label: 'The Bremen blurb', url: '/blurb/my-ijcai-ecai-2026-and-germany-experience-in-bremen' },
  },
  {
    id: 'ijcai-2026-proxy',
    title: 'Discrete Cosine Transform Based Decorrelated Attention for Vision Transformers',
    event: 'IJCAI–ECAI 2026',
    place: 'Bremen, Germany',
    date: '2026-08-19',
    display: '19 Aug 2026',
    formats: ['Talk', 'Poster'],
    note: 'By Hongyi Pan, Emadeldeen Hamdan, Xin Zhu, Ahmet Enis Cetin, and Ulas Bagci. Presented for Prof. Bagci’s Machine and Hybrid Intelligence Lab at Northwestern, at his request the day before.',
    links: [
      { label: 'Paper', url: 'https://doi.org/10.24963/ijcai.2026/522' },
      { label: 'Code', url: 'https://github.com/NUBagciLab/DCT-Transformer' },
      { label: 'The lab', url: 'https://bagcilab.com/' },
    ],
    photo: { src: '/images/talks/proxy-talk.webp', alt: 'The paper’s title slide on screen in a lecture hall', width: 720, height: 960 },
    story: { label: 'The Bremen blurb', url: '/blurb/my-ijcai-ecai-2026-and-germany-experience-in-bremen' },
  },
  {
    id: 'globalsouthai-2026',
    title: 'Do LLM Reviewers Respect Scope? ScopeBench-PR: A Benchmark for Scope Fairness in Peer Review',
    event: 'GlobalSouthAI Workshop · IJCAI–ECAI 2026',
    place: 'Bremen, Germany',
    date: '2026-08-17',
    display: '17 Aug 2026',
    formats: ['Lightning talk'],
    award: 'Best Paper Presentation',
    paper: '/pub/ahuja2026scopebenchpr',
    links: [
      { label: 'Slides', url: 'https://artifacts.rishia.in/talks/2026-globalsouthai-scopebench-slides.pdf' },
      { label: 'Workshop', url: 'https://sites.google.com/view/globalsouthai-ijcai26/home' },
    ],
    photo: { src: '/images/talks/scopebench-talk.webp', alt: 'Rishi presenting ScopeBench-PR in a seminar room', width: 722, height: 960 },
    story: { label: 'The Bremen blurb', url: '/blurb/my-ijcai-ecai-2026-and-germany-experience-in-bremen' },
  },
  {
    id: 'globalsouthai-3mt',
    title: 'ScopeBench-PR in three minutes',
    event: 'GlobalSouthAI 3MT · IJCAI–ECAI 2026',
    place: 'Bremen, Germany',
    date: '2026-08-17',
    display: '17 Aug 2026',
    formats: ['3MT'],
    award: 'Runner-up',
    note: 'Three minutes and one static slide for the whole idea.',
    paper: '/pub/ahuja2026scopebenchpr',
    links: [{ label: 'Slide', url: 'https://artifacts.rishia.in/talks/2026-globalsouthai-3mt-slide.pdf' }],
    photo: { src: '/images/talks/gsai-crew.webp', alt: 'GlobalSouthAI participants together after the workshop', width: 960, height: 540 },
    story: { label: 'The Bremen blurb', url: '/blurb/my-ijcai-ecai-2026-and-germany-experience-in-bremen' },
  },
  {
    id: 'iclr-2026-tsalm',
    title: 'Retrieval Mechanisms Surpass Long-Context Scaling in Time Series Forecasting',
    event: 'ICLR 2026 · TSALM Workshop',
    place: 'Rio de Janeiro, Brazil',
    date: '2026-04',
    display: 'Apr 2026',
    formats: ['Poster'],
    paper: '/pub/ahuja2026retrieval',
    links: [
      { label: 'Poster', url: 'https://artifacts.rishia.in/research/ahuja2026retrieval/poster.pdf' },
      { label: 'OpenReview', url: 'https://openreview.net/forum?id=Qj96MlCmZw' },
    ],
    photo: { src: '/images/talks/iclr-poster2.webp', alt: 'Rishi with thumbs up beside his ICLR poster', width: 720, height: 960 },
    story: { label: 'The Rio blurb', url: '/blurb/iclr-2026-rio-de-janeiro' },
  },
  {
    id: 'flutter-bootcamp',
    title: 'Applied Mobile Engineering',
    event: 'Flutter bootcamp · GDGC, NIT Jalandhar',
    place: 'Jalandhar, India',
    date: '2025-12-18',
    display: '18 Dec 2025 – 14 Jan 2026',
    formats: ['Lecture series'],
    note: 'Fourteen recorded lectures, from widgets and state to networking, inference, and signed releases.',
    links: [
      { label: 'Lectures', url: '/flutter-bootcamp' },
      { label: 'Curriculum', url: '/flutter-bootcamp/curriculum' },
    ],
    photo: { src: '/images/teaching/lecture-01.webp', alt: '', width: 1280, height: 720 },
  },
  {
    id: 'gdgc-orientation',
    title: 'App Development',
    event: 'GDGC orientation · NIT Jalandhar',
    place: 'Jalandhar, India',
    date: '2026-10-16',
    display: '16 Oct 2026',
    formats: ['Orientation talk'],
    note: 'Introducing mobile development to new GDGC members.',
    links: [{ label: 'Slides', url: 'https://artifacts.rishia.in/talks/2026-gdgc-app-development-slides.pdf' }],
    photo: { src: '/images/talks/gdgc-orientation.webp', alt: 'Rishi presenting at the GDGC orientation', width: 720, height: 960 },
  },
];
