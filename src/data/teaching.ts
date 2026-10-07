export const COURSE = {
  "title": "CS404: Applied Mobile Engineering",
  "subtitle": "Flutter Development Bootcamp",
  "date": "18 Dec 2025\u201314 Jan 2026",
  "startDate": "2025-12-18",
  "endDate": "2026-01-14",
  "duration": "23+ hours",
  "curriculum": "https://artifacts.rishia.in/bootcamp/cs404_curriculum-3.pdf"
} as const;

export interface Lecture { day: number; title: string; description: string; videoUrl: string; slidesUrl?: string; resources: {label: string; url: string}[]; artwork: string; avif: string; }

export const lectures: Lecture[] = [
  {
    "day": 1,
    "description": "Set up Flutter and build a digital identity card from widgets and layouts.",
    "resources": [],
    "slidesUrl": "https://drive.google.com/file/d/1pIPz-IBOvaMyTinVSZ9yDocrSVpmqN2Z/view?usp=sharing",
    "title": "Introduction to Flutter and Digital Identity Card",
    "videoUrl": "https://youtu.be/qRv2fTi3euE",
    "artwork": "/images/teaching/lecture-01.webp",
    "avif": "/images/teaching/lecture-01.avif"
  },
  {
    "day": 2,
    "description": "Explore stateful and stateless widgets, application logic, and a dice roller.",
    "resources": [],
    "slidesUrl": "https://drive.google.com/file/d/1DKIXOy9QdkPTstX27VK7FItDXjNX5t0v/view?usp=drive_link",
    "title": "State and The Dice Roller",
    "videoUrl": "https://youtu.be/_-zSQ3DB148",
    "artwork": "/images/teaching/lecture-02.webp",
    "avif": "/images/teaching/lecture-02.avif"
  },
  {
    "day": 3,
    "description": "Build a movie browser with lists, navigation, and routes.",
    "resources": [],
    "slidesUrl": "https://drive.google.com/file/d/1zyZkT6vPTUvBOzcPAWhwtfAt2bSxRiyD/view?usp=sharing",
    "title": "Navigation, Lists and Movie Browser",
    "videoUrl": "https://www.youtube.com/watch?v=Y_gCBFhnd_o",
    "artwork": "/images/teaching/lecture-03.webp",
    "avif": "/images/teaching/lecture-03.avif"
  },
  {
    "day": 4,
    "description": "Explore mobile UI and UX through animated containers and animation controllers.",
    "resources": [],
    "slidesUrl": "https://drive.google.com/file/d/11CUW5u8CL4mM-aQvDPTIECUj_vR20DHH/view?usp=sharing",
    "title": "Animations and UI/UX Primitives",
    "videoUrl": "https://youtu.be/1OsQoS420tQ",
    "artwork": "/images/teaching/lecture-04.webp",
    "avif": "/images/teaching/lecture-04.avif"
  },
  {
    "day": 5,
    "description": "Connect an app to servers using HTTP, APIs, and asynchronous programming.",
    "resources": [],
    "slidesUrl": "https://drive.google.com/file/d/15Wzv3L0vt5x6lcej71dTm8ZGGctR6xot/view?usp=sharing",
    "title": "Web, Servers, and HTTP",
    "videoUrl": "https://youtu.be/lJsC6CJX9TU",
    "artwork": "/images/teaching/lecture-05.webp",
    "avif": "/images/teaching/lecture-05.avif"
  },
  {
    "day": 6,
    "description": "Build forms, validate input, and persist data with Shared Preferences.",
    "resources": [],
    "slidesUrl": "https://drive.google.com/file/d/18P-FJuxlYpHiQ_TX2it3fPvHuP_TNom6/view?usp=sharing",
    "title": "Input, Validation, and Data Persistence",
    "videoUrl": "https://youtu.be/qVlgsfscR1U",
    "artwork": "/images/teaching/lecture-06.webp",
    "avif": "/images/teaching/lecture-06.avif"
  },
  {
    "day": 7,
    "description": "Work with global themes and store application data in Firebase Firestore.",
    "resources": [],
    "slidesUrl": "https://drive.google.com/file/d/11dza7Pdu2adOp2-RwBcjTlFNlkmz6_o4/view?usp=sharing",
    "title": "Global Themes and Firebase Firestore",
    "videoUrl": "https://youtu.be/d475MSQ-jTg",
    "artwork": "/images/teaching/lecture-07.webp",
    "avif": "/images/teaching/lecture-07.avif"
  },
  {
    "day": 8,
    "description": "Connect live streams with WebSockets and build authentication with JWT.",
    "resources": [],
    "slidesUrl": "https://drive.google.com/file/d/1fLkWjrhDkLfdpbNSZNo34d5e1yyMkHL3/view?usp=sharing",
    "title": "Sockets, Streams and Auth",
    "videoUrl": "https://youtu.be/QIceSZ55RQI",
    "artwork": "/images/teaching/lecture-08.webp",
    "avif": "/images/teaching/lecture-08.avif"
  },
  {
    "day": 9,
    "description": "Build an anonymous confession application for the NIT Jalandhar community.",
    "resources": [],
    "title": "Building an Anonymous Confession App",
    "videoUrl": "https://youtu.be/8Cu0mlI2M0g",
    "artwork": "/images/teaching/lecture-09.webp",
    "avif": "/images/teaching/lecture-09.avif"
  },
  {
    "day": 10,
    "description": "Explore AdMob, advertising exchanges, real-time bidding, Git, and GitHub.",
    "resources": [],
    "slidesUrl": "https://drive.google.com/file/d/1BogC17f1flLUTwjRi0e91acygNplr7Aw/view?usp=sharing",
    "title": "AdMob, Exchanges, RTB and VCS",
    "videoUrl": "https://youtu.be/VsN9gtIBikI",
    "artwork": "/images/teaching/lecture-10.webp",
    "avif": "/images/teaching/lecture-10.avif"
  },
  {
    "day": 11,
    "description": "Handle deep links, communicate with native code, and share across platforms.",
    "resources": [],
    "slidesUrl": "https://drive.google.com/file/d/1dTJQ9VL4Y2S7Y56dY1h5dc30N-ah8u1t/view?usp=sharing",
    "title": "Deep Links, Platform Channels and Sharing",
    "videoUrl": "https://youtu.be/1DwTj5orsKU",
    "artwork": "/images/teaching/lecture-11.webp",
    "avif": "/images/teaching/lecture-11.avif"
  },
  {
    "day": 12,
    "description": "Connect an app to generative AI through inference, Groq, Ollama, and POST requests.",
    "resources": [],
    "slidesUrl": "https://drive.google.com/file/d/1laXMmVDHORb3dbLwfi7siZnS2Iq75EHg/view?usp=sharing",
    "title": "LLMs, Inference, Groq, Ollama and POST Requests",
    "videoUrl": "https://youtu.be/pDzmW0ySjEU",
    "artwork": "/images/teaching/lecture-12.webp",
    "avif": "/images/teaching/lecture-12.avif"
  },
  {
    "day": 13,
    "description": "Stream results with async generators and run concurrent work in Dart isolates.",
    "resources": [],
    "slidesUrl": "https://drive.google.com/file/d/1M5JStQ-r_oAxOAKUd6ATK6h9HExI45fK/view?usp=sharing",
    "title": "Async Generators and Isolates",
    "videoUrl": "https://youtu.be/NH-w-Uj2B04",
    "artwork": "/images/teaching/lecture-13.webp",
    "avif": "/images/teaching/lecture-13.avif"
  },
  {
    "day": 14,
    "description": "Build release packages and sign Flutter apps for distribution.",
    "resources": [],
    "slidesUrl": "https://drive.google.com/file/d/1Cz8seniAcc2uDHRLfXiFDKr8j6qrN7le/view?usp=sharing",
    "title": "Building and Signing",
    "videoUrl": "https://youtu.be/hf3KjhdBKgY?si=AAsQVO_zDgQZOdTl",
    "artwork": "/images/teaching/lecture-14.webp",
    "avif": "/images/teaching/lecture-14.avif"
  }
];
