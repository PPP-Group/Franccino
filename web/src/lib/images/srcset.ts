/**
 * Helpers for the `srcset`/`src` conversions the API returns on every
 * `Image` (see `docs/api.md`). Kept independent of any rendering framework
 * so `ApiImage` (and any future consumer) can build markup from them.
 */

import type { Image } from '@/lib/api/types';

/** Builds a `srcset` attribute value ("url 480w, url 960w") from `image.srcset`. */
export function buildSrcSet(image: Image): string {
  return image.srcset.map((entry) => `${entry.url} ${entry.width}w`).join(', ');
}

/**
 * Picks the smallest available conversion that is at least `width` pixels
 * wide, falling back to the largest one when none is wide enough. Used for
 * the plain `src` fallback (browsers without `srcset` support, or a
 * server-rendered `background-image`).
 */
export function pickSource(image: Image, width: number): string {
  if (image.srcset.length === 0) {
    return image.src;
  }

  const bySize = [...image.srcset].sort((a, b) => a.width - b.width);
  const match = bySize.find((entry) => entry.width >= width);

  return (match ?? bySize[bySize.length - 1]!).url;
}
