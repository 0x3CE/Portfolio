/**
 * Convertit l'export Strava (activities.csv) en /data/training.json.
 *
 * L'API Strava est réservée aux comptes abonnés : cette voie-ci passe par
 * l'export de données, gratuit pour tout le monde.
 *
 *   Strava → Paramètres → Mon compte → « Télécharger ou supprimer votre compte »
 *   → Demander votre archive. Un zip arrive par mail, il contient activities.csv.
 *
 *   npm run import:strava -- ~/Downloads/export_123456/activities.csv
 *
 * À relancer à chaque fois que tu veux rafraîchir la heatmap.
 */
import './load-env';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const outFile = resolve(here, '../data/training.json');

/** Libellés de course dans l'export, anglais et français. */
const RUN_LABELS = [
  'run',
  'trail run',
  'virtual run',
  'course à pied',
  'course a pied',
  'trail',
  'course virtuelle',
];

function fail(message: string): never {
  console.error(`\n[import-strava-csv] ${message}\n`);
  process.exit(1);
}

/** Parseur CSV minimal mais correct : guillemets, virgules et sauts de ligne échappés. */
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let quoted = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];

    if (quoted) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 1;
        } else {
          quoted = false;
        }
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      quoted = true;
    } else if (char === ',') {
      row.push(field);
      field = '';
    } else if (char === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else if (char !== '\r') {
      field += char;
    }
  }

  if (field !== '' || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows;
}

function findColumn(header: string[], candidates: string[]): number {
  const normalized = header.map((cell) => cell.trim().toLowerCase());
  for (const candidate of candidates) {
    const index = normalized.indexOf(candidate);
    if (index !== -1) return index;
  }
  // Repli : première colonne qui contient le mot-clé.
  for (const candidate of candidates) {
    const index = normalized.findIndex((cell) => cell.includes(candidate));
    if (index !== -1) return index;
  }
  return -1;
}

/**
 * L'export Strava date les activités en `MMM D, YYYY, H:MM:SS AM` (en)
 * ou `D MMM YYYY à HH:MM:SS` (fr), selon la langue du compte.
 */
function toIsoDate(raw: string): string | null {
  const value = raw.trim();
  if (value === '') return null;

  const iso = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;

  const parsed = new Date(value.replace(/\s+à\s+/, ' '));
  if (!Number.isNaN(parsed.getTime())) {
    const year = parsed.getFullYear();
    const month = String(parsed.getMonth() + 1).padStart(2, '0');
    const day = String(parsed.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  return null;
}

function toNumber(raw: string): number | null {
  const cleaned = raw.trim().replace(/\s/g, '').replace(',', '.');
  if (cleaned === '') return null;
  const value = Number(cleaned);
  return Number.isFinite(value) ? value : null;
}

function main(): void {
  const path = process.argv[2]?.trim();
  if (!path) {
    fail(
      'Usage: npm run import:strava -- <chemin vers activities.csv>\n' +
        'Le fichier se trouve dans l’archive envoyée par Strava\n' +
        '(Paramètres → Mon compte → Télécharger ou supprimer votre compte).',
    );
  }

  let text: string;
  try {
    text = readFileSync(resolve(process.cwd(), path), 'utf8');
  } catch {
    fail(`cannot read ${path}`);
  }

  const rows = parseCsv(text).filter((row) => row.length > 1);
  const header = rows.shift();
  if (!header) fail('the CSV looks empty');

  const dateColumn = findColumn(header, ['activity date', "date de l'activité", 'date']);
  const typeColumn = findColumn(header, ['activity type', "type d'activité", 'type']);
  const distanceColumn = findColumn(header, ['distance']);

  if (dateColumn === -1) fail('no date column found in the CSV header');
  if (distanceColumn === -1) fail('no distance column found in the CSV header');

  type Entry = { date: string; distance: number };
  const entries: Entry[] = [];
  let skippedType = 0;

  for (const row of rows) {
    const rawType = typeColumn === -1 ? '' : (row[typeColumn] ?? '').trim().toLowerCase();
    if (typeColumn !== -1 && rawType !== '' && !RUN_LABELS.includes(rawType)) {
      skippedType += 1;
      continue;
    }

    const date = toIsoDate(row[dateColumn] ?? '');
    const distance = toNumber(row[distanceColumn] ?? '');
    if (!date || distance === null || distance <= 0) continue;

    entries.push({ date, distance });
  }

  if (entries.length === 0) {
    fail(
      'no running activity could be read.\n' +
        `Colonnes détectées : date="${header[dateColumn]}", type="${
          typeColumn === -1 ? '(aucune)' : header[typeColumn]
        }", distance="${header[distanceColumn]}".\n` +
        'Si le type de tes courses n’est pas dans RUN_LABELS, ajoute-le en haut du script.',
    );
  }

  /*
   * L'unité de la colonne Distance varie selon l'export : kilomètres ou mètres.
   * On tranche sur la médiane — une sortie médiane de plus de 1000 est en mètres.
   */
  const sorted = entries.map((entry) => entry.distance).sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)] ?? 0;
  const divisor = median > 1000 ? 1000 : 1;

  const byDate = new Map<string, number>();
  for (const entry of entries) {
    byDate.set(entry.date, (byDate.get(entry.date) ?? 0) + entry.distance / divisor);
  }

  // 365 jours pleins jusqu'à aujourd'hui, y compris les jours sans course.
  const today = new Date();
  const days: { date: string; value: number }[] = [];
  for (let offset = 364; offset >= 0; offset -= 1) {
    const cursor = new Date(today.getTime() - offset * 86_400_000);
    const date = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}-${String(
      cursor.getDate(),
    ).padStart(2, '0')}`;
    days.push({ date, value: Math.round((byDate.get(date) ?? 0) * 10) / 10 });
  }

  const total = Math.round(days.reduce((sum, day) => sum + day.value, 0));
  const activeDays = days.filter((day) => day.value > 0).length;
  const longest = Math.max(...days.map((day) => day.value));

  mkdirSync(dirname(outFile), { recursive: true });
  writeFileSync(
    outFile,
    `${JSON.stringify(
      { source: 'strava-export', total, days, fetchedAt: new Date().toISOString() },
      null,
      2,
    )}\n`,
  );

  console.log(`\n[import-strava-csv] wrote data/training.json`);
  console.log(`  ${entries.length} activités lues, ${skippedType} ignorées (autre sport)`);
  console.log(`  unité détectée : ${divisor === 1000 ? 'mètres' : 'kilomètres'}`);
  console.log(`  ${total} km sur 365 jours, ${activeDays} jours actifs`);
  console.log(`  plus longue sortie : ${longest} km`);
  console.log('\n  Vérifie que ces chiffres te parlent avant de committer le fichier.\n');
}

main();
