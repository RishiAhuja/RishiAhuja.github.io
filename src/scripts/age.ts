import { ageOn } from '../lib/age';

// The build renders the age at deploy time; this keeps it right between deploys.
const refreshAges = () => {
  document.querySelectorAll<HTMLElement>('[data-age-from]').forEach((element) => {
    element.textContent = String(ageOn(element.dataset.ageFrom!, new Date()));
  });
};

refreshAges();
document.addEventListener('astro:page-load', refreshAges);
