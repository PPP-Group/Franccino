import { ApiImage } from '@/components/media/ApiImage';
import type { Image } from '@/lib/api/types';
import { fixedBoxCoverSizes, type CoverSlot } from '@/lib/images/cover-sizes';
import { editorialRhythm } from './layout';
import { ShowMore } from './ShowMore';

/**
 * Proporções e larguras da galeria (iguais a `.editorial-gallery` em `styles/pages.css`): a imagem larga ocupa a
 * largura do conteúdo (no máximo 1448 px, `--max` menos as margens) em 16:9; o par divide a linha em 4:5 (uma por
 * linha no celular).
 */
const FULL: { ratio: number; slots: CoverSlot[] } = {
  ratio: 16 / 9,
  slots: [{ media: '(min-width: 97.5rem)', width: '1448px' }, { width: '100vw' }],
};
const PAIR: { ratio: number; slots: CoverSlot[] } = {
  ratio: 4 / 5,
  slots: [{ media: '(max-width: 35rem)', width: '100vw' }, { width: '50vw' }],
};

/** Linhas à vista com a galeria fechada (uma larga, um par, outra larga: 4 fotos). */
const ROWS_SHOWN = 3;

/**
 * Galeria em composição editorial (projeto e coleção, rodada 3): uma imagem na largura toda, depois duas lado a lado,
 * alternando, sem legendas. Cada linha aparece ao entrar na tela. Com `collapse`, só as primeiras linhas aparecem, com
 * "Ver mais" (revisão de 13/11/2026).
 */
export function EditorialGallery({
  images,
  label,
  collapse = false,
}: {
  images: Image[];
  label: string;
  collapse?: boolean;
}) {
  if (images.length === 0) {
    return null;
  }
  const groups = editorialRhythm(images.length);
  const shown = collapse
    ? groups.slice(0, ROWS_SHOWN).reduce((sum, group) => sum + group.indexes.length, 0)
    : images.length;
  const gallery = (
    <section className="editorial-gallery" aria-label={label}>
      {groups.map((group, row) => {
        const box = group.kind === 'full' ? FULL : PAIR;
        const extra = collapse && row >= ROWS_SHOWN ? ' is-extra' : '';
        return (
          <div
            key={group.indexes[0]}
            className={`editorial-gallery__row editorial-gallery__row--${group.kind}${extra}`}
            data-reveal={group.kind === 'pair' ? 'stagger' : ''}
          >
            {group.indexes.map((index) => {
              const picture = images[index];
              return (
                <figure key={picture.id} className="editorial-gallery__item" data-gallery-index={index}>
                  <ApiImage image={picture} sizes={fixedBoxCoverSizes(picture, box.ratio, box.slots)} />
                </figure>
              );
            })}
          </div>
        );
      })}
    </section>
  );
  return collapse ? <ShowMore hidden={images.length - shown}>{gallery}</ShowMore> : gallery;
}
