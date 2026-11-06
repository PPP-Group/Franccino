import type { CSSProperties } from 'react';
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { EmptyNotice } from '@/components/content/EmptyNotice';
import { firstWithCover, missingCells } from '@/components/content/layout';
import { Tile } from '@/components/content/Tile';
import { PageHead } from '@/components/layout/PageHead';
import { FeaturePiece } from '@/components/products/FeaturePiece';
import type { Locale } from '@/i18n/config';
import { Link } from '@/i18n/navigation';
import { getDesigners, getHome } from '@/lib/api/content';
import { buildMetadata } from '@/lib/seo/metadata';

/** Qual destaque da home esta página mostra (cada página de lista mostra um diferente). */
const FEATURE_OFFSET = 1;

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'designers' });
  return buildMetadata({
    locale: locale as Locale,
    href: { pathname: '/designers' },
    title: t('title'),
    description: t('description'),
  });
}

export default async function DesignersPage({ params }: Props) {
  const { locale: raw } = await params;
  const locale = raw as Locale;
  setRequestLocale(locale);
  const [t, common, designers, home] = await Promise.all([
    getTranslations({ locale, namespace: 'designers' }),
    getTranslations({ locale, namespace: 'common' }),
    getDesigners(locale),
    getHome(locale),
  ]);
  // Um destaque da home à direita do título (nada de metade vazia), diferente do das outras páginas de lista.
  const feature = firstWithCover([home.featured_products.slice(FEATURE_OFFSET), home.featured_products]);
  // Grade sempre completa (rodada 3): 4 colunas no computador e 2 no tablet; o que faltar na última linha vira uma
  // chamada para as coleções, do tamanho das células vazias.
  const fillWide = missingCells(designers.length, 4);
  const fillNarrow = missingCells(designers.length, 2);
  return (
    <main className="wrap page-end">
      <PageHead
        title={t('title')}
        lead={t('description')}
        meta={<p className="meta num">{t('count', { count: designers.length })}</p>}
        aside={feature ? <FeaturePiece product={feature} compact /> : null}
      >
        {feature ? <p className="meta num">{t('count', { count: designers.length })}</p> : null}
      </PageHead>
      {designers.length === 0 ? (
        <EmptyNotice text={common('nothingYet')} />
      ) : (
        <div className="tiles tiles--four" data-reveal="stagger">
          {designers.map((designer, index) => (
            <Tile
              key={designer.id}
              href={{ pathname: '/designers/[slug]', params: { slug: designer.slug } }}
              title={designer.name}
              image={designer.portrait}
              meta={designer.location ? [designer.location] : []}
              text={designer.short_bio}
              portrait
              priority={index < 4}
              sizes="(max-width: 35rem) 100vw, (max-width: 56.25rem) 50vw, 25vw"
            />
          ))}
          {fillWide > 0 || fillNarrow > 0 ? (
            <Link
              className="tile-fill"
              href="/collections"
              data-wide={fillWide}
              data-narrow={fillNarrow}
              style={{ '--fill-wide': fillWide || 1, '--fill-narrow': fillNarrow || 1 } as CSSProperties}
            >
              <h2 className="tile-fill__title">{t('fillTitle')}</h2>
              <span className="link-arrow">{t('fillCta')}</span>
            </Link>
          ) : null}
        </div>
      )}
    </main>
  );
}
