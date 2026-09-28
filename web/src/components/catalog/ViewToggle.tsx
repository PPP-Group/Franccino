import { useTranslations } from 'next-intl';
import { Icon } from '@/components/ui/Icon';
import { Link, type AppHref } from '@/i18n/navigation';
import type { CatalogView } from '@/lib/catalog/view';

export function ViewToggle({
  view,
  hrefFor,
}: {
  view: CatalogView;
  hrefFor: (view: CatalogView) => AppHref;
}) {
  const t = useTranslations('catalog.view');
  return (
    <div className="view-toggle" role="group" aria-label={t('label')}>
      <Link href={hrefFor('grid')} scroll={false} aria-current={view === 'grid' ? 'true' : undefined}>
        <Icon name="grid" />
        <span>{t('grid')}</span>
      </Link>
      <Link href={hrefFor('table')} scroll={false} aria-current={view === 'table' ? 'true' : undefined}>
        <Icon name="table" />
        <span>{t('table')}</span>
      </Link>
    </div>
  );
}
