export const POGO = {
  path: '/work/pogo',
  name: 'Pogo',
  tagline: 'The scenic route to your cluster.',
  description: 'Pogo keeps a way back to campus compute open, so I can check experiments, collect results, and keep working from wherever I am.',
  metadata: 'Campus compute, from anywhere',
  repository: 'https://github.com/RishiAhuja/pogo',
  artwork: '/images/work/pogo/bastion.webp',
  cover: 'blue',
} as const;

// Shareable detail pages; there is deliberately no public work directory.
export const workEntries = [POGO] as const;
