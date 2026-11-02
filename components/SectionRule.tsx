type Props = {
  variant?: 'wave' | 'dots';
  color?: string;
  className?: string;
};

/** Séparateur de section : ligne ondulée ou rangée de pastilles. Jamais un filet fin. */
export function SectionRule({ variant = 'wave', color = '#231C15', className = '' }: Props) {
  if (variant === 'dots') {
    // Motif répété plutôt qu'une liste fixe : la rangée remplit toujours sa largeur.
    return (
      <div
        className={`h-2.5 w-full ${className}`}
        aria-hidden="true"
        style={{
          backgroundImage: `radial-gradient(circle at 5px 5px, ${color} 4px, transparent 4px)`,
          backgroundSize: '22px 10px',
          backgroundRepeat: 'repeat-x',
        }}
      />
    );
  }

  return (
    <svg
      className={`h-3 w-full ${className}`}
      viewBox="0 0 120 12"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M0 6 Q 5 0, 10 6 T 20 6 T 30 6 T 40 6 T 50 6 T 60 6 T 70 6 T 80 6 T 90 6 T 100 6 T 110 6 T 120 6"
        fill="none"
        stroke={color}
        strokeWidth="2"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
