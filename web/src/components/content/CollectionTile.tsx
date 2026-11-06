import { useTranslations } from 'next-intl';
import type { CollectionCard } from '@/lib/api/types';
import { fixedBoxCoverSizes } from '@/lib/images/cover-sizes';
import { CoverTile } from './CoverTile';

/** Proporção do bloco (16:9): todos iguais, mesmo com capas de proporções diferentes. */
export const TILE_RATIO = 16 / 9;

/** Pontos do `sizes` do bloco: a largura toda no celular, meia tela (2 por linha) no resto. */
export const TILE_SLOTS = [{ media: '(max-width: 48rem)', width: '100vw' }, { width: '50vw' }];

/**
 * Bloco grande da coleção, como no site antigo (ajustes do cliente, 06/10/2026): só a foto; ao passar o mouse (ou com
 * o foco) a foto aproxima, escurece e aparecem o nome e o "Saiba mais". O `sizes` conta o recorte da faixa larga no
 * bloco 16:9 (revisão de 06/11/2026). A grade fecha a última linha com um bloco complementar (página Coleções), não
 * com um bloco centralizado.
 */
export function CollectionTile({
  collection,
  priority = false,
}: {
  collection: CollectionCard;
  priority?: boolean;
}) {
  const common = useTranslations('common');
  return (
    <CoverTile
      href={{ pathname: '/collections/[slug]', params: { slug: collection.slug } }}
      title={collection.name}
      cta={common('learnMore')}
      image={collection.cover}
      sizes={fixedBoxCoverSizes(collection.cover, TILE_RATIO, TILE_SLOTS)}
      priority={priority}
    />
  );
}
