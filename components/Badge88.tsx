export type BadgeSpec = {
  /** Deux lignes de 10–12 caractères maximum : c'est un 88×31. */
  top: string;
  bottom: string;
  bg: string;
  fg: string;
  accent: string;
};

export const badges: BadgeSpec[] = [
  { top: 'made with', bottom: 'SQL', bg: '#2E6A68', fg: '#F1E8D6', accent: '#D9A320' },
  { top: 'powered by', bottom: 'COFFEE', bg: '#8C4A26', fg: '#F1E8D6', accent: '#D9A320' },
  { top: '100k', bottom: 'FINISHER', bg: '#6E7B3B', fg: '#F1E8D6', accent: '#D8452B' },
  { top: 'best viewed', bottom: 'ANYWHERE', bg: '#231C15', fg: '#F1E8D6', accent: '#2E6A68' },
];

/** Badge 88×31 dessiné pour le site — aucun asset externe. */
export function Badge88({ spec }: { spec: BadgeSpec }) {
  const title = `${spec.top} ${spec.bottom}`;
  return (
    <svg
      width="88"
      height="31"
      viewBox="0 0 88 31"
      role="img"
      aria-label={title}
      className="shrink-0"
      shapeRendering="crispEdges"
    >
      <rect width="88" height="31" fill={spec.bg} />
      <rect x="0.5" y="0.5" width="87" height="30" fill="none" stroke={spec.accent} />
      <rect x="0" y="0" width="88" height="2" fill={spec.accent} />
      <text
        x="6"
        y="13"
        fill={spec.fg}
        fillOpacity="0.75"
        fontFamily="var(--font-silkscreen), monospace"
        fontSize="7"
      >
        {spec.top}
      </text>
      <text
        x="6"
        y="25"
        fill={spec.fg}
        fontFamily="var(--font-silkscreen), monospace"
        fontSize="9"
      >
        {spec.bottom}
      </text>
    </svg>
  );
}
