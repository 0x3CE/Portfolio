/**
 * Récupère l'activité hebdomadaire de chaque repo référencé dans content/projects.ts
 * et l'écrit dans /data/repo-activity.json (commits par semaine, 52 semaines).
 *
 * Même contrat que fetch-contributions : ne casse jamais le build.
 */
import './load-env';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const outFile = resolve(here, '../data/repo-activity.json');

function warn(reason: string): void {
  console.warn(`[fetch-repo-activity] ${reason} — keeping the committed JSON.`);
}

/** Lit les `repo` déclarés sans importer le module TypeScript. */
function declaredRepos(): string[] {
  const source = readFileSync(resolve(here, '../content/projects.ts'), 'utf8');
  const found = [...source.matchAll(/repo:\s*'([^']+)'/g)].map((match) => match[1]);
  return [...new Set(found.filter((repo): repo is string => Boolean(repo)))];
}

function existing(): Record<string, number[]> {
  if (!existsSync(outFile)) return {};
  try {
    return JSON.parse(readFileSync(outFile, 'utf8')) as Record<string, number[]>;
  } catch {
    return {};
  }
}

async function weeksFor(repo: string, token: string): Promise<number[] | null> {
  try {
    const response = await fetch(`https://api.github.com/repos/${repo}/stats/commit_activity`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'User-Agent': 'portfolio-aj-build',
      },
      signal: AbortSignal.timeout(15_000),
    });

    // 202 : GitHub calcule les stats en arrière-plan, elles arriveront au prochain build.
    if (response.status === 202) {
      warn(`${repo}: stats are still being computed`);
      return null;
    }
    if (!response.ok) {
      warn(`${repo}: API returned ${response.status}`);
      return null;
    }

    const payload = (await response.json()) as { total: number }[];
    if (!Array.isArray(payload)) return null;
    return payload.map((week) => week.total);
  } catch (error) {
    warn(`${repo}: ${(error as Error).message}`);
    return null;
  }
}

async function main(): Promise<void> {
  const repos = declaredRepos();
  if (repos.length === 0) {
    console.log('[fetch-repo-activity] no project declares a repo — nothing to do.');
    return;
  }

  const token = process.env.GITHUB_TOKEN?.trim();
  if (!token) return warn('GITHUB_TOKEN is not set');

  const result = existing();
  let updated = 0;

  for (const repo of repos) {
    const weeks = await weeksFor(repo, token);
    if (weeks) {
      result[repo] = weeks;
      updated += 1;
    }
  }

  if (updated === 0) return warn('no repo could be refreshed');

  mkdirSync(dirname(outFile), { recursive: true });
  writeFileSync(outFile, `${JSON.stringify(result, null, 2)}\n`);
  console.log(`[fetch-repo-activity] refreshed ${updated} of ${repos.length} repos.`);
}

main().catch((error: unknown) => {
  warn(`unexpected failure: ${(error as Error).message}`);
});
