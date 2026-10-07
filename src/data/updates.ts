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
  ['Oct 2026', 'Started as a visiting scholar and undergraduate researcher at the <a href="https://bagcilab.com/people/rishi-ahuja/" target="_blank" rel="noopener noreferrer">Machine and Hybrid Intelligence Lab</a>, Northwestern University.'],
  ['Oct 2026', 'Became Mobile Development Lead at <a href="/community#gdgc">GDGC, NIT Jalandhar</a>.'],
  ['Apr 2026', 'Selected for YC Startup School India and the OpenAI Codex Hackathon in Bengaluru.'],
  ['Mar 2026', 'Organised <a href="/community#hackmol">HackMol 7.0</a> at NIT Jalandhar and coordinated the judges.'],
  ['Jan 2026', 'Completed teaching a <a href="/flutter-bootcamp">14-lecture Flutter bootcamp</a> at GDGC, NIT Jalandhar.'],
  ['Dec 2025', 'Won first place in the AWS Partner Track at HackCBS 8.0.'],
  ['Nov 2025', 'Won first place in the Qyrus sponsor track at HackCBS 8.0.'],
  ['Nov 2025', 'Presented agricultural technology work at IIT Ropar to a delegation from MeitY and the Ministry of Agriculture.'],
  ['Sep 2025', 'Mentored teams at Bit N Build Punjab, Thapar University.'],
  ['Jun 2025', 'Co-founded <a href="https://openlearn.org.in/" target="_blank" rel="noopener noreferrer">OpenLearn</a>, a community for learning and sharing technical work.'],
  ['Jan 2025', 'Placed second at the Level SuperMind National Hackathon in Mumbai.'],
  ['Oct 2024', 'Placed third as a solo participant at the PEC × Prajna AI Hackathon.'],
];
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const monthIndex = (date: string) => {
  const [month, year] = date.split(' ');
  return Number(year) * 12 + months.indexOf(month);
};
export const updates = [...original, ...additions].sort((a, b) => monthIndex(b[0]) - monthIndex(a[0]));
