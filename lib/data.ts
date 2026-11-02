import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { ContributionData, TrainingData } from '@/content/types';

/** Lecture tolérante : un fichier absent ou illisible ne casse jamais le build. */
function readJson<T>(relativePath: string): T | null {
  try {
    return JSON.parse(readFileSync(resolve(process.cwd(), relativePath), 'utf8')) as T;
  } catch {
    return null;
  }
}

export function contributions(): ContributionData {
  return (
    readJson<ContributionData>('data/contributions.json') ?? {
      username: null,
      total: 0,
      days: [],
      fetchedAt: null,
    }
  );
}

/** Optionnel : présent seulement si Aj a déposé data/training.json. */
export function training(): TrainingData | null {
  const data = readJson<TrainingData>('data/training.json');
  if (!data || !Array.isArray(data.days) || data.days.length === 0) return null;
  return data;
}

/** Commits par semaine et par repo, pour les mini-heatmaps des cartes projet. */
export function repoActivity(): Record<string, number[]> {
  return readJson<Record<string, number[]>>('data/repo-activity.json') ?? {};
}

/** Date du dernier build, figée dans le HTML exporté. */
export function lastUpdated(): string {
  const stamp = contributions().fetchedAt;
  return (stamp ?? new Date().toISOString()).slice(0, 10);
}
