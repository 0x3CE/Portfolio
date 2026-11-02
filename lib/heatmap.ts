import type { ActivityDay } from '@/content/types';

export type HeatmapPalette = 'code' | 'run';

export type HeatmapCell = {
  date: string;
  value: number;
  /** 0 = aucun jour d'activité, 1→4 = quartiles des jours non nuls. */
  level: 0 | 1 | 2 | 3 | 4;
  /** Jour de la période absent de la source (ex. export Strava plus ancien) : jamais rendu comme un 0. */
  noData?: true;
};

/** Période commune à plusieurs grilles, bornes incluses, `YYYY-MM-DD`. */
export type HeatmapSpan = { from: string; to: string };

/** Une colonne = une semaine, du dimanche au samedi. `null` = jour hors période. */
export type HeatmapWeek = (HeatmapCell | null)[];

export const CELL = 11;
export const GAP = 3;
export const RADIUS = 2;
export const STEP = CELL + GAP;
export const MOBILE_WEEKS = 26;

/** Papier → moutarde → teck (code) et papier → olive → sarcelle (course). */
export const palettes: Record<HeatmapPalette, [string, string, string, string, string]> = {
  code: ['#E4D8C0', '#EFCF86', '#D9A320', '#B4761F', '#8C4A26'],
  run: ['#E4D8C0', '#C3CB94', '#9AA85C', '#6E7B3B', '#2E6A68'],
};

function quantile(sorted: number[], fraction: number): number {
  if (sorted.length === 0) return 0;
  const index = Math.min(sorted.length - 1, Math.floor(fraction * sorted.length));
  return sorted[index] ?? 0;
}

/** Seuils par quantiles sur les jours non nuls — pas de paliers fixes. */
export function levelsFor(days: ActivityDay[]): (value: number) => HeatmapCell['level'] {
  const active = days
    .map((day) => day.value)
    .filter((value) => value > 0)
    .sort((a, b) => a - b);

  if (active.length === 0) return () => 0;

  const t1 = quantile(active, 0.25);
  const t2 = quantile(active, 0.5);
  const t3 = quantile(active, 0.75);

  return (value) => {
    if (value <= 0) return 0;
    if (value <= t1) return 1;
    if (value <= t2) return 2;
    if (value <= t3) return 3;
    return 4;
  };
}

function dayOfWeek(iso: string): number {
  return new Date(`${iso}T00:00:00Z`).getUTCDay();
}

function nextDay(iso: string): string {
  return new Date(new Date(`${iso}T00:00:00Z`).getTime() + 86_400_000).toISOString().slice(0, 10);
}

/** Du premier au dernier jour de la série. */
export function spanOf(days: ActivityDay[]): HeatmapSpan | null {
  if (days.length === 0) return null;
  const dates = days.map((day) => day.date).sort();
  const from = dates[0];
  const to = dates[dates.length - 1];
  return from && to ? { from, to } : null;
}

/** Ne garde que les jours compris dans la période. */
export function clip(days: ActivityDay[], span: HeatmapSpan): ActivityDay[] {
  return days.filter((day) => day.date >= span.from && day.date <= span.to);
}

/**
 * Découpe une période en colonnes de 7, alignées sur le dimanche.
 * Les semaines les plus anciennes sont en tête. Sans `span`, la période est celle de la série ;
 * avec, deux grilles partagent exactement les mêmes colonnes.
 */
export function toWeeks(days: ActivityDay[], span: HeatmapSpan | null = spanOf(days)): HeatmapWeek[] {
  if (!span) return [];

  const inSpan = clip(days, span);
  const level = levelsFor(inSpan);
  const byDate = new Map(inSpan.map((day) => [day.date, day.value]));
  const weeks: HeatmapWeek[] = [];

  let current: HeatmapWeek = Array.from({ length: dayOfWeek(span.from) }, () => null);

  for (let date = span.from; date <= span.to; date = nextDay(date)) {
    const value = byDate.get(date);
    current.push(
      value === undefined
        ? { date, value: 0, level: 0, noData: true }
        : { date, value, level: level(value) },
    );
    if (current.length === 7) {
      weeks.push(current);
      current = [];
    }
  }

  if (current.length > 0) {
    while (current.length < 7) current.push(null);
    weeks.push(current);
  }

  return weeks;
}

/**
 * Index de colonne → mois, une étiquette par mois.
 * Un mois trop étroit pour son étiquette (moins de 3 colonnes visibles) est omis
 * plutôt que de chevaucher le suivant — typiquement le mois partiel de début.
 */
export function monthTicks(weeks: HeatmapWeek[]): { week: number; month: number }[] {
  const starts: { week: number; month: number }[] = [];
  let previousMonth = -1;

  weeks.forEach((week, index) => {
    const firstDay = week.find((cell): cell is HeatmapCell => cell !== null);
    if (!firstDay) return;
    const month = Number(firstDay.date.slice(5, 7)) - 1;
    if (month === previousMonth) return;
    previousMonth = month;
    starts.push({ week: index, month });
  });

  const MIN_COLUMNS = 3;
  return starts.filter((tick, index) => {
    const end = starts[index + 1]?.week ?? weeks.length;
    return end - tick.week >= MIN_COLUMNS;
  });
}

export function total(days: ActivityDay[]): number {
  return days.reduce((sum, day) => sum + day.value, 0);
}

/** Série factice déterministe pour /styleguide — jamais utilisée en production. */
export function sampleDays(seed: number, endDate: Date, count = 365): ActivityDay[] {
  const days: ActivityDay[] = [];
  let state = seed;
  for (let i = count - 1; i >= 0; i -= 1) {
    const date = new Date(endDate.getTime() - i * 86_400_000);
    state = (state * 1_103_515_245 + 12_345) % 2_147_483_648;
    const roll = state / 2_147_483_648;
    const value = roll < 0.35 ? 0 : Math.ceil(roll * 14);
    days.push({ date: date.toISOString().slice(0, 10), value });
  }
  return days;
}
