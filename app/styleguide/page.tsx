import type { Metadata } from 'next';
import { ActivityHeatmap } from '@/components/ActivityHeatmap';
import { Badge88, badges } from '@/components/Badge88';
import { SectionRule } from '@/components/SectionRule';
import { Starburst } from '@/components/Starburst';
import { contrastRatio, wcagLevel } from '@/lib/contrast';
import { sampleDays } from '@/lib/heatmap';

export const metadata: Metadata = {
  title: 'Styleguide — Aj',
  robots: { index: false, follow: false },
};

const tokens = [
  { name: 'paper', hex: '#F1E8D6', role: 'fond principal' },
  { name: 'ink', hex: '#231C15', role: 'texte' },
  { name: 'teak', hex: '#8C4A26', role: 'titres de section, niveau max heatmap code' },
  { name: 'mustard', hex: '#D9A320', role: 'accent : CTA, statut building, mois actif' },
  { name: 'olive', hex: '#6E7B3B', role: 'sport, heatmap course' },
  { name: 'teal', hex: '#2E6A68', role: 'liens, niveau max heatmap course' },
  { name: 'tomato', hex: '#D8452B', role: 'starburst du hero, badge upcoming' },
];

const pairs: { fg: string; bg: string; label: string }[] = [
  { fg: '#231C15', bg: '#F1E8D6', label: 'ink sur paper' },
  { fg: '#8C4A26', bg: '#F1E8D6', label: 'teak sur paper' },
  { fg: '#2E6A68', bg: '#F1E8D6', label: 'teal sur paper' },
  { fg: '#6E7B3B', bg: '#F1E8D6', label: 'olive sur paper' },
  { fg: '#D8452B', bg: '#F1E8D6', label: 'tomato sur paper' },
  { fg: '#D9A320', bg: '#F1E8D6', label: 'mustard sur paper' },
  { fg: '#231C15', bg: '#D9A320', label: 'ink sur mustard' },
  { fg: '#F1E8D6', bg: '#2E6A68', label: 'paper sur teal' },
  { fg: '#F1E8D6', bg: '#8C4A26', label: 'paper sur teak' },
  { fg: '#F1E8D6', bg: '#6E7B3B', label: 'paper sur olive' },
];

/** Date fixe : les captures Playwright ne doivent pas bouger d'un jour à l'autre. */
const SAMPLE_END = new Date('2026-09-20T00:00:00Z');

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="py-12">
      <h2 className="mb-1 font-display text-3xl font-bold text-teak">{title}</h2>
      <SectionRule className="mb-8 max-w-xs" />
      {children}
    </section>
  );
}

export default function StyleguidePage() {
  const codeDays = sampleDays(7, SAMPLE_END);
  const runDays = sampleDays(42, SAMPLE_END).map((day) => ({
    ...day,
    value: day.value === 0 ? 0 : Math.round(day.value * 2.4),
  }));

  return (
    <main className="shell py-16">
      <p className="mb-2 inline-block border-2 border-tomato bg-tomato px-3 py-1 font-pixel text-micro-lg uppercase text-paper">
        données factices — page hors production
      </p>
      <h1 className="text-section font-bold">Styleguide</h1>
      <p className="mt-3 max-w-2xl text-body-lg text-ink/80">
        Référence visuelle du portfolio. Toutes les données affichées ici sont générées et
        n’ont aucune valeur réelle. Cette page est retirée du build de production.
      </p>

      <Block title="Couleurs">
        <ul className="grid list-none grid-cols-2 gap-4 p-0 sm:grid-cols-4 lg:grid-cols-7">
          {tokens.map((token) => (
            <li key={token.name}>
              <div className="h-20 border-2 border-ink" style={{ background: token.hex }} />
              <p className="mt-2 font-medium">{token.name}</p>
              <p className="font-pixel text-micro text-ink/70">{token.hex}</p>
              <p className="mt-1 text-sm text-ink/70">{token.role}</p>
            </li>
          ))}
        </ul>
      </Block>

      <Block title="Contraste">
        <p className="mb-5 max-w-2xl text-ink/80">
          Ratios WCAG 2.1 calculés au build. Un couple en dessous de 4.5 ne sert jamais pour du
          texte courant : la moutarde reste réservée aux aplats et aux fonds.
        </p>
        <ul className="grid list-none grid-cols-1 gap-3 p-0 sm:grid-cols-2 lg:grid-cols-3">
          {pairs.map((pair) => {
            const ratio = contrastRatio(pair.fg, pair.bg);
            const level = wcagLevel(ratio);
            return (
              <li
                key={pair.label}
                className="flex items-center justify-between gap-3 border-2 border-ink px-4 py-3"
                style={{ background: pair.bg, color: pair.fg }}
              >
                <span className="font-medium">{pair.label}</span>
                <span className="font-pixel text-micro-lg">
                  {ratio.toFixed(1)} · {level}
                </span>
              </li>
            );
          })}
        </ul>
      </Block>

      <Block title="Typographie">
        <div className="space-y-6">
          <div>
            <p className="font-pixel text-micro uppercase text-ink/60">Fraunces · hero</p>
            <p className="font-display text-hero font-extrabold">Long runs</p>
          </div>
          <div>
            <p className="font-pixel text-micro uppercase text-ink/60">Fraunces · section</p>
            <p className="font-display text-section font-bold text-teak">Projects</p>
          </div>
          <div className="max-w-2xl">
            <p className="font-pixel text-micro uppercase text-ink/60">Instrument Sans · corps</p>
            <p className="text-body-lg">
              Je construis des systèmes de données et je cours très longtemps. Le corps de texte
              tient entre 17 et 18 pixels, avec un interligne de 1,55 pour rester confortable sur
              des paragraphes de deux ou trois lignes.
            </p>
          </div>
          <div className="max-w-2xl">
            <p className="font-pixel text-micro uppercase text-ink/60">
              EB Garamond · disponible, pas encore assignée
            </p>
            <p className="font-garamond text-3xl font-semibold">Investment Thesis Builder</p>
            <p className="font-garamond mt-2 text-xl">
              Je construis des systèmes de données et je cours très longtemps.{' '}
              <em>Une variante italique est disponible</em>, de 400 à 800.
            </p>
          </div>
          <div>
            <p className="font-pixel text-micro uppercase text-ink/60">Silkscreen · micro</p>
            <p className="font-pixel text-micro-lg">last updated 2026-09-20</p>
          </div>
        </div>
      </Block>

      <Block title="Boutons et statuts">
        <div className="flex flex-wrap items-center gap-4">
          <a href="#" className="btn-bevel bg-mustard">
            See projects
          </a>
          <a href="#" className="btn-bevel bg-paper">
            Secondary
          </a>
          <span className="inline-block border-2 border-ink bg-mustard px-2 py-1 font-pixel text-micro-lg uppercase">
            building
          </span>
          <span className="inline-block border-2 border-ink bg-paper px-2 py-1 font-pixel text-micro-lg uppercase">
            planned
          </span>
          <span className="inline-block border-2 border-ink bg-teal px-2 py-1 font-pixel text-micro-lg uppercase text-paper">
            shipped
          </span>
          <span className="inline-block border-2 border-ink bg-tomato px-2 py-1 font-pixel text-micro-lg uppercase text-paper">
            upcoming
          </span>
        </div>
      </Block>

      <Block title="Formes">
        <div className="flex flex-wrap items-center gap-10">
          <Starburst size={140} />
          <div className="h-24 w-48 rounded-full border-2 border-ink bg-olive" />
          <div
            className="h-24 w-48 border-2 border-ink bg-teak"
            style={{ borderRadius: '60% 12% 60% 12% / 60% 12% 60% 12%' }}
          />
          <div className="w-64 space-y-4">
            <SectionRule variant="wave" color="#8C4A26" />
            <SectionRule variant="dots" color="#2E6A68" />
          </div>
        </div>
      </Block>

      <Block title="Heatmap">
        <p className="mb-6 max-w-2xl text-ink/80">
          Séries générées, 365 jours, seuils par quantiles. Survolez une case ou entrez au clavier
          puis naviguez aux flèches.
        </p>
        <div className="space-y-10">
          <ActivityHeatmap
            days={codeDays}
            unit="commits"
            palette="code"
            locale="fr"
            label="Commits (factice)"
          />
          <ActivityHeatmap
            days={runDays}
            unit="km"
            palette="run"
            locale="fr"
            label="Kilomètres (factice)"
          />
        </div>
      </Block>

      <Block title="Badges 88×31">
        <div className="flex flex-wrap items-center gap-3">
          {badges.map((badge) => (
            <Badge88 key={badge.bottom} spec={badge} />
          ))}
        </div>
      </Block>
    </main>
  );
}
