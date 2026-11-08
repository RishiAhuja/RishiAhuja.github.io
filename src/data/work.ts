export const POGO = {
  path: '/work/pogo',
  name: 'Pogo',
  tagline: 'The scenic route to your cluster.',
  description: 'A personal infrastructure project for reaching campus compute from away: reverse SSH, Wi-Fi recovery, and a small, honest status page.',
  repository: 'https://github.com/RishiAhuja/pogo',
  design: 'https://github.com/RishiAhuja/pogo/blob/main/docs/design.md',
  setup: 'https://github.com/RishiAhuja/pogo/blob/main/docs/setup.md',
  artwork: '/images/work/pogo/bastion.webp',
  cover: 'blue',
} as const;

// Shareable detail pages; there is deliberately no public work directory.
export const workEntries = [POGO] as const;
