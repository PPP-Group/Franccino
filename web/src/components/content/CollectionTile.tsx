import { useTranslations } from 'next-intl';
import { ApiImage } from '@/components/media/ApiImage';
import { Link } from '@/i18n/navigation';
import type { CollectionCard } from '@/lib/api/types';
import { fixedBoxCoverSizes } from '@/lib/images/cover-sizes';

/** Proporção do bloco (16:9): todos iguais, mesmo com capas de proporções diferentes. */
const TILE_RATIO = 16 / 9;

/**
 * Bloco grande da coleção, como no site antigo (ajustes do cliente, 06/10/2026): só a foto; ao passar o
 * mouse (ou com o foco) a foto escurece e aparecem o nome e o "Saiba mais".
 *
 * `alone`: o último bloco de uma lista ímpar fica centralizado na linha no computador, em vez de deixar meia linha
 * vazia à direita. (Esticado na linha toda, a faixa do WordPress mostrava o texto da própria arte.) O `sizes` conta o
 * recorte da faixa larga no bloco 16:9 (revisão de 06/11/2026).
 */
export function CollectionTile({
  collection,
  priority = false,
  alone = false,
}: {
  collection: CollectionCard;
  priority?: boolean;
  alone?: boolean;
}) {
  const common = useTranslations('common');
  const sizes = fixedBoxCoverSizes(collection.cover, TILE_RATIO, [
    { media: '(max-width: 48rem)', width: '100vw' },
    { width: '50vw' },
  ]);
  return (
    <Link
      className={alone ? 'collection-tile collection-tile--alone' : 'collection-tile'}
      href={{ pathname: '/collections/[slug]', params: { slug: collection.slug } }}
    >
      <div className="collection-tile__media">
        <ApiImage image={collection.cover} sizes={sizes} priority={priority} />
      </div>
      <div className="collection-tile__overlay">
        <h2 className="collection-tile__title">{collection.name}</h2>
        <span className="collection-tile__more" aria-hidden="true">
          {common('learnMore')}
        </span>
      </div>
    </Link>
  );
}
