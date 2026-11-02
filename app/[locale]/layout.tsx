import { notFound } from 'next/navigation';
import { locales, type Locale } from '@/content/types';
import { t } from '@/content/i18n';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!locales.includes(locale as Locale)) notFound();
  const copy = t(locale as Locale);

  return (
    <>
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:border-2 focus:border-ink focus:bg-mustard focus:px-3 focus:py-2"
      >
        {copy.skipToContent}
      </a>
      {children}
    </>
  );
}
