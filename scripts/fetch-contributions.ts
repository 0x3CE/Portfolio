/**
 * Récupère le calendrier de contributions GitHub des 365 derniers jours
 * et l'écrit dans /data/contributions.json.
 *
 * Ne casse jamais le build : sans token, sans réseau ou sur erreur API,
 * on garde le dernier JSON commité et on log un warning.
 */
import './load-env';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

type ContributionDay = { date: string; contributionCount: number };
type CalendarResponse = {
  data?: {
    user?: {
      contributionsCollection?: {
        contributionCalendar?: {
          totalContributions: number;
          weeks: { contributionDays: ContributionDay[] }[];
        };
      };
    };
  };
  errors?: { message: string }[];
};

const here = dirname(fileURLToPath(import.meta.url));
const outFile = resolve(here, '../data/contributions.json');

const QUERY = `
  query($login: String!, $from: DateTime!, $to: DateTime!) {
    user(login: $login) {
      contributionsCollection(from: $from, to: $to) {
        contributionCalendar {
          totalContributions
          weeks { contributionDays { date contributionCount } }
        }
      }
    }
  }
`;

function warn(reason: string): void {
  console.warn(`[fetch-contributions] ${reason} — keeping the committed JSON.`);
}

function readUsername(): string | null {
  const fromEnv = process.env.GITHUB_USERNAME?.trim();
  if (fromEnv) return fromEnv;
  const source = readFileSync(resolve(here, '../content/profile.ts'), 'utf8');
  const match = source.match(/githubUsername:\s*(?:TODO as string|['"]([^'"]+)['"])/);
  return match?.[1] ?? null;
}

async function main(): Promise<void> {
  const token = process.env.GITHUB_TOKEN?.trim();
  const login = readUsername();

  if (!login) return warn('no GitHub username set in content/profile.ts');
  if (!token) return warn('GITHUB_TOKEN is not set');

  const to = new Date();
  const from = new Date(to.getTime() - 364 * 24 * 60 * 60 * 1000);

  let payload: CalendarResponse;
  try {
    const response = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'User-Agent': 'portfolio-aj-build',
      },
      body: JSON.stringify({
        query: QUERY,
        variables: { login, from: from.toISOString(), to: to.toISOString() },
      }),
      signal: AbortSignal.timeout(15_000),
    });
    if (!response.ok) return warn(`GitHub API returned ${response.status}`);
    payload = (await response.json()) as CalendarResponse;
  } catch (error) {
    return warn(`request failed: ${(error as Error).message}`);
  }

  if (payload.errors?.length) return warn(`GraphQL error: ${payload.errors[0]?.message}`);

  const calendar = payload.data?.user?.contributionsCollection?.contributionCalendar;
  if (!calendar) return warn('no contribution calendar in the response');

  const days = calendar.weeks
    .flatMap((week) => week.contributionDays)
    .map((day) => ({ date: day.date, value: day.contributionCount }));

  if (days.length === 0) return warn('the calendar came back empty');

  mkdirSync(dirname(outFile), { recursive: true });
  writeFileSync(
    outFile,
    `${JSON.stringify(
      { username: login, total: calendar.totalContributions, days, fetchedAt: new Date().toISOString() },
      null,
      2,
    )}\n`,
  );
  console.log(`[fetch-contributions] wrote ${days.length} days for ${login}.`);
}

main().catch((error: unknown) => {
  warn(`unexpected failure: ${(error as Error).message}`);
});
