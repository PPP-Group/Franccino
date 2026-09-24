/**
 * Renders an API `Image` as a native `<img>` — not `next/image` — because the
 * API already produces the resized conversions (`srcset`) and blur
 * placeholder (`blur_data_url`); Next's own image optimization would be
 * redundant. See `web/CLAUDE.md`.
 */

import type { CSSProperties } from 'react';
import type { Image } from '@/lib/api/types';
import { buildSrcSet } from '@/lib/images/srcset';

type ApiImageProps = {
  image: Image | null;
  sizes: string;
  priority?: boolean;
  className?: string;
};

export function ApiImage({ image, sizes, priority = false, className }: ApiImageProps) {
  if (!image) {
    return null;
  }

  const srcSet = buildSrcSet(image);
  const style: CSSProperties | undefined = image.blur_data_url
    ? {
        backgroundImage: `url(${image.blur_data_url})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    : undefined;

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
      style={style}
    />
  );
}
