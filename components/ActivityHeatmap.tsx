'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ActivityDay, Locale } from '@/content/types';
import { formatDate, t } from '@/content/i18n';
import {
  CELL,
  GAP,
  MOBILE_WEEKS,
  RADIUS,
  STEP,
  clip,
  monthTicks,
  palettes,
  spanOf,
  toWeeks,
  total,
  type HeatmapCell,
  type HeatmapPalette,
  type HeatmapSpan,
  type HeatmapWeek,
} from '@/lib/heatmap';
import { monthLabel } from '@/content/i18n';

type Props = {
  days: ActivityDay[];
  unit: 'commits' | 'km';
  palette: HeatmapPalette;
  locale: Locale;
  /** Titre lu par les lecteurs d'écran et affiché au-dessus de la grille. */
  label: string;
  stale?: boolean;
  /** Période commune quand plusieurs grilles doivent tomber sur les mêmes semaines. */
  span?: HeatmapSpan | null;
};

type Focus = { week: number; day: number };

/** Dernier jour réellement renseigné : point d'entrée du clavier. */
function lastCell(weeks: HeatmapWeek[]): Focus {
  for (let week = weeks.length - 1; week >= 0; week -= 1) {
    for (let day = 6; day >= 0; day -= 1) {
      const cell = weeks[week]?.[day];
      if (cell && !cell.noData) return { week, day };
    }
  }
  return { week: 0, day: 0 };
}

export function ActivityHeatmap({ days, unit, palette, locale, label, stale = false, span }: Props) {
  const copy = t(locale).heatmap;
  const weeks = useMemo(() => toWeeks(days, span ?? undefined), [days, span]);
  const ticks = useMemo(() => monthTicks(weeks), [weeks]);
  const sum = useMemo(() => total(span ? clip(days, span) : days), [days, span]);
  const dataEnd = spanOf(days)?.to ?? null;
  const colors = palettes[palette];

  const [focus, setFocus] = useState<Focus>(() => lastCell(weeks));
  const [hovered, setHovered] = useState<HeatmapCell | null>(null);
  const [focused, setFocused] = useState<HeatmapCell | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Mobile : on arrive sur les semaines les plus récentes, l'historique est à gauche.
  useEffect(() => {
    const scroller = scrollRef.current;
    if (scroller) scroller.scrollLeft = scroller.scrollWidth;
  }, []);

  const cellAt = useCallback(
    (week: number, day: number): HeatmapCell | null => {
      const cell = weeks[week]?.[day];
      return cell && !cell.noData ? cell : null;
    },
    [weeks],
  );

  const move = useCallback(
    (event: React.KeyboardEvent, from: Focus) => {
      const deltas: Record<string, [number, number]> = {
        ArrowRight: [1, 0],
        ArrowLeft: [-1, 0],
        ArrowDown: [0, 1],
        ArrowUp: [0, -1],
      };
      const delta = deltas[event.key];
      if (!delta) return;
      event.preventDefault();

      let [week, day] = [from.week + delta[0], from.day + delta[1]];
      if (day > 6) [day, week] = [0, week + 1];
      if (day < 0) [day, week] = [6, week - 1];
      if (week < 0 || week >= weeks.length) return;
      if (!cellAt(week, day)) return;

      setFocus({ week, day });
      const next = gridRef.current?.querySelector<HTMLElement>(`[data-cell="${week}-${day}"]`);
      next?.focus();
    },
    [cellAt, weeks.length],
  );

  if (weeks.length === 0) {
    return (
      <div className="border-2 border-dashed border-ink/30 px-4 py-6">
        <p className="font-pixel text-micro-lg uppercase tracking-wide text-ink/60">{copy.none}</p>
      </div>
    );
  }

  const active = hovered ?? focused;
  const unitLabel = unit === 'commits' ? copy.commits : copy.km;
  const totalLabel = unit === 'commits' ? copy.totalCommits(sum) : copy.totalKm(sum);
  const width = weeks.length * STEP - GAP;
  const height = 7 * STEP - GAP;

  return (
    <figure className="m-0">
      <figcaption className="mb-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <span className="font-display text-xl font-semibold">{label}</span>
        <span className="font-pixel text-micro-lg text-ink/70">{totalLabel}</span>
      </figcaption>

      {/* Mobile : 26 dernières semaines visibles, le reste au scroll. */}
      <div
        ref={scrollRef}
        className="overflow-x-auto pb-1"
        style={{ maxWidth: '100%' }}
        role="group"
        aria-label={`${label} — ${copy.mobileHint}`}
      >
        <div
          ref={gridRef}
          role="grid"
          aria-label={copy.label}
          className="relative"
          style={{ width, minWidth: MOBILE_WEEKS * STEP - GAP }}
        >
          <div className="mb-1 h-4" aria-hidden="true">
            {ticks.map((tick) => (
              <span
                key={`${tick.week}-${tick.month}`}
                className="absolute font-pixel text-micro text-ink/55"
                style={{ left: tick.week * STEP, top: 0 }}
              >
                {monthLabel(locale, tick.month)}
              </span>
            ))}
          </div>

          <svg
            width={width}
            height={height}
            viewBox={`0 0 ${width} ${height}`}
            className="block"
            aria-hidden="true"
          >
            {weeks.map((week, weekIndex) =>
              week.map((cell, dayIndex) =>
                cell && !cell.noData ? (
                  <rect
                    key={cell.date}
                    x={weekIndex * STEP}
                    y={dayIndex * STEP}
                    width={CELL}
                    height={CELL}
                    rx={RADIUS}
                    fill={colors[cell.level]}
                  />
                ) : null,
              ),
            )}
          </svg>

          {/* Cases focusables superposées : la grille SVG reste nette, le clavier fonctionne. */}
          <div className="absolute inset-x-0" style={{ top: '1.25rem', height }}>
            {weeks.map((week, weekIndex) =>
              week.map((cell, dayIndex) =>
                cell && !cell.noData ? (
                  <button
                    key={cell.date}
                    type="button"
                    data-cell={`${weekIndex}-${dayIndex}`}
                    role="gridcell"
                    tabIndex={focus.week === weekIndex && focus.day === dayIndex ? 0 : -1}
                    aria-label={copy.cell(cell.value, unitLabel, formatDate(locale, cell.date))}
                    className="absolute rounded-[2px]"
                    style={{ left: weekIndex * STEP, top: dayIndex * STEP, width: CELL, height: CELL }}
                    onMouseEnter={() => setHovered(cell)}
                    onMouseLeave={() => setHovered(null)}
                    onFocus={() => {
                      setFocus({ week: weekIndex, day: dayIndex });
                      setFocused(cell);
                    }}
                    onBlur={() => setFocused(null)}
                    onKeyDown={(event) => move(event, { week: weekIndex, day: dayIndex })}
                  />
                ) : null,
              ),
            )}
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
        <div className="flex items-center gap-1.5">
          <span className="font-pixel text-micro text-ink/70">{copy.less}</span>
          {colors.map((color, index) => (
            <span
              key={color}
              className="inline-block rounded-[2px]"
              style={{ width: CELL, height: CELL, background: color }}
              aria-hidden="true"
              data-level={index}
            />
          ))}
          <span className="font-pixel text-micro text-ink/70">{copy.more}</span>
        </div>

        <p className="min-h-[1.25rem] text-sm text-ink/80" aria-live="polite">
          {active ? copy.cell(active.value, unitLabel, formatDate(locale, active.date)) : ''}
        </p>
      </div>

      {span && dataEnd && dataEnd < span.to ? (
        <p className="mt-2 font-pixel text-micro text-ink/55">
          {copy.dataThrough(formatDate(locale, dataEnd))}
        </p>
      ) : null}

      {stale ? (
        <p className="mt-2 font-pixel text-micro text-ink/55">{copy.stale}</p>
      ) : null}
    </figure>
  );
}
