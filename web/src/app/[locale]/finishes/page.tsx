import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { EmptyNotice } from '@/components/content/EmptyNotice';
import { PageHead } from '@/components/layout/PageHead';
import { ApiImage } from '@/components/media/ApiImage';
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
        groups.map((group) => (
          <section key={group.id} className="finish-group" aria-labelledby={`finish-group-${group.id}`}>
            <h2 id={`finish-group-${group.id}`} className="section-title">
              {group.name}
            </h2>
            <ul className="finish-grid">
              {group.items.map((item) => (
                <li key={item.id} className="finish-card">
                  <div className="finish-card__swatch">
                    {item.swatch ? (
                      <ApiImage image={item.swatch} sizes="(max-width: 35rem) 50vw, 180px" />
                    ) : (
                      <span className="finish-card__fallback" aria-hidden="true">
                        {item.code ?? item.name.slice(0, 2)}
                      </span>
                    )}
                  </div>
                  <strong>{item.name}</strong>
                  {item.code ? <span className="meta num">{item.code}</span> : null}
                  {item.description ? <p className="meta">{item.description}</p> : null}
                </li>
              ))}
            </ul>
          </section>
        ))
      )}
    </main>
  );
}
