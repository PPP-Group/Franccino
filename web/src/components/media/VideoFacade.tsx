'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import { withAutoplay } from '@/lib/media/links';

/**
 * Click-to-load player: nothing from YouTube or Vimeo loads (and no third-party cookie is set) until the
 * visitor asks for the video. An optional `poster` (a page block's cover) shows behind the play button.
 * With `src` (a video file served by the site's own storage) the same button starts a native `<video>`:
 * not a byte of the file is downloaded before the click.
 */
export function VideoFacade({
  title,
  embedUrl = null,
  src = null,
  poster = null,
}: {
  title: string;
  embedUrl?: string | null;
  src?: string | null;
  poster?: string | null;
}) {
  const t = useTranslations('mediaLinks');
  const [playing, setPlaying] = useState(false);
  return (
    <figure className="video">
      <div className="video__frame">
        {playing && src ? (
          <video
            src={src}
            aria-label={title}
            poster={poster ?? undefined}
            controls
            autoPlay
            playsInline
            preload="auto"
          />
        ) : playing && embedUrl ? (
          <iframe
            src={withAutoplay(embedUrl)}
            title={title}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
        ) : (
          <button
            type="button"
            className={poster ? 'video__play video__play--poster' : 'video__play'}
            onClick={() => setPlaying(true)}
          >
            {poster ? (
              // eslint-disable-next-line @next/next/no-img-element -- capa de bloco do painel, sem conversões da API.
              <img className="video__poster" src={poster} alt="" loading="lazy" decoding="async" />
            ) : null}
            <Icon name="play" />
            <span className="visually-hidden">{t('play', { title })}</span>
          </button>
        )}
      </div>
      <figcaption>{title}</figcaption>
    </figure>
  );
}
