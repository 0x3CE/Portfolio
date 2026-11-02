type Props = {
  /** Taille en pixels du carré englobant. */
  size?: number;
  className?: string;
  spin?: boolean;
};

const POINTS = 16;

/** Starburst atomique mid-century. Seul élément en rotation continue du site. */
export function Starburst({ size = 160, className = '', spin = true }: Props) {
  const rays = Array.from({ length: POINTS }, (_, i) => {
    const angle = (i / POINTS) * Math.PI * 2;
    const long = i % 2 === 0;
    const outer = long ? 50 : 34;
    return {
      key: i,
      x2: 50 + Math.cos(angle) * outer,
      y2: 50 + Math.sin(angle) * outer,
    };
  });

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      aria-hidden="true"
      focusable="false"
      className={`${spin ? 'motion-safe:animate-spin-slow' : ''} ${className}`}
      style={{ transformOrigin: '50% 50%' }}
    >
      {rays.map((ray) => (
        <line
          key={ray.key}
          x1="50"
          y1="50"
          x2={ray.x2}
          y2={ray.y2}
          stroke="#D8452B"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      ))}
      <circle cx="50" cy="50" r="7" fill="#D8452B" />
      <circle cx="50" cy="50" r="13" fill="none" stroke="#D8452B" strokeWidth="1.6" />
    </svg>
  );
}
