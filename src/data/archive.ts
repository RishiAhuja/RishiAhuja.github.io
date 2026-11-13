export const resumeVersions = [
  {
    "version": 21,
    "url": "https://artifacts.rishia.in/resume/rishi-resume-v21.pdf"
  },
  {
    "version": 20,
    "url": "https://artifacts.rishia.in/resume/rishi-resume-v20.pdf"
  },
  {
    "version": 19,
    "url": "https://artifacts.rishia.in/resume/rishi-resume-v19.pdf"
  },
  {
    "version": 18,
    "url": "https://artifacts.rishia.in/resume/rishi-resume-v18.pdf"
  },
  {
    "version": 17,
    "url": "https://artifacts.rishia.in/resume/rishi-resume-v17.pdf"
  },
  {
    "version": 16,
    "url": "https://artifacts.rishia.in/resume/rishi-resume-v16.pdf"
  },
  {
    "version": 15,
    "url": "https://artifacts.rishia.in/resume/rishi-resume-v15.pdf"
  },
  {
    "version": 14,
    "url": "https://artifacts.rishia.in/resume/rishi-resume-v14.pdf"
  },
  {
    "version": 13,
    "url": "https://artifacts.rishia.in/resume/rishi-resume-v13.pdf"
  },
  {
    "version": 12,
    "url": "https://artifacts.rishia.in/resume/rishi-resume-v12.pdf"
  },
  {
    "version": 10,
    "url": "https://artifacts.rishia.in/resume/rishi-resume-v10.pdf"
  },
  {
    "version": 9,
    "url": "https://artifacts.rishia.in/resume/rishi-resume-v9.pdf"
  },
  {
    "version": 8,
    "url": "https://artifacts.rishia.in/resume/rishi-resume-v8.pdf"
  },
  {
    "version": 2,
    "url": "https://artifacts.rishia.in/resume/rishi-resume-v2.pdf"
  },
  {
    "version": 1,
    "url": "https://artifacts.rishia.in/resume/rishi-resume-v1.pdf"
  }
] as const;

// Every version of this site, oldest first. Screenshots are 1440×900 captures
// of each live version, stored in public/images/archive.
export const portfolioVersions = [
  {
    id: 'v1-2021', name: 'First portfolio', period: 'Feb 2021',
    url: 'https://new-port-14-02-2021.pages.dev/',
    built: 'HTML and Bootstrap',
    note: '“Namaste.” A full-stack Flutter developer’s first page, written by hand.',
  },
  {
    id: 'v2-2022', name: 'GitHub Pages portfolio', period: 'Apr 2022 – Aug 2024',
    url: 'https://rishiahuja.github.io/my-portfolio/',
    built: 'HTML, Bootstrap, AOS, and Swiper',
    note: 'A sidebar, a typing effect, and scroll animations everywhere.',
  },
  {
    id: 'v3-2025-terminal', name: 'Terminal portfolio', period: 'Feb 2025',
    url: 'https://my-portfolio-462ef.web.app/',
    built: 'Flutter web, on Firebase',
    note: 'A portfolio you could type commands into.',
  },
  {
    id: 'v4-2025-builder', name: 'Builder and engineer portfolio', period: 'May 2025 – Oct 2026',
    url: 'https://archive.rishia.in',
    built: 'Astro, React, and Tailwind',
    note: 'Dark and monospaced: projects, a timeline, a gallery, and an admin panel.',
  },
  {
    id: 'v5-2026-research', name: 'This site', period: 'Oct 2026 – now',
    url: '/',
    built: 'Astro, with no client framework',
    note: 'Research first, light, and quieter.',
  },
] as const;
