import { useTranslations } from 'next-intl';
import { ApiImage } from '@/components/media/ApiImage';
import { Link } from '@/i18n/navigation';
import type { CollectionCard } from '@/lib/api/types';

/**
 * Bloco grande da coleção, como no site antigo (ajustes do cliente, 06/10/2026): só a foto; ao passar o
 * mouse (ou com o foco) a foto escurece e aparecem o nome e o "Saiba mais".
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
    <Link
      className="collection-tile"
      href={{ pathname: '/collections/[slug]', params: { slug: collection.slug } }}
    >
      <div className="collection-tile__media">
        <ApiImage image={collection.cover} sizes="(max-width: 48rem) 100vw, 50vw" priority={priority} />
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
