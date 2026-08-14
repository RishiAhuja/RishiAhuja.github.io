import React, { useEffect, useState } from 'react';
import { siGithub, siGooglescholar } from 'simple-icons';
import { LINKS } from '../lib/constants';

const NAV = [
  { id: 'home', label: 'Home', href: '/' },
  { id: 'research', label: 'Research', href: '/#research' },
  { id: 'writings', label: 'Writings', href: '/#writings' },
  { id: 'about', label: 'About', href: '/#about' },
  { id: 'resume', label: 'Resume', href: LINKS.RESUME, external: true },
] as const;

const LINKEDIN_PATH =
  'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C0 .774 23.2 0 22.222 0h.003z';

const BrandIcon = ({ path }: { path: string }) => (
  <svg className="icon-brand" viewBox="0 0 24 24" aria-hidden="true">
    <path d={path} />
  </svg>
);

const Header: React.FC = () => {
  const [active, setActive] = useState('home');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const path = window.location.pathname;
    if (path.startsWith('/writings')) {
      setActive('writings');
      return;
    }
    if (path.startsWith('/pub/')) {
      setActive('research');
      return;
    }

    const nodes = NAV.filter((item) => !('external' in item && item.external))
      .map((item) => document.getElementById(item.id))
      .filter((node): node is HTMLElement => Boolean(node));

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target.id) {
          setActive(visible[0].target.id);
        }
      },
      { rootMargin: '-28% 0px -55% 0px', threshold: [0.15, 0.35, 0.6] }
    );

    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    document.body.classList.toggle('nav-open', open);
    return () => document.body.classList.remove('nav-open');
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <header className="site-header">
      <nav className="site-nav wrap" data-open={open}>
        <ul className="nav-links">
          {NAV.map((item) => (
            <li key={item.id}>
              <a
                href={item.href}
                data-active={active === item.id}
                {...('external' in item && item.external
                  ? { target: '_blank', rel: 'noopener noreferrer' }
                  : {})}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>

        <button
          className="nav-toggle"
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-label={open ? 'Close menu' : 'Open menu'}
        >
          <span className="nav-toggle-bars" aria-hidden="true" />
        </button>

        <ul className="nav-social">
          <li>
            <a href={LINKS.GOOGLE_SCHOLAR} target="_blank" rel="noopener noreferrer" aria-label="Google Scholar">
              <BrandIcon path={siGooglescholar.path} />
            </a>
          </li>
          <li>
            <a href={LINKS.GITHUB} target="_blank" rel="noopener noreferrer" aria-label="GitHub">
              <BrandIcon path={siGithub.path} />
            </a>
          </li>
          <li>
            <a href={LINKS.LINKEDIN} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
              <BrandIcon path={LINKEDIN_PATH} />
            </a>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
