import { TODO, type Project } from './types';

/*
 * Ajouter un visuel à un projet : déposer le fichier dans /public/media,
 * puis ajouter l'une de ces deux clés à l'objet du projet.
 *
 *   media: {
 *     type: 'image',
 *     src: '/media/investment-thesis.png',
 *     alt: { en: 'Thesis builder screen', fr: "Écran du générateur de thèse" },
 *   },
 *
 *   media: {
 *     type: 'video',
 *     src: '/media/budget-plus.mp4',
 *     poster: '/media/budget-plus.jpg',   // requis
 *     alt: { en: 'Budget app walkthrough', fr: "Démo de l'app budget" },
 *   },
 *
 * Sans `media`, la carte retombe sur une forme pilule ou boomerang.
 */

export const projects = [
  {
    slug: 'investment-thesis',
    title: 'Investment Thesis Builder',
    status: 'building',
    oneLiner: { en: TODO, fr: TODO },
    stack: [],
    metrics: null,
    repo: null,
    demo: null,
  },
  {
    slug: 'budget-plus',
    title: 'Budget+ Finance',
    status: 'planned',
    oneLiner: { en: TODO, fr: TODO },
    stack: [],
    metrics: null,
    repo: null,
    demo: null,
  },
  {
    slug: 'data-analysis',
    title: 'Data Analysis',
    status: 'planned',
    oneLiner: { en: TODO, fr: TODO },
    stack: [],
    metrics: null,
    repo: null,
    demo: null,
  },
] satisfies Project[];

export function projectBySlug(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}
