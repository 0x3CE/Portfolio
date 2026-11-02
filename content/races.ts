import type { Race } from './types';

export const races = [
  {
    name: 'Eiffage Viaduc Race',
    distanceKm: 23.7,
    elevationM: 450,
    date: '2026-09',
    time: '1h54"22',
    rank: '580/7804',
    status: 'finished',
  },
  {
    name: "Requis'trail",
    distanceKm: 31,
    elevationM: 1100,
    date: '2026-09',
    time: null,
    rank: null,
    status: 'finished',
  },
  {
    name: "Sainté - Lyon",
    distanceKm: 80,
    elevationM: 2200,
    date: '2026-11',
    time: null,
    rank: null,
    status: 'upcoming',
  },
  {
    // TODO (Aj) : nom exact de la backyard.
    name: 'Backyard Ultra Toulouse',
    distanceKm: null,
    elevationM: null,
    date: '2027-02',
    time: null,
    rank: null,
    status: 'upcoming',
    note: {
      en: 'Training block: peak at 155 km per week, two full race simulations for the backyard',
      fr: "Bloc d'entraînement : pic à 155 km par semaine, deux simulations complètes pour la backyard",
    },
  },
  // TODO (Aj) : autres courses.
] satisfies Race[];
