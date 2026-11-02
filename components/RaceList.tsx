import { RaceStatusBadge } from '@/components/StatusBadge';
import { formatDate } from '@/content/i18n';
import { filled, type Locale, type Race } from '@/content/types';

function Detail({ children }: { children: React.ReactNode }) {
  return <span className="text-ink/70">{children}</span>;
}

export function RaceList({ races, locale }: { races: Race[]; locale: Locale }) {
  return (
    <ul className="list-none divide-y-2 divide-ink/15 p-0">
      {races.map((race) => {
        const date = filled(race.date);
        // Un champ vide ne produit aucun élément : pas de tiret, pas de « TODO ».
        const details = [
          date ? formatDate(locale, date) : null,
          race.distanceKm ? `${race.distanceKm} km` : null,
          race.elevationM ? `${race.elevationM} m D+` : null,
          race.time,
          race.rank,
        ].filter((value): value is string => Boolean(value));

        return (
          <li key={race.name} className="flex flex-wrap items-baseline gap-x-4 gap-y-2 py-4">
            <h3 className="font-display text-xl font-semibold">{race.name}</h3>
            <RaceStatusBadge status={race.status} locale={locale} />
            {details.length > 0 ? (
              <p className="flex flex-wrap gap-x-4">
                {details.map((detail) => (
                  <Detail key={detail}>{detail}</Detail>
                ))}
              </p>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
