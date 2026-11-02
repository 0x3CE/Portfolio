/**
 * Charge .env.local puis .env dans process.env.
 *
 * Next lit ces fichiers tout seul, mais les scripts lancés via `tsx` non :
 * sans ça, `npm run fetch:data` ne voit jamais GITHUB_TOKEN.
 * Les variables déjà définies dans l'environnement (CI, Vercel) gagnent toujours.
 */
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

function parse(contents: string): void {
  for (const rawLine of contents.split('\n')) {
    const line = rawLine.trim();
    if (line === '' || line.startsWith('#')) continue;

    const separator = line.indexOf('=');
    if (separator === -1) continue;

    const key = line.slice(0, separator).trim();
    if (key === '' || process.env[key] !== undefined) continue;

    // Retire les guillemets éventuels autour de la valeur.
    const value = line
      .slice(separator + 1)
      .trim()
      .replace(/^(['"])(.*)\1$/, '$2');

    process.env[key] = value;
  }
}

for (const file of ['.env.local', '.env']) {
  const path = resolve(root, file);
  if (!existsSync(path)) continue;
  try {
    parse(readFileSync(path, 'utf8'));
  } catch {
    console.warn(`[load-env] could not read ${file} — ignoring it.`);
  }
}
