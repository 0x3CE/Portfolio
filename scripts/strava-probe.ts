/**
 * Sonde l'endpoint interne du graphe d'activité Strava et sauvegarde la réponse brute,
 * pour qu'on voie la structure avant d'écrire un parseur.
 *
 * Ce n'est PAS l'API publique : c'est ce que la page de profil appelle en interne.
 * Non documenté, susceptible de changer, et il exige ton cookie de session
 * puisque le compte est privé.
 *
 * Mise en place :
 *   1. Ouvrir strava.com connecté, DevTools → Application → Cookies → strava.com
 *   2. Copier la valeur de `_strava4_session`
 *   3. Dans .env.local :
 *        STRAVA_SESSION=la_valeur
 *        STRAVA_ATHLETE_ID=50868994
 *   4. npm run strava:probe            → semaine courante
 *      npm run strava:probe -- 202639  → semaine 39 de 2026
 *
 * La réponse est écrite dans .strava-probe/ (ignoré par git) — inspecte-la,
 * et surtout vérifie qu'elle ne contient rien que tu ne veuilles pas me montrer.
 */
import './load-env';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(here, '../.strava-probe');

function fail(message: string): never {
  console.error(`\n[strava-probe] ${message}\n`);
  process.exit(1);
}

/** Numéro de semaine ISO, au format attendu par Strava : AAAASS. */
function currentInterval(): string {
  const now = new Date();
  const target = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  const dayNumber = (target.getUTCDay() + 6) % 7;
  target.setUTCDate(target.getUTCDate() - dayNumber + 3);
  const firstThursday = new Date(Date.UTC(target.getUTCFullYear(), 0, 4));
  const week =
    1 +
    Math.round(
      ((target.getTime() - firstThursday.getTime()) / 86_400_000 -
        3 +
        ((firstThursday.getUTCDay() + 6) % 7)) /
        7,
    );
  return `${target.getUTCFullYear()}${String(week).padStart(2, '0')}`;
}

async function main(): Promise<void> {
  const session = process.env.STRAVA_SESSION?.trim();
  const athlete = process.env.STRAVA_ATHLETE_ID?.trim();

  if (!session) fail('STRAVA_SESSION is not set in .env.local');
  if (!athlete) fail('STRAVA_ATHLETE_ID is not set in .env.local');

  const interval = process.argv[2]?.trim() || currentInterval();

  const url = new URL(`https://www.strava.com/athletes/${athlete}/interval`);
  url.searchParams.set('interval', interval);
  url.searchParams.set('interval_type', 'week');
  url.searchParams.set('chart_type', 'miles');
  url.searchParams.set('year_offset', '0');

  console.log(`\n[strava-probe] GET ${url.toString()}`);

  const response = await fetch(url, {
    headers: {
      Cookie: `_strava4_session=${session}`,
      Accept: 'text/html, application/xhtml+xml, */*',
      'X-Requested-With': 'XMLHttpRequest',
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36',
    },
    redirect: 'manual',
    signal: AbortSignal.timeout(20_000),
  });

  console.log(`[strava-probe] status ${response.status} ${response.statusText}`);
  console.log(`[strava-probe] content-type ${response.headers.get('content-type') ?? '(none)'}`);

  if (response.status === 302 || response.status === 301) {
    fail(
      `redirected to ${response.headers.get('location')}\n` +
        'Le cookie est probablement expiré ou mal copié : Strava renvoie vers la page de login.',
    );
  }

  const body = await response.text();
  mkdirSync(outDir, { recursive: true });
  const file = resolve(outDir, `interval-${interval}.txt`);
  writeFileSync(file, body);

  console.log(`[strava-probe] ${body.length} caractères écrits dans`);
  console.log(`  .strava-probe/interval-${interval}.txt\n`);
  console.log('--- 1500 premiers caractères ---\n');
  console.log(body.slice(0, 1500));
  console.log('\n--- fin de l’extrait ---\n');
}

main().catch((error: unknown) => {
  fail((error as Error).message);
});
