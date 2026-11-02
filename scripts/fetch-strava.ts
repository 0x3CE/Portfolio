/**
 * Récupère les activités Strava des 365 derniers jours et écrit /data/training.json
 * (kilomètres par jour), qui alimente la heatmap course.
 *
 * Chaîne Coros → Strava → ici : la montre synchronise déjà vers Strava,
 * on ne lit que Strava. L'API Coros est réservée aux partenaires validés.
 *
 * Même contrat que les autres scripts : ne casse jamais le build.
 * Sans identifiants, on garde le JSON commité (ou on ne crée rien) et on log un warning.
 */
import './load-env';
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const outFile = resolve(here, '../data/training.json');

/**
 * Types Strava comptés comme « course ».
 * Ajoute 'Hike' ou 'Walk' ici si tu veux les voir dans la heatmap.
 */
const RUN_TYPES = new Set(['Run', 'TrailRun', 'VirtualRun']);

type StravaActivity = {
  type?: string;
  sport_type?: string;
  distance?: number;
  start_date_local?: string;
};

function warn(reason: string): void {
  console.warn(`[fetch-strava] ${reason} — keeping the committed JSON.`);
}

async function accessToken(
  clientId: string,
  clientSecret: string,
  refreshToken: string,
): Promise<string | null> {
  try {
    const response = await fetch('https://www.strava.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
      signal: AbortSignal.timeout(15_000),
    });

    if (!response.ok) {
      warn(`token exchange returned ${response.status}`);
      return null;
    }

    const payload = (await response.json()) as {
      access_token?: string;
      refresh_token?: string;
    };

    // Strava peut faire tourner le refresh token : si c'est le cas, il faut le remplacer.
    if (payload.refresh_token && payload.refresh_token !== refreshToken) {
      console.warn(
        '[fetch-strava] Strava issued a NEW refresh token. Update STRAVA_REFRESH_TOKEN with:\n' +
          `  ${payload.refresh_token}`,
      );
    }

    return payload.access_token ?? null;
  } catch (error) {
    warn(`token exchange failed: ${(error as Error).message}`);
    return null;
  }
}

async function allActivities(token: string, after: number): Promise<StravaActivity[] | null> {
  const activities: StravaActivity[] = [];
  const perPage = 200;

  for (let page = 1; page <= 10; page += 1) {
    let batch: StravaActivity[];
    try {
      const url = new URL('https://www.strava.com/api/v3/athlete/activities');
      url.searchParams.set('after', String(after));
      url.searchParams.set('per_page', String(perPage));
      url.searchParams.set('page', String(page));

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
        signal: AbortSignal.timeout(20_000),
      });

      if (response.status === 429) {
        warn('rate limited by Strava (100 requests / 15 min)');
        return activities.length > 0 ? activities : null;
      }
      if (!response.ok) {
        warn(`activities returned ${response.status}`);
        return activities.length > 0 ? activities : null;
      }

      batch = (await response.json()) as StravaActivity[];
    } catch (error) {
      warn(`activities request failed: ${(error as Error).message}`);
      return activities.length > 0 ? activities : null;
    }

    if (!Array.isArray(batch) || batch.length === 0) break;
    activities.push(...batch);
    if (batch.length < perPage) break;
  }

  return activities;
}

/** Somme les distances par jour local, en kilomètres, sur 365 jours pleins. */
function toDays(activities: StravaActivity[], from: Date, to: Date): { date: string; value: number }[] {
  const byDate = new Map<string, number>();

  for (const activity of activities) {
    const kind = activity.sport_type ?? activity.type;
    if (!kind || !RUN_TYPES.has(kind)) continue;
    if (!activity.start_date_local || typeof activity.distance !== 'number') continue;

    // `start_date_local` est déjà dans le fuseau de l'activité : on garde la date telle quelle.
    const date = activity.start_date_local.slice(0, 10);
    byDate.set(date, (byDate.get(date) ?? 0) + activity.distance / 1000);
  }

  const days: { date: string; value: number }[] = [];
  for (let cursor = new Date(from); cursor <= to; cursor.setUTCDate(cursor.getUTCDate() + 1)) {
    const date = cursor.toISOString().slice(0, 10);
    days.push({ date, value: Math.round((byDate.get(date) ?? 0) * 10) / 10 });
  }

  return days;
}

async function main(): Promise<void> {
  const clientId = process.env.STRAVA_CLIENT_ID?.trim();
  const clientSecret = process.env.STRAVA_CLIENT_SECRET?.trim();
  const refreshToken = process.env.STRAVA_REFRESH_TOKEN?.trim();

  if (!clientId || !clientSecret || !refreshToken) {
    const missing = [
      clientId ? null : 'STRAVA_CLIENT_ID',
      clientSecret ? null : 'STRAVA_CLIENT_SECRET',
      refreshToken ? null : 'STRAVA_REFRESH_TOKEN',
    ].filter(Boolean);
    return warn(`missing ${missing.join(', ')}`);
  }

  const token = await accessToken(clientId, clientSecret, refreshToken);
  if (!token) return;

  const to = new Date();
  const from = new Date(to.getTime() - 364 * 24 * 60 * 60 * 1000);

  const activities = await allActivities(token, Math.floor(from.getTime() / 1000));
  if (!activities) return;

  const days = toDays(activities, from, to);
  const total = Math.round(days.reduce((sum, day) => sum + day.value, 0));

  if (total === 0 && existsSync(outFile)) {
    return warn('no running activity found in the last year');
  }

  mkdirSync(dirname(outFile), { recursive: true });
  writeFileSync(
    outFile,
    `${JSON.stringify({ source: 'strava', total, days, fetchedAt: new Date().toISOString() }, null, 2)}\n`,
  );
  console.log(`[fetch-strava] wrote ${days.length} days, ${total} km total.`);
}

main().catch((error: unknown) => {
  warn(`unexpected failure: ${(error as Error).message}`);
});
