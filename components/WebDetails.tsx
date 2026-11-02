import { Badge88, badges } from '@/components/Badge88';
import { t } from '@/content/i18n';
import type { Locale } from '@/content/types';

/** Compteur odomètre : valeur figée au build, jamais présentée comme un trafic réel. */
function Odometer({ value }: { value: string }) {
  return (
    <span className="inline-flex gap-px border-2 border-ink bg-ink p-0.5" aria-hidden="true">
      {value.split('').map((digit, index) => (
        <span key={index} className="bg-paper px-1 font-pixel text-micro-lg leading-5 text-ink">
          {digit}
        </span>
      ))}
    </span>
  );
}

export function WebDetails({ locale, lastUpdated }: { locale: Locale; lastUpdated: string }) {
  const copy = t(locale).footer;

  return (
    <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-6">
      <div className="flex flex-wrap items-center gap-3">
        {badges.map((badge) => (
          <Badge88 key={badge.bottom} spec={badge} />
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <p className="font-pixel text-micro-lg uppercase text-ink/70">
          {copy.lastUpdated} {lastUpdated}
        </p>
        <span className="flex items-center gap-2">
          <Odometer value={lastUpdated.replace(/-/g, '')} />
          <span className="font-pixel text-micro uppercase text-ink/60">{copy.since}</span>
        </span>
      </div>
    </div>
  );
}
