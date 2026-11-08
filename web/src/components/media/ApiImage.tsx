/**
 * Renders an API `Image` as a native `<img>` — not `next/image` — because the
 * API already produces the resized conversions (`srcset`); Next's own image
 * optimization would be redundant. See `web/CLAUDE.md`.
 *
 * Loading (retorno de 07/11/2026): no blurred preview any more (`blur_data_url` is
 * ignored). While the photo loads, the box shows a soft placeholder and the photo
 * fades in once it arrives (`data-img`; BootScript marks `data-loaded`, motion.css).
 */

import type { CSSProperties } from 'react';
import type { Image } from '@/lib/api/types';
import { buildSrcSet } from '@/lib/images/srcset';

type ApiImageProps = {
  image: Image | null;
  sizes: string;
  priority?: boolean;
  className?: string;
  /** Camada da paralaxe (motion.css, ideia 04): a foto anda mais devagar que o quadro em volta. */
  parallax?: boolean;
  /** `false`: sem o placeholder e sem o fade (a foto de chegada do movimento de abrir a peça já está pronta). */
  fade?: boolean;
};

export function ApiImage({
  image,
  sizes,
  priority = false,
  className,
  parallax = false,
  fade = true,
}: ApiImageProps) {
  if (!image) {
    return null;
  }

  const srcSet = buildSrcSet(image);

  const style: CSSProperties = {};
  // Reserves layout space (avoids CLS) only when both dimensions are known;
  // with just one, an aspect-ratio would distort the image instead.
  if (image.width && image.height) {
    style.aspectRatio = `${image.width} / ${image.height}`;
  }
  const hasStyle = Object.keys(style).length > 0;

  return (
    // eslint-disable-next-line @next/next/no-img-element -- see module comment above.
    <img
      src={image.src}
      srcSet={srcSet || undefined}
      sizes={sizes}
      width={image.width ?? undefined}
      height={image.height ?? undefined}
      alt={image.alt}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : undefined}
      decoding="async"
      className={className}
      style={hasStyle ? style : undefined}
      data-parallax-layer={parallax ? 'back' : undefined}
      data-img={fade ? '' : undefined}
      // O BootScript marca `data-loaded` quando a foto chega, às vezes antes de o React hidratar a página.
      suppressHydrationWarning
    />
  );
}
