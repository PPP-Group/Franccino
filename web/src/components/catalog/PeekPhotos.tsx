'use client';

import { useTranslations } from 'next-intl';
import type { CSSProperties } from 'react';
import { ApiImage } from '@/components/media/ApiImage';
import type { Image } from '@/lib/api/types';
import { PREVIEW_COUNT } from '@/lib/catalog/technical';
import { PEEK_CAPTION, peekBox, PEEK_PHOTO, PEEK_ROW_STEP } from '@/lib/catalog/row-peek';

type PeekContent = { images: Image[]; colors?: Image[] };

/** Caixa da prévia: até `PREVIEW_COUNT` fotos por linha, e a linha das outras cores (com a etiqueta) embaixo. */
export function peekSize({ images, colors = [] }: PeekContent): { width: number; height: number } {
  const columns = Math.max(Math.min(images.length, PREVIEW_COUNT), Math.min(colors.length, PREVIEW_COUNT));
  return peekBox(columns, images.length > 0 && colors.length > 0 ? 2 : 1, colors.length > 0);
}

/**
 * Fotos que se abrem lado a lado na prévia (tabela técnica, busca, cards da grade). Retornos de 16/11/2026: no máximo
 * `PREVIEW_COUNT` por linha; com mais, a última ganha outras atrás dela, como uma pilha, para mostrar que há mais. Peça
 * com outras cores: primeiro as fotos da peça; embaixo, com a etiqueta "Também em outras cores", as capas das outras
 * cores (atrás das fotos da peça, nunca na frente).
 */
export function PeekPhotos({ images, colors = [] }: PeekContent) {
  const t = useTranslations('product.colors');
  const colorRow = images.length > 0 ? 1 : 0;
  const captionTop = 12 + colorRow * PEEK_ROW_STEP;
  const rows = [
    { photos: images, row: 0, caption: false },
    { photos: colors, row: colorRow, caption: true },
  ].filter((entry) => entry.photos.length > 0);
  return (
    <div className="row-peek__group">
      {rows.map(({ photos, row, caption }) => {
        const shown = photos.slice(0, PREVIEW_COUNT);
        const more = photos.length > PREVIEW_COUNT;
        return shown.map((image, index) => (
          <div
            key={`${row}-${image.id}`}
            className={
              more && index === shown.length - 1 ? 'row-peek__photo row-peek__photo--more' : 'row-peek__photo'
            }
            style={
              {
                '--i': index,
                '--row': row,
                '--cap': caption ? `${PEEK_CAPTION}px` : '0px',
                '--peek-rotate': (index + row) % 2 ? '1.5deg' : '-1.5deg',
                // As fotos da peça ficam por cima das outras cores quando a inclinação as encosta.
                zIndex: (caption ? 0 : 10) + shown.length - index,
              } as CSSProperties
            }
          >
            <ApiImage image={image} sizes={`${PEEK_PHOTO.width}px`} />
          </div>
        ));
      })}
      {/* Depois das fotos no HTML: a primeira foto continua sendo a que entra sem deslizar (catalog.css). */}
      {colors.length > 0 ? (
        <p className="row-peek__caption" style={{ top: captionTop, height: PEEK_CAPTION }}>
          {t('peek')}
        </p>
      ) : null}
    </div>
  );
}
