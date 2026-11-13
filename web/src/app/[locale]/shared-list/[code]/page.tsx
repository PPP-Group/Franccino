import type { Metadata } from 'next';
import { getFormatter, getTranslations, setRequestLocale } from 'next-intl/server';
import { ApiImage } from '@/components/media/ApiImage';
import { AddSharedList } from '@/components/quote/AddSharedList';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import type { Locale } from '@/i18n/config';
import { Link } from '@/i18n/navigation';
import { getSharedList } from '@/lib/api/content';
import { buildMetadata } from '@/lib/seo/metadata';

type Props = { params: Promise<{ locale: string; code: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, code } = await params;
  const t = await getTranslations({ locale, namespace: 'sharedList' });
  return buildMetadata({
    locale: locale as Locale,
    href: { pathname: '/shared-list/[code]', params: { code } },
    title: t('title'),
    noindex: true,
  });
}

/**
 * Lista de desejos compartilhada por link (retorno de 12/11/2026): quem recebe o link no WhatsApp ou no e-mail (o
 * cliente ou a equipe de vendas) vê as peças com foto, acabamentos, quantidade e observação, e pode copiar a lista para
 * a própria. Fora da busca (`noindex`) e sempre lida na hora (sem cache).
 */
export default async function SharedListPage({ params }: Props) {
  const { locale: raw, code } = await params;
  const locale = raw as Locale;
  setRequestLocale(locale);
  const [t, common, format, list] = await Promise.all([
    getTranslations({ locale, namespace: 'sharedList' }),
    getTranslations({ locale, namespace: 'common' }),
    getFormatter({ locale }),
    getSharedList(locale, code).catch(() => null),
  ]);

  if (!list || list.items.length === 0) {
    return (
      <main className="wrap quote-page">
        <div className="empty">
          <h1>{t('missing.title')}</h1>
          <p className="lead">{t('missing.body')}</p>
          <div className="empty__actions">
            <Link className="btn" href="/products">
              {t('missing.catalog')}
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const pieces = list.items.reduce((sum, item) => sum + item.quantity, 0);
  return (
    <main className="wrap page-end">
      <Breadcrumbs
        label={common('breadcrumb')}
        items={[{ label: common('home'), href: '/' }, { label: t('title') }]}
      />
      <div className="catalog-head catalog-head--tight">
        <div className="catalog-head__copy">
          <h1>{t('title')}</h1>
          <p className="lead">
            {t('lead', {
              count: pieces,
              date: format.dateTime(new Date(list.expires_at), { dateStyle: 'long' }),
            })}
          </p>
        </div>
        <AddSharedList items={list.items} />
      </div>
      <ul className="shared-list">
        {list.items.map((item, index) => (
          <li key={`${item.product.id}-${index}`} className="shared-list__item">
            <Link
              className="shared-list__media hover-zoom"
              href={{ pathname: '/products/[slug]', params: { slug: item.product.slug } }}
            >
              <ApiImage image={item.product.cover} sizes="(max-width: 48rem) 40vw, 200px" />
            </Link>
            <div className="shared-list__copy">
              <h2 className="shared-list__name">
                <Link href={{ pathname: '/products/[slug]', params: { slug: item.product.slug } }}>
                  {item.product.name}
                </Link>
              </h2>
              <p className="meta">{item.product.category.singular_name}</p>
              <p className="num">{t('quantity', { count: item.quantity })}</p>
              {item.finishes.length > 0 ? (
                <p>
                  {t('finishes', {
                    list: item.finishes
                      .map((finish) => (finish.code ? `${finish.name} (${finish.code})` : finish.name))
                      .join(' · '),
                  })}
                </p>
              ) : null}
              {item.note ? <p className="meta">{t('note', { note: item.note })}</p> : null}
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
