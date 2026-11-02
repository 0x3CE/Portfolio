export const locales = ['en', 'fr'] as const;
export type Locale = (typeof locales)[number];

/** Champ que seul Aj peut remplir. `TODO` n'est jamais rendu en production. */
export const TODO = 'TODO' as const;
export type Todo = typeof TODO;

export type Localized<T = string> = Record<Locale, T>;

export type ProjectStatus = 'building' | 'planned' | 'shipped';
export type RaceStatus = 'finished' | 'upcoming' | 'dnf';

/**
 * Visuel de carte et de page projet. Fichiers dans /public/media.
 * Une vidéo est toujours muette, en boucle, avec un poster.
 */
export type Media =
  | { type: 'image'; src: string; alt: Localized<string> }
  | { type: 'video'; src: string; poster: string; alt: Localized<string> };

export type Project = {
  slug: string;
  title: string;
  status: ProjectStatus;
  oneLiner: Localized<string | Todo>;
  /** Paragraphes de la page détail. Vide = pas encore écrit. */
  body?: Localized<string[]>;
  /** Absent ou `null` : la carte retombe sur une forme pilule / boomerang. */
  media?: Media | null;
  stack: string[];
  /** Jamais de chiffre inventé : reste `null` tant qu'Aj ne l'a pas fourni. */
  metrics: { label: Localized<string>; value: string }[] | null;
  /** `owner/name` : déclenche la mini-heatmap 12 semaines sur la carte. */
  repo: string | null;
  demo: string | null;
};

export type Race = {
  name: string;
  distanceKm: number | null;
  elevationM: number | null;
  /** `YYYY-MM-DD`, `YYYY-MM`, ou `TODO`. */
  date: string | Todo;
  time: string | null;
  rank: string | null;
  status: RaceStatus;
  note?: Localized<string>;
};

export type ActivityDay = { date: string; value: number };

export type TrainingData = {
  days: ActivityDay[];
  /** `'strava'` déclenche l'attribution exigée par leur API. */
  source?: string;
  total?: number;
  fetchedAt?: string | null;
};

export type ContributionData = {
  username: string | null;
  total: number;
  days: ActivityDay[];
  /** ISO. `null` si le fichier n'a jamais été généré. */
  fetchedAt: string | null;
  /** `true` quand le fetch a échoué et qu'on sert le dernier JSON commité. */
  stale?: boolean;
};

/** `TODO` et chaînes vides deviennent `null` : rien à rendre. */
export function filled(value: string | Todo | null | undefined): string | null {
  if (value == null) return null;
  const trimmed = value.trim();
  if (trimmed === '' || trimmed === TODO) return null;
  if (trimmed.startsWith(`${TODO} `) || trimmed.startsWith(`${TODO}:`)) return null;
  return trimmed;
}

export function localized(
  value: Localized<string | Todo> | undefined,
  locale: Locale,
): string | null {
  if (!value) return null;
  return filled(value[locale]);
}
