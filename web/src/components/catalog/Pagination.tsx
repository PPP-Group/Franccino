import { useTranslations } from 'next-intl';
import { Icon } from '@/components/ui/Icon';
import { Link, type AppHref } from '@/i18n/navigation';
import type { Paginated } from '@/lib/api/types';
import { PageScroll } from './PageScroll';

type PaginationProps = {
  meta: Paginated<unknown>['meta'];
  hrefFor: (page: number) => AppHref;
  label: string;
  /**
   * `top`: "Anterior" e "Próxima" lado a lado na barra de cima, logo depois da contagem (retorno de 09/11/2026);
   * `bottom`: a paginação do fim da lista, que também leva a pessoa de volta ao começo da lista nova.
   */
  position?: 'top' | 'bottom';
};

/**
 * A troca de página não rola para o topo do site de uma vez: a lista nova entra com a animação de revelação e, quando a
 * pessoa clicou embaixo, a página rola suave até o começo da lista (`PageScroll`, `[data-page-anchor]`).
 */
export function Pagination({ meta, hrefFor, label, position = 'bottom' }: PaginationProps) {
  const t = useTranslations('catalog.pagination');
  if (meta.last_page <= 1) {
    return null;
  }
  const current = meta.current_page;
  const last = meta.last_page;
  if (position === 'top') {
    return (
      <nav className="pagination pagination--top" aria-label={label}>
        {current > 1 ? (
          <Link className="pagination__step is-prev" href={hrefFor(current - 1)} rel="prev" scroll={false}>
            <Icon name="arrow" />
            <span>{t('previous')}</span>
          </Link>
        ) : (
          <span className="pagination__step is-prev is-off" aria-hidden="true">
            <Icon name="arrow" />
            <span>{t('previous')}</span>
          </span>
        )}
        <span className="meta num">{t('short', { current, last })}</span>
        {current < last ? (
          <Link className="pagination__step" href={hrefFor(current + 1)} rel="next" scroll={false}>
            <span>{t('next')}</span>
            <Icon name="arrow" />
          </Link>
        ) : (
          <span className="pagination__step is-off" aria-hidden="true">
            <span>{t('next')}</span>
            <Icon name="arrow" />
          </span>
        )}
      </nav>
    );
  }
  return (
    <nav className="pagination" aria-label={label}>
      <PageScroll page={current} />
      {current > 1 ? (
        <Link className="link-arrow" href={hrefFor(current - 1)} rel="prev" scroll={false}>
          {t('previous')}
        </Link>
      ) : (
        <span />
      )}
      <span className="meta num">{t('status', { current, last })}</span>
      {current < last ? (
        <Link className="link-arrow" href={hrefFor(current + 1)} rel="next" scroll={false}>
          {t('next')}
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
