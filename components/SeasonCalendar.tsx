import { monthLabel, t } from '@/content/i18n';
import { filled, localized, type Locale, type Race } from '@/content/types';

type Cell = { year: number; month: number; races: Race[] };

/** 12 mois glissants à partir du mois courant : la backyard de février 2027 y tombe. */
function buildMonths(races: Race[], from: Date): Cell[] {
  const cells: Cell[] = [];

  for (let offset = 0; offset < 12; offset += 1) {
    const cursor = new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth() + offset, 1));
    const year = cursor.getUTCFullYear();
    const month = cursor.getUTCMonth();
    const key = `${year}-${String(month + 1).padStart(2, '0')}`;

    cells.push({
      year,
      month,
      races: races.filter((race) => filled(race.date)?.startsWith(key)),
    });
  }

  return cells;
}

type Props = { races: Race[]; locale: Locale; now: Date };

export function SeasonCalendar({ races, locale, now }: Props) {
  const copy = t(locale);
  const cells = buildMonths(races, now);
  const hasAnyRace = cells.some((cell) => cell.races.length > 0);

  return (
    <div>
      <p className="font-pixel text-micro-lg uppercase text-ink/70">
        {monthLabel(locale, cells[0]?.month ?? 0)} {cells[0]?.year} —{' '}
        {monthLabel(locale, cells[11]?.month ?? 0)} {cells[11]?.year}
      </p>

      <ol className="mt-4 grid list-none grid-cols-2 gap-3 p-0 sm:grid-cols-3 lg:grid-cols-6">
        {cells.map((cell, index) => {
          const loaded = cell.races.length > 0;
          return (
            <li
              key={`${cell.year}-${cell.month}`}
              className={`min-h-[6.5rem] border-2 border-ink p-3 ${
                loaded ? 'bg-mustard' : 'bg-paper'
              }`}
            >
              <p className="font-pixel text-micro uppercase">
                {monthLabel(locale, cell.month)} {index === 0 || cell.month === 0 ? cell.year : ''}
              </p>
              {loaded ? (
                <ul className="mt-2 list-none space-y-1 p-0">
                  {cell.races.map((race) => (
                    <li key={race.name} className="font-display text-base font-semibold leading-tight">
                      {race.name}
                    </li>
                  ))}
                </ul>
              ) : null}
            </li>
          );
        })}
      </ol>

      {!hasAnyRace ? (
        <p className="mt-4 text-ink/70">{copy.calendar.noRaces}</p>
      ) : null}

      {/* Bloc d'entraînement : texte d'accompagnement porté par la course elle-même. */}
      {races
        .filter((race) => race.status === 'upcoming' && localized(race.note, locale))
        .map((race) => (
          <p key={race.name} className="mt-6 max-w-2xl border-l-4 border-tomato pl-4 text-ink/85">
            {localized(race.note, locale)}
          </p>
        ))}
    </div>
  );
}
