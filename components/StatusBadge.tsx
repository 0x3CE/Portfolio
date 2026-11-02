import { t } from '@/content/i18n';
import type { Locale, ProjectStatus, RaceStatus } from '@/content/types';

const projectStyles: Record<ProjectStatus, string> = {
  building: 'bg-mustard text-ink',
  planned: 'bg-paper text-ink',
  shipped: 'bg-teal text-paper',
};

const raceStyles: Record<RaceStatus, string> = {
  finished: 'bg-olive text-paper',
  upcoming: 'bg-tomato text-paper',
  dnf: 'bg-paper text-ink',
};

const base =
  'inline-block border-2 border-ink px-2 py-0.5 font-pixel text-micro uppercase leading-none';

export function ProjectStatusBadge({ status, locale }: { status: ProjectStatus; locale: Locale }) {
  return <span className={`${base} ${projectStyles[status]}`}>{t(locale).status[status]}</span>;
}

export function RaceStatusBadge({ status, locale }: { status: RaceStatus; locale: Locale }) {
  return <span className={`${base} ${raceStyles[status]}`}>{t(locale).raceStatus[status]}</span>;
}
