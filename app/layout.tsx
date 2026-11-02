import type { Metadata, Viewport } from 'next';
import { EB_Garamond, Fraunces, Instrument_Sans, Silkscreen } from 'next/font/google';
import './globals.css';

const fraunces = Fraunces({
  subsets: ['latin'],
  display: 'swap',
  // Variable : les axes excluent `weight`, la graisse est pilotée en CSS (600–800).
  axes: ['SOFT', 'WONK', 'opsz'],
  variable: '--font-fraunces',
});

const instrument = Instrument_Sans({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500'],
  variable: '--font-instrument',
});

// Variable 400–800, italique incluse ; l'axe optique est géré par la police elle-même.
const garamond = EB_Garamond({
  subsets: ['latin'],
  display: 'swap',
  style: ['normal', 'italic'],
  variable: '--font-garamond',
});

const silkscreen = Silkscreen({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '700'],
  variable: '--font-silkscreen',
});

export const metadata: Metadata = {
  title: 'Aj — Data Engineer',
  description: 'Data systems and very long distances. Projects built in public, and an ultra-trail season.',
};

export const viewport: Viewport = {
  themeColor: '#F1E8D6',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${instrument.variable} ${garamond.variable} ${silkscreen.variable}`}>
      <body>{children}</body>
    </html>
  );
}
