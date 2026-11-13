/**
 * Pontos clicáveis sobre as fotos do site (retorno de 13/11/2026): banners, capas e galerias. A API manda os pontos
 * pela mídia da foto (`media_id` = `Image.id`); cada página pega só os das fotos que ela mostra e passa ao componente
 * que desenha a foto (`PhotoPoints`).
 */
import type { Image, ImagePoints, Scene } from '@/lib/api/types';

export type PointsIndex = Record<number, ImagePoints>;

/** Só os pontos das fotos da lista (as outras ficam de fora da página). */
export function pickPoints(all: ImagePoints[], images: readonly (Image | null | undefined)[]): PointsIndex {
  const ids = new Set(images.flatMap((image) => (image ? [image.id] : [])));
  const index: PointsIndex = {};
  for (const points of all) {
    if (ids.has(points.media_id) && points.hotspots.length > 0) {
      index[points.media_id] = points;
    }
  }
  return index;
}

/** Os pontos de uma foto como um ambiente, o formato de `ScenePoints`. */
export function asScene(points: ImagePoints, image: Image): Scene {
  return { id: points.id, title: points.title, image, hotspots: points.hotspots };
}
