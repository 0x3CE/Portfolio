import Image from 'next/image';
import type { Locale, Media } from '@/content/types';

/** Visuel de repli quand le projet n'a pas de média : pilule ou boomerang. */
function Shape({ index }: { index: number }) {
  const fills = ['#6E7B3B', '#8C4A26', '#2E6A68'];
  return (
    <div
      className="h-full w-full border-2 border-ink"
      style={{
        background: fills[index % fills.length],
        borderRadius: index % 2 === 1 ? '60% 12% 60% 12% / 60% 12% 60% 12%' : '9999px',
      }}
      aria-hidden="true"
    />
  );
}

type Props = {
  media: Media | null | undefined;
  locale: Locale;
  index: number;
  /** Hauteur du cadre : carte de bande défilante ou en-tête de page projet. */
  size: 'card' | 'page';
};

export function ProjectMedia({ media, locale, index, size }: Props) {
  const frame = size === 'card' ? 'h-28' : 'h-64 sm:h-96';

  if (!media) {
    return (
      <div className={frame}>
        <Shape index={index} />
      </div>
    );
  }

  if (media.type === 'video') {
    return (
      <video
        className={`${frame} w-full border-2 border-ink object-cover`}
        src={media.src}
        poster={media.poster}
        aria-label={media.alt[locale]}
        muted
        playsInline
        loop
        autoPlay
        preload="metadata"
      />
    );
  }

  return (
    <div className={`relative ${frame} w-full overflow-hidden border-2 border-ink`}>
      <Image
        src={media.src}
        alt={media.alt[locale]}
        fill
        className="object-cover"
        sizes={size === 'card' ? '21rem' : '(max-width: 640px) 100vw, 42rem'}
      />
    </div>
  );
}
