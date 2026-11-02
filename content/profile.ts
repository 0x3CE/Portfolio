import type { Localized } from './types';

export const profile = {
  name: 'Aj',
  role: { en: 'Data Engineer', fr: 'Data Engineer' } satisfies Localized,
  location: 'France → Suisse',
  headline: {
    en: 'I build data systems and run very long distances.',
    fr: 'Je construis des systèmes de données et je cours très longtemps.',
  } satisfies Localized,
  stack: [
    'SQL',
    'MariaDB',
    'Python',
    'Power BI',
    'DAX',
    'React',
    'Pandas',
    'Git',
    'Sklearn',
    'TensorFlow',
  ],
  links: {
    github: 'https://github.com/0x3CE',
    linkedin: 'https://www.linkedin.com/in/antoine-junot/',
    email: 'antoine.junotpro@pm.me',
  },
  githubUsername: '0x3CE',
};
