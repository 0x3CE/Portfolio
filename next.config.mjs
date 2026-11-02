import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PHASE_DEVELOPMENT_SERVER } from 'next/constants.js';

/** @type {(phase: string) => import('next').NextConfig} */
const nextConfig = (phase) => ({
  // Sans ça, Turbopack remonte jusqu'au home et avale le package-lock voisin.
  turbopack: { root: dirname(fileURLToPath(import.meta.url)) },
  // `next dev` ajoute sinon un bloc de règles à la fin de CLAUDE.md, qui appartient à Aj.
  agentRules: false,
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
  // /styleguide vit dans `page.dev.tsx` : compilé en dev ou avec INCLUDE_STYLEGUIDE=1,
  // absent de tout autre build. Exclu à la compilation, pas supprimé après coup :
  // un hébergeur qui publie sans passer par out/ ne peut donc pas le servir.
  pageExtensions:
    phase === PHASE_DEVELOPMENT_SERVER || process.env.INCLUDE_STYLEGUIDE === '1'
      ? ['dev.tsx', 'tsx', 'ts']
      : ['tsx', 'ts'],
});

export default nextConfig;
