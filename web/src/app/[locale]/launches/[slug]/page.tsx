import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import type { SearchParams } from '@/components/catalog/area-pages';
import { ProductGrid } from '@/components/catalog/ProductGrid';
import { TechTable } from '@/components/catalog/TechTable';
import { ViewToggle } from '@/components/catalog/ViewToggle';
import { firstWithCover } from '@/components/content/layout';
import { RichText } from '@/components/content/RichText';
import { FileDownloads } from '@/components/downloads/FileDownloads';
import { MediaLinks } from '@/components/media/MediaLinks';
import { FeaturePiece } from '@/components/products/FeaturePiece';
import { RecentlyViewed } from '@/components/recent/RecentlyViewed';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import type { Locale } from '@/i18n/config';
import { getProductDetails } from '@/lib/api/catalog';
import { getLaunch, getLaunches } from '@/lib/api/content';
import { toTechnicalRow } from '@/lib/catalog/technical';
import { parseCatalogView } from '@/lib/catalog/view';
import { alternateHrefs, buildMetadata } from '@/lib/seo/metadata';

/** Peças da primeira linha da grade (3 colunas no desktop). */
const FIRST_ROW = 3;

type Props = { params: Promise<{ locale: string; slug: string }>; searchParams: Promise<SearchParams> };

const launchHref = (slug: string) => ({ pathname: '/launches/[slug]', params: { slug } }) as const;

export async function generateStaticParams({ params }: { params: { locale: string } }) {
  const launches = await getLaunches(params.locale as Locale);
  return launches.map((launch) => ({ slug: launch.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const launch = await getLaunch(locale as Locale, slug);
  if (!launch) {
    return {};
  }
  return buildMetadata({
    locale: locale as Locale,
    href: launchHref(slug),
    title: launch.seo.title ?? launch.title,
    description: launch.seo.description ?? launch.summary,
    image: launch.seo.image ?? launch.cover,
    alternates: alternateHrefs(launch.slugs, launchHref),
  });
}

export default async function LaunchPage({ params, searchParams }: Props) {
  const { locale: raw, slug } = await params;
  const locale = raw as Locale;
  setRequestLocale(locale);
  const launch = await getLaunch(locale, slug);
  if (!launch) {
    notFound();
  }
  const view = parseCatalogView((await searchParams).view);
  const [t, common] = await Promise.all([
    getTranslations({ locale, namespace: 'catalog' }),
    getTranslations({ locale, namespace: 'common' }),
  ]);
  const year = launch.year && !launch.title.includes(String(launch.year)) ? launch.year : null;
  // A peça em destaque não repete a primeira linha da grade logo abaixo (quando houver outras).
  const feature = launch.description
    ? firstWithCover([launch.products.slice(FIRST_ROW), launch.products])
    : null;
  const rows =
    view === 'table'
      ? (
          await getProductDetails(
            locale,
            launch.products.map((product) => product.slug),
          )
        ).map(toTechnicalRow)
      : [];

  return (
    <main>
      <div className="wrap catalog">
        <Breadcrumbs
          label={common('breadcrumb')}
          items={[
            { label: common('home'), href: '/' },
            { label: t('launches.title'), href: '/launches' },
            { label: launch.title },
          ]}
        />
        {/*
          Com texto, a direita mostra uma peça do lançamento em foto grande (retorno do tech lead de 06/11/2026: o texto
          ficava sozinho à esquerda). O ano só aparece quando o título não o traz ("Lançamentos 2026" já diz o ano).
        */}
        <div className={feature ? 'catalog-head catalog-head--split' : 'catalog-head'}>
          <div className="catalog-head__copy">
            <h1>{launch.title}</h1>
            {launch.summary ? <p className="lead">{launch.summary}</p> : null}
            {feature && year ? <p className="meta num">{year}</p> : null}
            {feature && launch.description ? <RichText html={launch.description} className="prose" /> : null}
          </div>
          {feature ? <FeaturePiece product={feature} /> : year ? <p className="meta num">{year}</p> : null}
        </div>
        {!feature && launch.description ? (
          <RichText html={launch.description} className="prose catalog-description" />
        ) : null}
        <div className="toolbar">
          <p className="meta num">{t('count', { count: launch.products.length })}</p>
          <ViewToggle
            view={view}
            hrefFor={(next) => ({ ...launchHref(slug), query: next === 'table' ? { view: 'table' } : {} })}
          />
        </div>
        <section className="catalog-results" aria-label={t('resultsLabel')}>
          {view === 'table' ? (
            <TechTable rows={rows} />
          ) : (
            // Toda peça aqui é lançamento: sem o rótulo no card (lei de Tesler).
            <ProductGrid products={launch.products} priorityCount={3} />
          )}
        </section>
        {/* Arquivos e vídeos depois das peças, como na página Lançamentos. */}
        <FileDownloads
          files={launch.files}
          title={t('launches.downloads')}
          headingId="launch-downloads"
          className="media-links--wide block"
        />
        <MediaLinks items={launch.media_links} headingId="launch-media" className="media-links--wide block" />
      </div>
      <RecentlyViewed excludeIds={launch.products.map((product) => product.id)} />
    </main>
  );
}
