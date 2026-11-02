import type { Locale } from './types';

export const defaultLocale: Locale = 'en';

const dict = {
  en: {
    skipToContent: 'Skip to content',
    nav: { projects: 'Projects', activity: 'Activity', season: 'Season', contact: 'Contact' },
    hero: { cta: 'See projects', scroll: 'Scroll' },
    sections: {
      projects: 'Projects',
      projectsLead: 'Built in public. Status is stated, never implied.',
      activity: 'Activity',
      activityLead: 'One year of commits and kilometers, on the same grid.',
      // Sans data/training.json, la seconde grille n'existe pas : on ne la promet pas.
      activityLeadCodeOnly: 'One year of commits, day by day.',
      season: 'Season',
      seasonLead: 'Races run, training blocks, and what comes next.',
      stack: 'Stack',
      pursuits: 'Pursuits',
      contact: 'Contact',
    },
    status: { building: 'building', planned: 'planned', shipped: 'shipped' },
    raceStatus: { finished: 'finished', upcoming: 'upcoming', dnf: 'DNF' },
    project: {
      readMore: 'Open project',
      repo: 'Repository',
      demo: 'Live demo',
      back: 'All projects',
      recentActivity: 'Last 12 weeks',
      noDescription: 'Write-up coming.',
    },
    heatmap: {
      commits: 'commits',
      km: 'km',
      codeLabel: 'Commits',
      runLabel: 'Kilometers',
      less: 'less',
      more: 'more',
      totalCommits: (n: number) => `${n.toLocaleString('en')} contributions in the last 365 days`,
      totalKm: (n: number) => `${n.toLocaleString('en')} km in the last 365 days`,
      none: 'No data yet.',
      label: 'Activity by day',
      cell: (value: number, unit: string, date: string) =>
        value === 0 ? `No ${unit} on ${date}` : `${value} ${unit} on ${date}`,
      mobileHint: 'Scroll sideways for the full year.',
      stale: 'Showing the last successful sync.',
      dataThrough: (date: string) => `Data through ${date}`,
      // Formulation imposée par l'accord d'API Strava dès qu'on affiche leurs données.
      poweredByStrava: 'Powered by Strava',
    },
    calendar: { months: 'Season 2026–2027', noRaces: 'No races recorded yet.' },
    contact: { lead: 'Open to Data Engineer roles in Switzerland.', email: 'Email', github: 'GitHub', linkedin: 'LinkedIn' },
    footer: { lastUpdated: 'last updated', since: 'since 2026', builtWith: 'built with SQL and long runs' },
    locale: { switchTo: 'Français', current: 'English' },
  },
  fr: {
    skipToContent: 'Aller au contenu',
    nav: { projects: 'Projets', activity: 'Activité', season: 'Saison', contact: 'Contact' },
    hero: { cta: 'Voir les projets', scroll: 'Défiler' },
    sections: {
      projects: 'Projets',
      projectsLead: 'Construits en public. Le statut est annoncé, jamais sous-entendu.',
      activity: 'Activité',
      activityLead: 'Une année de commits et de kilomètres, sur la même grille.',
      activityLeadCodeOnly: 'Une année de commits, jour après jour.',
      season: 'Saison',
      seasonLead: "Courses passées, blocs d'entraînement, et la suite.",
      stack: 'Stack',
      pursuits: 'Envies',
      contact: 'Contact',
    },
    status: { building: 'en cours', planned: 'prévu', shipped: 'livré' },
    raceStatus: { finished: 'terminée', upcoming: 'à venir', dnf: 'abandon' },
    project: {
      readMore: 'Ouvrir le projet',
      repo: 'Dépôt',
      demo: 'Démo',
      back: 'Tous les projets',
      recentActivity: '12 dernières semaines',
      noDescription: 'Présentation à venir.',
    },
    heatmap: {
      commits: 'commits',
      km: 'km',
      codeLabel: 'Commits',
      runLabel: 'Kilomètres',
      less: 'moins',
      more: 'plus',
      totalCommits: (n: number) => `${n.toLocaleString('fr')} contributions sur un an`,
      totalKm: (n: number) => `${n.toLocaleString('fr')} km sur un an`,
      none: 'Pas encore de données.',
      label: 'Activité par jour',
      cell: (value: number, unit: string, date: string) =>
        value === 0 ? `Aucun ${unit} le ${date}` : `${value} ${unit} le ${date}`,
      mobileHint: 'Faites défiler pour voir toute l’année.',
      stale: 'Dernière synchronisation réussie.',
      dataThrough: (date: string) => `Données jusqu’au ${date}`,
      poweredByStrava: 'Powered by Strava',
    },
    calendar: { months: 'Saison 2026–2027', noRaces: 'Aucune course enregistrée.' },
    contact: { lead: 'Ouvert aux postes de Data Engineer en Suisse.', email: 'E-mail', github: 'GitHub', linkedin: 'LinkedIn' },
    footer: { lastUpdated: 'mis à jour le', since: 'depuis 2026', builtWith: 'construit avec du SQL et des sorties longues' },
    locale: { switchTo: 'English', current: 'Français' },
  },
} as const;

export type Dict = (typeof dict)['en'];

export function t(locale: Locale): Dict {
  return dict[locale] as Dict;
}

const monthNames = {
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  fr: ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'],
} as const;

export function monthLabel(locale: Locale, monthIndex: number): string {
  return monthNames[locale][monthIndex] ?? '';
}

/** Date lisible sans dépendre du fuseau du navigateur. */
export function formatDate(locale: Locale, iso: string): string {
  const [y, m, d] = iso.split('-');
  if (!y) return iso;
  const month = m ? monthLabel(locale, Number(m) - 1) : null;
  if (!month) return y;
  if (!d) return locale === 'fr' ? `${month} ${y}` : `${month} ${y}`;
  return locale === 'fr' ? `${Number(d)} ${month} ${y}` : `${month} ${Number(d)}, ${y}`;
}
