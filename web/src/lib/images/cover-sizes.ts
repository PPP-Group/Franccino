/**
 * `sizes` de imagens recortadas com `object-fit: cover` nas páginas de conteúdo (banner de página, blocos de coleção),
 * rodada 2, revisão de 06/11/2026. Usa a proporção e a regra da arte larga de `./cover` (banner da home), sem repetir.
 *
 * Por quê: a faixa do WordPress (~1920×500, proporção 3,84) num bloco 16:9 é desenhada com a altura do bloco e fica
 * bem mais larga que ele. Com `sizes="50vw"` o navegador baixava a versão de 960 px e ampliava (foto borrada).
 */

import type { Image } from '@/lib/api/types';
import { aspectRatio, coverSizes } from './cover';

/**
 * Altura do banner de página com foto (`PageBanner`). Precisa ser igual a `--page-banner-h` em `styles/pages.css`:
 * o `sizes` do banner é calculado com ela.
 */
export const PAGE_BANNER_HEIGHT = 'clamp(360px, 62vh, 640px)';

/**
 * Um ponto do `sizes`: condição de mídia (a última fica sem), largura do bloco em CSS (`50vw`, `100vw`) e, quando o
 * bloco muda de proporção nesse ponto, a proporção dele.
 */
export type CoverSlot = { media?: string; width: string; boxRatio?: number };

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Quantas vezes a imagem desenhada é mais larga que o bloco de proporção `boxRatio` (largura ÷ altura). 1 quando a
 * imagem é mais estreita ou igual (aí o `cover` recorta em cima e embaixo, e a largura desenhada é a do bloco).
 */
export function coverScale(imageRatio: number | null, boxRatio: number): number {
  if (imageRatio === null || boxRatio <= 0 || imageRatio <= boxRatio) {
    return 1;
  }
  return round(imageRatio / boxRatio);
}

/**
 * `sizes` de uma imagem com `cover` num bloco de proporção fixa (ex.: 16:9), em cada ponto de `slots`. A largura de
 * cada ponto é multiplicada pela escala do recorte, com `calc()` simples (sem `max()`, que nem todo navegador lê no
 * `sizes`).
 */
export function fixedBoxCoverSizes(
  image: Pick<Image, 'width' | 'height'> | null | undefined,
  boxRatio: number,
  slots: CoverSlot[],
): string {
  const ratio = aspectRatio(image);
  return slots
    .map(({ media, width, boxRatio: slotRatio }) => {
      const scale = coverScale(ratio, slotRatio ?? boxRatio);
      const drawn = scale === 1 ? width : `calc(${width} * ${scale})`;
      return media ? `${media} ${drawn}` : drawn;
    })
    .join(', ');
}

/** `sizes` da foto do banner de página: largura da tela, ou mais quando a altura fixa do banner força o recorte. */
export function pageBannerSizes(image: Pick<Image, 'width' | 'height'> | null | undefined): string {
  return coverSizes(aspectRatio(image), { width: '100vw', height: PAGE_BANNER_HEIGHT });
}
