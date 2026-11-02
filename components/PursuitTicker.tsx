type Props = {
  words: string[];
  direction: 'left' | 'right';
  color?: string;
};

/** Liste de mots défilante. En pause au survol, statique si `prefers-reduced-motion`. */
export function PursuitTicker({ words, direction, color = '#231C15' }: Props) {
  const group = (
    <div className="flex shrink-0 items-center">
      {words.map((word) => (
        <span key={word} className="flex items-center">
          <span className="whitespace-nowrap font-garamond text-4xl font-semibold sm:text-5xl">
            {word}
          </span>
          <span
            className="mx-6 inline-block h-3 w-3 shrink-0 rounded-full sm:mx-9"
            style={{ background: color }}
            aria-hidden="true"
          />
        </span>
      ))}
    </div>
  );

  return (
    <div
      className="marquee overflow-hidden py-2"
      style={{ ['--marquee-duration' as string]: `${Math.max(24, words.length * 9)}s` }}
    >
      {/* La liste réelle est lue une fois ; la copie ne sert qu'à boucler. */}
      <ul className="sr-only">
        {words.map((word) => (
          <li key={word}>{word}</li>
        ))}
      </ul>
      <div
        className={`marquee-track ${
          direction === 'left' ? 'animate-marquee-left' : 'animate-marquee-right'
        } motion-reduce:animate-none`}
        aria-hidden="true"
      >
        {group}
        {group}
      </div>
    </div>
  );
}
