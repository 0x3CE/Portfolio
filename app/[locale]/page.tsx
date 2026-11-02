import type { Metadata } from 'next';
import { ActivityHeatmap } from '@/components/ActivityHeatmap';
import { Contact } from '@/components/Contact';
import { LocaleSwitch } from '@/components/LocaleSwitch';
import { ProjectMarquee } from '@/components/ProjectMarquee';
import { PursuitTicker } from '@/components/PursuitTicker';
import { RaceList } from '@/components/RaceList';
import { SeasonCalendar } from '@/components/SeasonCalendar';
import { Section } from '@/components/Section';
import { Starburst } from '@/components/Starburst';
import { WebDetails } from '@/components/WebDetails';
import { t } from '@/content/i18n';
import { profile } from '@/content/profile';
import { projects } from '@/content/projects';
import { pursuits } from '@/content/pursuits';
import { races } from '@/content/races';
import type { Locale } from '@/content/types';
import { contributions, lastUpdated, repoActivity, training } from '@/lib/data';
import { spanOf } from '@/lib/heatmap';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const key = locale as Locale;
  return {
    title: `${profile.name} — ${profile.role[key]}`,
    description: profile.headline[key],
    alternates: { languages: { en: '/en/', fr: '/fr/' } },
  };
}

export default async function LocaleHome({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const key = locale as Locale;
  const copy = t(key);

  const commits = contributions();
  const km = training();
  // Les deux grilles partagent les semaines des commits : même année, colonne pour colonne.
  const span = spanOf(commits.days) ?? (km ? spanOf(km.days) : null);
  const [pursuitsTop, pursuitsBottom] = pursuits[key];
  const stamp = lastUpdated();

  return (
    <>
      <header className="shell flex items-center justify-between py-6">
        <span className="font-display text-xl font-bold">{profile.name}</span>
        <nav className="flex items-center gap-5">
          <ul className="hidden list-none gap-5 p-0 sm:flex">
            {(['projects', 'activity', 'season', 'contact'] as const).map((item) => (
              <li key={item}>
                <a href={`#${item}`} className="text-teal underline underline-offset-4">
                  {copy.nav[item]}
                </a>
              </li>
            ))}
          </ul>
          <LocaleSwitch locale={key} />
        </nav>
      </header>

      <main id="content">
        {/* 1. Hero */}
        <section className="shell relative animate-hero-rise py-16 sm:py-24">
          <Starburst
            size={200}
            className="pointer-events-none absolute right-0 top-0 hidden opacity-90 lg:block"
          />
          <p className="font-pixel text-micro-lg uppercase text-ink/70">{profile.location}</p>
          <h1 className="mt-4 max-w-5xl text-hero font-extrabold">{profile.headline[key]}</h1>
          <a href="#projects" className="btn-bevel mt-10 bg-mustard">
            {copy.hero.cta}
          </a>
        </section>

        {/* 2. Projets */}
        <Section id="projects" title={copy.sections.projects} lead={copy.sections.projectsLead}>
          <div className="pl-5 sm:pl-8 md:pl-0 lg:pl-0">
            <ProjectMarquee projects={projects} locale={key} repoWeeks={repoActivity()} />
          </div>
        </Section>

        {/* 3. Activité */}
        <Section
          id="activity"
          title={copy.sections.activity}
          lead={km ? copy.sections.activityLead : copy.sections.activityLeadCodeOnly}
          rule="dots"
        >
          <div className="shell space-y-12">
            <ActivityHeatmap
              days={commits.days}
              unit="commits"
              palette="code"
              locale={key}
              label={copy.heatmap.codeLabel}
              stale={commits.stale}
              span={span}
            />
            {/* La grille des kilomètres n'existe que si data/training.json est présent. */}
            {km ? (
              <div>
                <ActivityHeatmap
                  days={km.days}
                  unit="km"
                  palette="run"
                  locale={key}
                  label={copy.heatmap.runLabel}
                  span={span}
                />
                {/* Attribution exigée par l'accord d'API Strava. */}
                {km.source?.startsWith('strava') ? (
                  <a
                    href="https://www.strava.com"
                    className="mt-3 inline-block font-pixel text-micro uppercase text-ink/60 underline underline-offset-4"
                  >
                    {copy.heatmap.poweredByStrava}
                  </a>
                ) : null}
              </div>
            ) : null}
          </div>
        </Section>

        {/* 4. Saison */}
        <Section id="season" title={copy.sections.season} lead={copy.sections.seasonLead}>
          <div className="shell space-y-12">
            <SeasonCalendar races={races} locale={key} now={new Date(`${stamp}T00:00:00Z`)} />
            <RaceList races={races} locale={key} />
          </div>
        </Section>

        {/* 5. Stack */}
        <Section id="stack" title={copy.sections.stack} rule="dots">
          <div className="shell">
            <ul className="flex list-none flex-wrap gap-x-8 gap-y-3 p-0 font-garamond text-2xl font-semibold sm:text-3xl">
              {profile.stack.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </Section>

        {/* 6. Pursuits */}
        <Section id="pursuits" title={copy.sections.pursuits}>
          <div className="space-y-2">
            <PursuitTicker words={pursuitsTop} direction="left" color="#8C4A26" />
            <PursuitTicker words={pursuitsBottom} direction="right" color="#6E7B3B" />
          </div>
        </Section>

        {/* 7. Contact */}
        <Section id="contact" title={copy.sections.contact} rule="dots">
          <div className="shell">
            <Contact locale={key} />
          </div>
        </Section>
      </main>

      <footer className="shell border-t-2 border-ink py-10">
        <WebDetails locale={key} lastUpdated={stamp} />
      </footer>
    </>
  );
}
