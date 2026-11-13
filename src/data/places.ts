// Places I have been for research, hackathons, work, and trips, at city level
// only. Visits are newest first. `confirm` marks a detail that still needs
// checking: the build refuses to publish while any remain.

export interface Visit {
  display: string;
  what: string;
  links?: { label: string; url: string }[];
  upcoming?: boolean;
  confirm?: string;
}

export interface Place {
  id: string;
  city: string;
  country: string;
  group: 'work' | 'trips' | 'home' | 'layovers';
  lat: number;
  lon: number;
  home?: boolean;
  // Trips get their own marker colour.
  trip?: boolean;
  // Airports passed through: drawn lighter and kept out of the city count.
  layover?: boolean;
  // The side the map tries first for this place's label.
  mapLabel?: 'left' | 'right';
  visits: Visit[];
}

const BREMEN_STORY = '/blurb/my-ijcai-ecai-2026-and-germany-experience-in-bremen';
const RIO_STORY = '/blurb/iclr-2026-rio-de-janeiro';
const gallery = (roll: string) => `https://archive.rishia.in/gallery/${roll}`;

export const places: Place[] = [
  {
    id: 'bremen', group: 'work', city: 'Bremen', country: 'Germany', lat: 53.08, lon: 8.8,
    visits: [{
      display: '15–21 Aug 2026',
      what: 'IJCAI–ECAI 2026: talks and posters on ICFD-31k and ScopeBench-PR.',
      links: [
        { label: 'Talks', url: '/talks#ijcai-2026-icfd' },
        { label: 'The story', url: BREMEN_STORY },
        { label: 'Photos', url: gallery('aug-2026') },
      ],
    }],
  },
  {
    id: 'cologne', group: 'trips', city: 'Cologne', country: 'Germany', lat: 50.94, lon: 6.96, mapLabel: 'left', trip: true,
    visits: [{
      display: '22 Aug 2026',
      what: 'A day trip for the cathedral, its South Tower, and the Rhine.',
      links: [{ label: 'The story', url: BREMEN_STORY }, { label: 'Photos', url: gallery('aug-2026') }],
    }],
  },
  {
    id: 'rio', group: 'work', city: 'Rio de Janeiro', country: 'Brazil', lat: -22.91, lon: -43.17,
    visits: [{
      display: 'Apr 2026',
      what: 'ICLR 2026: presented temporal retrieval at the TSALM Workshop.',
      links: [
        { label: 'Talks', url: '/talks#iclr-2026-tsalm' },
        { label: 'The story', url: '/blurb/iclr-2026-rio-de-janeiro' },
        { label: 'Photos', url: gallery('apr-2026') },
      ],
    }],
  },
  {
    id: 'hong-kong', group: 'work', city: 'Hong Kong', country: 'Hong Kong', lat: 22.32, lon: 114.17,
    visits: [{
      display: 'Feb 2027',
      what: 'WSDM 2027: presenting DoubtBench in Findings.',
      upcoming: true,
      links: [{ label: 'Talks', url: '/talks#wsdm-2027' }],
    }],
  },

  // Layovers
  {
    id: 'rome', group: 'layovers', city: 'Rome', country: 'Italy', lat: 41.8, lon: 12.25, layover: true,
    visits: [{ display: 'Apr 2026', what: 'On the way to Rio.', links: [{ label: 'The story', url: RIO_STORY }] }],
  },
  {
    id: 'sao-paulo', group: 'layovers', city: 'São Paulo', country: 'Brazil', lat: -23.43, lon: -46.47, layover: true, mapLabel: 'left',
    visits: [{ display: 'Apr 2026', what: 'A connection to Rio.', links: [{ label: 'The story', url: RIO_STORY }] }],
  },
  {
    id: 'istanbul', group: 'layovers', city: 'Istanbul', country: 'Türkiye', lat: 41.26, lon: 28.74, layover: true,
    visits: [{ display: 'Aug 2026', what: 'On the way to and from Bremen.', links: [{ label: 'The story', url: BREMEN_STORY }] }],
  },

  // Home, study, and nearby visits
  {
    id: 'budhlada', group: 'home', city: 'Budhlada', country: 'India', lat: 29.93, lon: 75.56, home: true, mapLabel: 'left',
    visits: [{ display: 'Mansa district, Punjab', what: 'Where home is.' }],
  },
  {
    id: 'jalandhar', group: 'home', city: 'Jalandhar', country: 'India', lat: 31.33, lon: 75.58, mapLabel: 'left',
    visits: [{ display: '2024–2028', what: 'Studying Information Technology at NIT Jalandhar.' }],
  },
  {
    id: 'mohali', group: 'work', city: 'Mohali', country: 'India', lat: 30.7, lon: 76.72, mapLabel: 'left',
    visits: [{
      display: '31 Oct – 1 Nov 2026',
      what: 'ConfAI at Plaksha University: a flash talk and poster on ICFD-31k.',
      links: [{ label: 'Talks', url: '/talks#confai-2026' }, { label: 'Photos', url: gallery('oct-2026') }],
    }],
  },
  {
    id: 'chandigarh', group: 'trips', city: 'Chandigarh', country: 'India', lat: 30.73, lon: 76.78, trip: true,
    visits: [{
      display: '2024–2026',
      what: 'The PEC hackathon, Seedhe Maut’s SMX concert, Rock Garden, and Sukhna Lake.',
      links: [{ label: 'Photos', url: gallery('nov-2025') }],
    }],
  },
  {
    id: 'rupnagar', group: 'work', city: 'Rupnagar', country: 'India', lat: 30.97, lon: 76.53,
    visits: [{ display: 'May 2025 – Mar 2026', what: 'Annam AI at IIT Ropar: research intern, then entrepreneur in residence.' }],
  },
  {
    id: 'rajpura', group: 'work', city: 'Rajpura', country: 'India', lat: 30.55, lon: 76.65,
    visits: [{ display: '8–9 Feb 2025', what: 'Bharat Tech Xperience Hackathon 2.0 at SVIET.', links: [{ label: 'Photos', url: gallery('feb-2025') }] }],
  },
  {
    id: 'patiala', group: 'work', city: 'Patiala', country: 'India', lat: 30.34, lon: 76.39, mapLabel: 'left',
    visits: [{ display: 'Sep 2025', what: 'Mentored teams at Bit N Build Punjab, Thapar University.', links: [{ label: 'Community', url: '/community#mentoring' }] }],
  },

  // December 2025 trip
  {
    id: 'rohtang', group: 'trips', city: 'Rohtang', country: 'India', lat: 32.37, lon: 77.24, trip: true,
    visits: [{ display: '21 Dec 2025', what: 'Through the Atal Tunnel to Gramphu, below Rohtang Pass.', links: [{ label: 'Photos', url: gallery('dec-2025') }] }],
  },
  {
    id: 'burwa', group: 'trips', city: 'Burwa', country: 'India', lat: 32.26, lon: 77.19, trip: true, mapLabel: 'left',
    visits: [{ display: '20–21 Dec 2025', what: 'A stay in Burwa, just above Manali.', links: [{ label: 'Photos', url: gallery('dec-2025') }] }],
  },
  {
    id: 'kasol', group: 'trips', city: 'Kasol and Manikaran', country: 'India', lat: 32.01, lon: 77.33, trip: true,
    visits: [{ display: '22 Dec 2025', what: 'Manikaran and cafés in the Parvati Valley.', links: [{ label: 'Photos', url: gallery('dec-2025') }] }],
  },
  {
    id: 'bir-billing', group: 'trips', city: 'Bir Billing', country: 'India', lat: 32.05, lon: 76.72, trip: true, mapLabel: 'left',
    visits: [{ display: '23–24 Dec 2025', what: 'A stay in Bir and a trip up to Billing.', links: [{ label: 'Photos', url: gallery('dec-2025') }] }],
  },

  {
    id: 'katra', group: 'trips', city: 'Katra', country: 'India', lat: 32.99, lon: 74.93, trip: true, mapLabel: 'left',
    visits: [{
      display: 'Jun 2025 · Feb 2026',
      what: 'Two climbs to the Vaishno Devi shrine.',
      links: [{ label: 'Photos', url: gallery('feb-2026') }],
    }],
  },

  {
    id: 'delhi', group: 'work', city: 'New Delhi', country: 'India', lat: 28.61, lon: 77.21,
    visits: [{
      display: '2025–2026',
      what: 'HackCBS 8.0, a visa appointment, and the starting point for trips abroad.',
      links: [{ label: 'Photos', url: gallery('nov-2025') }],
    }],
  },

  {
    id: 'mumbai', group: 'work', city: 'Mumbai', country: 'India', lat: 19.08, lon: 72.88, mapLabel: 'left',
    visits: [{
      display: 'Jan 2025',
      what: 'The Level SuperMind hackathon, with Juhu and Versova in between.',
      links: [
        { label: 'The story', url: 'https://archive.rishia.in/blurb/level-supermind-hackathon' },
        { label: 'Photos', url: gallery('jan-2025') },
      ],
    }],
  },
  {
    id: 'bengaluru', group: 'work', city: 'Bengaluru', country: 'India', lat: 12.97, lon: 77.59,
    visits: [{
      display: 'Apr · Oct 2026',
      what: 'YC Startup School India and the Google DeepMind APAC Research Symposium.',
      links: [{ label: 'Photos', url: gallery('oct-2026') }],
    }],
  },
  {
    id: 'kolkata', group: 'work', city: 'Kolkata', country: 'India', lat: 22.58, lon: 88.47,
    visits: [{
      display: '18–20 Dec 2026',
      what: 'IndoML 2026: presenting DoubtBench at the Undergraduate Forum.',
      upcoming: true,
      links: [{ label: 'Talks', url: '/talks#indoml-2026' }],
    }],
  },
];

// The zoomed North India map covers this box (west, south, east, north).
export const NORTH_INDIA: [number, number, number, number] = [74.4, 28.3, 77.9, 33.3];
