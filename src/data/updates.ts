export type Update = readonly [date: string, text: string];

// Earlier milestones come from the live portfolio ledger. Current role dates
// and the Flutter course period were confirmed by Rishi.
const original: Update[] = [
  ['Sep 2026', 'Selected to attend the Google DeepMind APAC Research Symposium 2026 at Google Ananta.'],
  ['Sep 2026', 'Selected to present ICFD-31k at ConfAI, Plaksha University.'],
  ['Sep 2026', 'Selected as a summer intern at <a class="highlight" href="/blurb/cisco-interview">Cisco</a>.'],

  ['Sep 2026', 'Served as a reviewer for GlobalSouthAI at NeurIPS 2026.'],
  ['Sep 2026', 'ICFD-31k published in the IJCAI–ECAI 2026 proceedings.'],
  ['Aug 2026', 'Presented ICFD-31k at IJCAI–ECAI 2026 in Bremen.'],
  [
    'Aug 2026',
    'Received the Best Paper Presentation Award and placed runner-up in the GlobalSouthAI 3MT competition.',
  ],
  ['Aug 2026', 'Presented ScopeBench-PR at GlobalSouthAI, IJCAI–ECAI 2026.'],
  ['Jul 2026', 'Served as a reviewer for the FSMD Workshop at ICML 2026.'],
  ['Jul 2026', 'ScopeBench-PR accepted at GlobalSouthAI, IJCAI–ECAI 2026.'],
  ['Jun 2026', 'Awarded an IJCAI–AIJ grant.'],
  ['Apr 2026', 'ICFD-31k accepted to the IJCAI–ECAI 2026 main conference.'],
  [
    'Apr 2026',
    'Presented retrieval-augmented time-series forecasting research at the ICLR 2026 TSALM Workshop.',
  ],
  ['Mar 2026', 'Awarded an ICLR 2026 grant.'],
  ['Mar 2026', 'Temporal retrieval paper accepted at the ICLR 2026 TSALM Workshop.'],
];
const additions: Update[] = [
  ['Oct 2026', 'Selected for the Undergraduate Forum at IndoML 2026.'],
  ['Oct 2026', 'Selected for a CODS 2026 student travel grant; declined due to academic commitments.'],
  ['Apr 2026', 'Selected for and attended YC Startup School India 2026 in Bengaluru.'],
  ['Mar 2026', 'Organised <a href="/community#hackmol">HackMol 7.0</a> at NIT Jalandhar and coordinated the judges.'],
  ['Dec 2025', 'Won first place in the AWS Partner Track at HackCBS 8.0.'],
  ['Nov 2025', 'Won first place in the Qyrus sponsor track at HackCBS 8.0.'],
  ['Jan 2025', 'Placed second at the Level SuperMind National Hackathon in Mumbai.'],
  ['Oct 2024', 'Placed third as a solo participant at the PEC × Prajna AI Hackathon.'],
];
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const monthIndex = (date: string) => {
  const [month, year] = date.split(' ');
  return Number(year) * 12 + months.indexOf(month);
};
export const updates = [...original, ...additions].sort((a, b) => monthIndex(b[0]) - monthIndex(a[0]));
