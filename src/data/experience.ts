import { LINKS } from '../lib/constants';

export interface ExperienceRole {
  title: string;
  date: string;
  meta?: string;
  upcoming?: boolean;
}
export interface ExperienceGroup {
  organisation: string;
  href: string;
  logo: string;
  context?: string;
  roles: ExperienceRole[];
}

export const experiences: ExperienceGroup[] = [
  { organisation: 'Cisco', href: 'https://www.cisco.com/', logo: '/images/logos/cisco.svg', roles: [
    { title: 'Summer Intern', date: 'Upcoming', upcoming: true },
  ] },
  { organisation: 'Machine and Hybrid Intelligence Lab', href: LINKS.MHI, logo: '/images/logos/mhi.webp', context: 'Northwestern University', roles: [
    { title: 'Visiting Scholar · Undergraduate Researcher', date: 'Oct 2026–Present' },
  ] },
  { organisation: 'Zenbase Singapore', href: 'https://www.silentninja.tech/', logo: '/images/logos/zenbase.webp', roles: [
    { title: 'DevOps Engineer', date: 'Dec 2025–May 2026', meta: 'Part-time · Remote' },
  ] },
  { organisation: 'Annam AI, IIT Ropar', href: 'https://www.annam.ai/', logo: '/images/logos/annam.webp', roles: [
    { title: 'Entrepreneur in Residence', date: 'Nov 2025–Mar 2026', meta: 'Part-time · Hybrid' },
    { title: 'Research Intern', date: 'May–Oct 2025', meta: 'Internship · Hybrid' },
  ] },
  { organisation: 'Stack Wealth', href: 'https://stackwealth.in/', logo: '/images/logos/stack.webp', roles: [
    { title: 'Flutter Intern', date: 'Apr–May 2025', meta: 'Internship · Remote' },
  ] },
  { organisation: 'Level SuperMind', href: 'https://level.game/', logo: '/images/logos/level.webp', roles: [
    { title: 'Frontend Intern', date: 'Jan–Feb 2025', meta: 'Internship · Remote' },
  ] },
  { organisation: 'GDGC, NIT Jalandhar', href: '/community#gdgc', logo: '/images/logos/gdgc.svg', roles: [
    { title: 'Mobile Development Lead', date: 'Oct 2026–Present' },
    { title: 'Core Member · Mobile Development', date: 'Nov 2024–Oct 2026' },
  ] },
];
