import Link from 'next/link';
import { t } from '@/content/i18n';
import type { Locale } from '@/content/types';

/** Bascule FR/EN visible dans le header. Conserve la page courante. */
export function LocaleSwitch({ locale, path = '' }: { locale: Locale; path?: string }) {
  const other: Locale = locale === 'en' ? 'fr' : 'en';
  const copy = t(locale).locale;

  return (
    <Link
      href={`/${other}/${path}`}
      hrefLang={other}
      className="border-2 border-ink px-2.5 py-1 font-pixel text-micro-lg uppercase transition-colors hover:bg-mustard"
    >
      {copy.switchTo}
    </Link>
  );
}
