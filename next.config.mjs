import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Sans ça, Turbopack remonte jusqu'au home et avale le package-lock voisin.
  turbopack: { root: dirname(fileURLToPath(import.meta.url)) },
  // `next dev` ajoute sinon un bloc de règles à la fin de CLAUDE.md, qui appartient à Aj.
  agentRules: false,
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
};

export default nextConfig;
