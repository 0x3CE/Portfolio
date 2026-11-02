import { ProjectCard } from '@/components/ProjectCard';
import type { Locale, Project } from '@/content/types';

type Props = {
  projects: Project[];
  locale: Locale;
  repoWeeks: Record<string, number[]>;
};

/**
 * Desktop : bande défilante en CSS, en pause au survol et au focus.
 * Mobile : carrousel à swipe avec accroche, pas d'animation.
 */
export function ProjectMarquee({ projects, locale, repoWeeks }: Props) {
  const cards = projects.map((project, index) => (
    <ProjectCard
      key={project.slug}
      project={project}
      locale={locale}
      index={index}
      weeks={project.repo ? repoWeeks[project.repo] : undefined}
    />
  ));

  return (
    <>
      {/* Mobile */}
      <ul className="flex snap-x snap-mandatory list-none gap-5 overflow-x-auto p-0 pb-4 md:hidden">
        {projects.map((project, index) => (
          <li key={project.slug} className="snap-start">
            <ProjectCard
              project={project}
              locale={locale}
              index={index}
              weeks={project.repo ? repoWeeks[project.repo] : undefined}
            />
          </li>
        ))}
      </ul>

      {/* Desktop */}
      <div
        className="marquee hidden overflow-hidden md:block"
        style={{ ['--marquee-duration' as string]: `${Math.max(30, projects.length * 14)}s` }}
      >
        {/* Deux groupes identiques : translateX(-50%) boucle alors sans saut. */}
        <div className="marquee-track animate-marquee-left motion-reduce:animate-none">
          <div className="flex gap-5 pr-5">{cards}</div>
          <div className="flex gap-5 pr-5" aria-hidden="true">
            {cards}
          </div>
        </div>
      </div>
    </>
  );
}
