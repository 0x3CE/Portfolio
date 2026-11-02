import Link from 'next/link';
import { ProjectMedia } from '@/components/ProjectMedia';
import { ProjectStatusBadge } from '@/components/StatusBadge';
import { t } from '@/content/i18n';
import { localized, type Locale, type Project } from '@/content/types';

/** 12 dernières semaines de commits du repo, une barre par semaine. */
function MiniHeatmap({ weeks, label }: { weeks: number[]; label: string }) {
  const recent = weeks.slice(-12);
  const peak = Math.max(...recent, 1);

  return (
    <div className="mt-4">
      <p className="font-pixel text-micro uppercase text-ink/60">{label}</p>
      <div className="mt-1.5 flex items-end gap-1" aria-hidden="true">
        {recent.map((count, index) => (
          <span
            key={index}
            className="w-2 rounded-[2px] bg-teak"
            style={{ height: `${Math.max(3, (count / peak) * 28)}px`, opacity: count === 0 ? 0.2 : 1 }}
          />
        ))}
      </div>
    </div>
  );
}

type Props = {
  project: Project;
  locale: Locale;
  index: number;
  weeks?: number[];
};

export function ProjectCard({ project, locale, index, weeks }: Props) {
  const copy = t(locale).project;
  const oneLiner = localized(project.oneLiner, locale);

  return (
    <article className="flex h-full w-[19rem] shrink-0 flex-col border-2 border-ink bg-paper p-5 sm:w-[21rem]">
      <ProjectMedia media={project.media} locale={locale} index={index} size="card" />

      <div className="mt-4 flex items-start justify-between gap-3">
        <h3 className="font-garamond text-2xl font-bold leading-tight">{project.title}</h3>
        <ProjectStatusBadge status={project.status} locale={locale} />
      </div>

      {/* `oneLiner` non renseigné : on ne rend rien plutôt qu'un texte de remplissage. */}
      {oneLiner ? <p className="mt-3 text-ink/85">{oneLiner}</p> : null}

      {project.stack.length > 0 ? (
        <ul className="mt-3 flex list-none flex-wrap gap-x-3 gap-y-1 p-0 text-sm text-ink/70">
          {project.stack.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : null}

      {weeks && weeks.length > 0 ? (
        <MiniHeatmap weeks={weeks} label={copy.recentActivity} />
      ) : null}

      <Link
        href={`/${locale}/projects/${project.slug}/`}
        className="mt-auto pt-5 font-medium text-teal underline underline-offset-4"
      >
        {copy.readMore}
      </Link>
    </article>
  );
}
