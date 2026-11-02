import Link from 'next/link';
import { defaultLocale } from '@/content/i18n';

/**
 * `output: 'export'` ne gère pas les redirects serveur : on redirige côté document.
 * React 19 remonte `<meta>` dans le `<head>`.
 */
export default function RootPage() {
  const target = `/${defaultLocale}/`;
  return (
    <main className="shell flex min-h-screen items-center">
      <meta httpEquiv="refresh" content={`0; url=${target}`} />
      <Link className="btn-bevel bg-mustard" href={target}>
        Continue to the site
      </Link>
    </main>
  );
}
