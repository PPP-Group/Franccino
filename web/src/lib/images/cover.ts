/**
 * Caixa do banner da home e `sizes` de imagens desenhadas com `object-fit: cover` (rodada 2, revisão de 06/11/2026).
 *
 * - Arte larga (faixa de marketing do WordPress, ~1920×500, com o texto na própria arte): o banner segue a proporção
 *   da imagem, sem recorte e sem ampliação, no computador e no celular.
 * - Foto comum: banner alto com `cover`. O `sizes` diz a largura em que a foto é realmente desenhada (com o recorte
 *   ela fica mais larga que a tela), para o navegador baixar pixels suficientes.
 *
 * Lógica pura, sem React: `HeroSection` só liga o resultado ao markup.
 */

import type { Image } from '@/lib/api/types';

/** Acima desta proporção (largura ÷ altura) a imagem é tratada como faixa: o banner segue a proporção dela. */
export const WIDE_ART_MIN_RATIO = 2.4;

/**
 * Altura do banner alto. Precisa ser igual a `--hero-h` em `styles/home.css`: o `sizes` do banner é calculado com
 * ela.
 */
export const HERO_HEIGHT = 'clamp(560px, 82vh, 920px)';

/** Diferença de proporção abaixo da qual a imagem cabe na caixa sem recorte que mereça outro `sizes`. */
const SAME_RATIO_TOLERANCE = 0.05;

type Sized = Pick<Image, 'width' | 'height'>;

/** Largura ÷ altura, ou `null` quando a API não mandou as duas medidas. */
export function aspectRatio(image: Sized | null | undefined): number | null {
  if (!image?.width || !image.height || image.width <= 0 || image.height <= 0) {
    return null;
  }
  return image.width / image.height;
}

export function isWideArt(image: Sized | null | undefined): boolean {
  const ratio = aspectRatio(image);
  return ratio !== null && ratio > WIDE_ART_MIN_RATIO;
}

/** Caixa do banner. `fit`: a caixa tem a proporção da arte (`width` × `height`). `cover`: banner alto, foto recortada. */
export type HeroFrame = { kind: 'fit'; width: number; height: number } | { kind: 'cover' };

/**
 * Caixa do banner a partir da imagem do primeiro slide: no carrossel todos os slides usam a mesma caixa, para a página
 * não pular na troca.
 */
export function heroFrame(image: Sized | null | undefined): HeroFrame {
  if (image?.width && image.height && isWideArt(image)) {
    return { kind: 'fit', width: image.width, height: image.height };
  }
  return { kind: 'cover' };
}

/** Valor do `aspect-ratio` do CSS para uma caixa `fit` (ex.: `1920 / 500`). */
export function frameAspect(frame: HeroFrame): string | null {
  return frame.kind === 'fit' ? `${frame.width} / ${frame.height}` : null;
}

function round(value: number): number {
  return Math.round(value * 1000) / 1000;
}

/**
 * `sizes` de uma imagem com `object-fit: cover` numa caixa `width` × `height` (comprimentos CSS). Quando a imagem é
 * mais larga que a caixa, ela é desenhada com a altura da caixa e largura `height × proporção`, maior que a caixa.
 * Navegador que não entende `max()` no `sizes` ignora o valor e usa `100vw`, como antes.
 */
export function coverSizes(ratio: number | null, box: { width: string; height: string }): string {
  if (ratio === null) {
    return box.width;
  }
  return `max(${box.width}, calc(${box.height} * ${round(ratio)}))`;
}

/**
 * `sizes` da foto principal do banner, que ocupa a largura da tela (`100vw`) na caixa `frame`. Na caixa `fit` a foto
 * com a mesma proporção da arte não é recortada; a de outra proporção (outro slide do carrossel) é recortada como
 * `cover` dentro dela.
 */
export function heroSizes(image: Sized | null | undefined, frame: HeroFrame): string {
  const ratio = aspectRatio(image);
  if (frame.kind === 'fit') {
    const boxRatio = frame.width / frame.height;
    if (ratio === null || Math.abs(ratio - boxRatio) < SAME_RATIO_TOLERANCE) {
      return '100vw';
    }
    return coverSizes(ratio, { width: '100vw', height: `calc(100vw / ${round(boxRatio)})` });
  }
  return coverSizes(ratio, { width: '100vw', height: HERO_HEIGHT });
}
