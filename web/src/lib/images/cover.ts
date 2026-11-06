/**
 * `sizes` de imagens desenhadas com `object-fit: cover` e a regra da arte larga (rodada 3, 06/11/2026).
 *
 * - Banner da home: sempre a tela inteira (100vh) com `cover`, a pedido do tech lead (vale sobre a regra anterior de
 *   seguir a proporção da arte). A faixa de ~1920×500 do WordPress é desenhada com a altura da tela e fica bem mais
 *   larga que ela: o `sizes` conta essa largura, e o navegador baixa o maior arquivo que houver.
 * - Banner de página (`PageBanner`): arte larga com texto continua sem recorte (`isWideArt`).
 *
 * Lógica pura, sem React: os componentes só ligam o resultado ao markup.
 */

import type { Image } from '@/lib/api/types';

/** Acima desta proporção (largura ÷ altura) a imagem é tratada como faixa: o banner de página segue a proporção dela. */
export const WIDE_ART_MIN_RATIO = 2.4;

/**
 * Altura do banner da home: a tela inteira. Precisa acompanhar `--hero-h` em `styles/home.css` (lá em `svh`, aqui em
 * `vh`, a unidade que o `sizes` entende em todo navegador).
 */
export const HERO_HEIGHT = '100vh';

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

/** `sizes` da foto do banner da home: a tela inteira (`100vw` × `100vh`), com o recorte do `cover`. */
export function heroSizes(image: Sized | null | undefined): string {
  return coverSizes(aspectRatio(image), { width: '100vw', height: HERO_HEIGHT });
}
