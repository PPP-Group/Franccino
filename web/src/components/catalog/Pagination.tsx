import { useTranslations } from 'next-intl';
import { Link, type AppHref } from '@/i18n/navigation';
import type { Paginated } from '@/lib/api/types';

type PaginationProps = {
  meta: Paginated<unknown>['meta'];
  hrefFor: (page: number) => AppHref;
  label: string;
};

export function Pagination({ meta, hrefFor, label }: PaginationProps) {
  const t = useTranslations('catalog.pagination');
  if (meta.last_page <= 1) {
    return null;
  }
  const current = meta.current_page;
  const last = meta.last_page;
  return (
    <nav className="pagination" aria-label={label}>
      {current > 1 ? (
        <Link className="link-arrow" href={hrefFor(current - 1)} rel="prev">
          {t('previous')}
        </Link>
      ) : (
        <span />
      )}
      <span className="meta num">{t('status', { current, last })}</span>
      {current < last ? (
        <Link className="link-arrow" href={hrefFor(current + 1)} rel="next">
          {t('next')}
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
