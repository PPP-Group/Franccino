import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { FinishZoom } from '@/components/catalog/FinishZoom';
import { EmptyNotice } from '@/components/content/EmptyNotice';
import { PageHead } from '@/components/layout/PageHead';
import { Icon } from '@/components/ui/Icon';
import type { Locale } from '@/i18n/config';
import { getFinishes } from '@/lib/api/catalog';
import { getPage } from '@/lib/api/content';
import { buildMetadata } from '@/lib/seo/metadata';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const [t, page] = await Promise.all([
    getTranslations({ locale, namespace: 'finishes' }),
    getPage(locale as Locale, 'finishes'),
  ]);
  return buildMetadata({
    locale: locale as Locale,
    href: { pathname: '/finishes' },
    title: page?.seo.title ?? page?.title ?? t('title'),
    description: page?.seo.description ?? page?.intro,
    image: page?.seo.image ?? page?.cover,
  });
}

export default async function FinishesPage({ params }: Props) {
  const { locale: raw } = await params;
  const locale = raw as Locale;
  setRequestLocale(locale);
  const [t, common, page, groups] = await Promise.all([
    getTranslations({ locale, namespace: 'finishes' }),
    getTranslations({ locale, namespace: 'common' }),
    getPage(locale, 'finishes'),
    getFinishes(locale),
  ]);
  const total = groups.reduce((sum, group) => sum + group.items.length, 0);
  return (
    <main className="wrap">
      <PageHead
        title={page?.title ?? t('title')}
        lead={page?.intro}
        meta={total > 0 ? <p className="meta num">{t('count', { count: total })}</p> : null}
      />
      {groups.length === 0 ? (
        <EmptyNotice text={common('nothingYet')} />
      ) : (
        // Cada grupo (Madeiras, Tecidos...) abre ali mesmo, embaixo do nome (reunião com a Franccino, 18/11/2026: com
        // dezenas de acabamentos por grupo, um embaixo do outro a página não acabava). O primeiro já vem aberto.
        <div className="finish-groups finish-groups--accordion">
          {groups.map((group, index) => (
            <details key={group.id} className="finish-group" open={index === 0}>
              <summary className="finish-group__summary">
                <h2 className="finish-group__name">{group.name}</h2>
                <span className="meta num">{t('count', { count: group.items.length })}</span>
                <Icon name="chevron" className="finish-group__chevron" />
              </summary>
              <ul className="finish-grid">
                {group.items.map((item) => (
                  <li key={item.id} className="finish-card">
                    {item.swatch ? (
                      <FinishZoom
                        name={item.name}
                        code={item.code}
                        description={item.description}
                        swatch={item.swatch}
                      />
                    ) : (
                      <div className="finish-card__swatch">
                        <span className="finish-card__fallback" aria-hidden="true">
                          {item.code ?? item.name.slice(0, 2)}
                        </span>
                      </div>
                    )}
                    <strong>{item.name}</strong>
                    {item.code ? <span className="meta num">{item.code}</span> : null}
                    {item.description ? <p className="meta">{item.description}</p> : null}
                  </li>
                ))}
              </ul>
            </details>
          ))}
        </div>
      )}
    </main>
  );
}
