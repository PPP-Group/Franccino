import type { CSSProperties } from 'react';
import { ApiImage } from '@/components/media/ApiImage';
import type { Image } from '@/lib/api/types';
import { PREVIEW_COUNT } from '@/lib/catalog/technical';
import { peekBox, PEEK_PHOTO } from '@/lib/catalog/row-peek';

type PeekContent = { images: Image[]; colors?: Image[] };

/** Caixa da prévia: até `PREVIEW_COUNT` fotos por linha, e uma linha a mais quando há outras cores. */
export function peekSize({ images, colors = [] }: PeekContent): { width: number; height: number } {
  const columns = Math.max(Math.min(images.length, PREVIEW_COUNT), Math.min(colors.length, PREVIEW_COUNT));
  return peekBox(columns, images.length > 0 && colors.length > 0 ? 2 : 1);
}

/**
 * Fotos que se abrem lado a lado na prévia (tabela técnica, busca, cards da grade). Retorno de 16/11/2026: no máximo
 * `PREVIEW_COUNT` por linha; com mais, a última ganha outras atrás dela, como uma pilha, para mostrar que há mais. Peça
 * com outras cores: as capas delas numa linha em cima, e as fotos da peça embaixo.
 */
export function PeekPhotos({ images, colors = [] }: PeekContent) {
  const rows = [colors, images].filter((row) => row.length > 0);
  return (
    <div className="row-peek__group">
      {rows.map((row, rowIndex) => {
        const shown = row.slice(0, PREVIEW_COUNT);
        const more = row.length > PREVIEW_COUNT;
        return shown.map((image, index) => (
          <div
            key={`${rowIndex}-${image.id}`}
            className={
              more && index === shown.length - 1 ? 'row-peek__photo row-peek__photo--more' : 'row-peek__photo'
            }
            style={
              {
                '--i': index,
                '--row': rowIndex,
                '--peek-rotate': (index + rowIndex) % 2 ? '1.5deg' : '-1.5deg',
                zIndex: shown.length - index,
              } as CSSProperties
            }
          >
            <ApiImage image={image} sizes={`${PEEK_PHOTO.width}px`} />
          </div>
        ));
      })}
    </div>
  );
}
