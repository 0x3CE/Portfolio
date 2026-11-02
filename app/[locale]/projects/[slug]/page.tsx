import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { LocaleSwitch } from '@/components/LocaleSwitch';
import { ProjectMedia } from '@/components/ProjectMedia';
import { SectionRule } from '@/components/SectionRule';
import { ProjectStatusBadge } from '@/components/StatusBadge';
import { t } from '@/content/i18n';
import { profile } from '@/content/profile';
import { projects, projectBySlug } from '@/content/projects';
import { locales, localized, type Locale } from '@/content/types';

export function generateStaticParams() {
  return locales.flatMap((locale) => projects.map((project) => ({ locale, slug: project.slug })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const project = projectBySlug(slug);
  if (!project) return {};
  const oneLiner = localized(project.oneLiner, locale as Locale);
  return {
    title: `${project.title} — ${profile.name}`,
    ...(oneLiner ? { description: oneLiner } : {}),
  };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const key = locale as Locale;
  const project = projectBySlug(slug);
  if (!project) notFound();

  const copy = t(key);
  const oneLiner = localized(project.oneLiner, key);
  const body = project.body?.[key]?.filter((paragraph) => paragraph.trim() !== '') ?? [];

  return (
    <>
      <header className="shell flex items-center justify-between py-6">
        <Link href={`/${key}/`} className="font-display text-xl font-bold">
          {profile.name}
        </Link>
        <LocaleSwitch locale={key} path={`projects/${project.slug}/`} />
      </header>

      <main id="content" className="shell py-10 sm:py-16">
        <Link href={`/${key}/#projects`} className="text-teal underline underline-offset-4">
          {copy.project.back}
        </Link>

        <div className="mt-6 flex flex-wrap items-center gap-4">
          <h1 className="text-section font-bold">{project.title}</h1>
          <ProjectStatusBadge status={project.status} locale={key} />
        </div>
        <SectionRule className="mt-4 max-w-md" color="#8C4A26" />

        <div className="mt-8 max-w-3xl">
          <ProjectMedia
            media={project.media}
            locale={key}
            index={projects.findIndex((item) => item.slug === project.slug)}
            size="page"
          />
        </div>

        {oneLiner ? <p className="mt-6 max-w-2xl text-body-lg text-ink/85">{oneLiner}</p> : null}

        {body.length > 0 ? (
          <div className="mt-8 max-w-2xl space-y-5">
            {body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        ) : (
          /* Rien d'écrit pour l'instant : on le dit, on n'invente pas de contenu. */
          <p className="mt-8 max-w-2xl text-ink/70">{copy.project.noDescription}</p>
        )}

        {project.stack.length > 0 ? (
          <ul className="mt-8 flex list-none flex-wrap gap-x-6 gap-y-2 p-0 font-display text-xl font-semibold">
            {project.stack.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        ) : null}

        {/* `metrics: null` tant qu'Aj n'a pas fourni de chiffres : aucune valeur inventée. */}
        {project.metrics && project.metrics.length > 0 ? (
          <dl className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-3">
            {project.metrics.map((metric) => (
              <div key={metric.value} className="border-2 border-ink p-4">
                <dt className="font-pixel text-micro uppercase text-ink/60">{metric.label[key]}</dt>
                <dd className="mt-1 font-display text-3xl font-bold">{metric.value}</dd>
              </div>
            ))}
          </dl>
        ) : null}

        <div className="mt-10 flex flex-wrap gap-4">
          {project.repo ? (
            <a href={`https://github.com/${project.repo}`} className="btn-bevel bg-paper">
              {copy.project.repo}
            </a>
          ) : null}
          {project.demo ? (
            <a href={project.demo} className="btn-bevel bg-mustard">
              {copy.project.demo}
            </a>
          ) : null}
        </div>
      </main>
    </>
  );
}
