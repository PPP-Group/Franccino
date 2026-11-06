import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { FinishZoom } from '@/components/catalog/FinishZoom';
import { ProductGrid } from '@/components/catalog/ProductGrid';
import { CollectionTile } from '@/components/content/CollectionTile';
import { FeatureSection } from '@/components/home/FeatureSection';
import { HeroSection } from '@/components/home/HeroSection';
import { SceneViewer } from '@/components/home/SceneViewer';
import { IdeaSection } from '@/components/ideas/IdeaSection';
import { ProductRail } from '@/components/products/ProductRail';
import { CountUp } from '@/components/ui/CountUp';
import type { Locale } from '@/i18n/config';
import { Link } from '@/i18n/navigation';
import { getFinishes, getProductDetails, getProducts } from '@/lib/api/catalog';
import { getCollections, getDesigners, getHome, getScenes } from '@/lib/api/content';
import type { Scene } from '@/lib/api/types';
import { buildMetadata } from '@/lib/seo/metadata';

type Props = { params: Promise<{ locale: string }> };

/** Posições ilustrativas dos pontos do ambiente de exemplo, quando ainda não há ambiente cadastrado. */
const DEMO_POINTS = [
  { x: 28, y: 64 },
  { x: 52, y: 58 },
  { x: 76, y: 66 },
];

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'ideas' });
  return buildMetadata({
    locale: locale as Locale,
    href: { pathname: '/ideas' },
    title: t('meta.title'),
    description: t('meta.description'),
    noindex: true,
  });
}

/**
 * Prévia das ideias aprovadas no banco de ideias (rodada 2 do design, retorno de 26/10/2026), para a Franccino ver
 * cada uma funcionando com o conteúdo atual, a situação e o que falta de material. Fica fora do menu, do mapa do site e
 * do sitemap, e não é indexada. Onde falta material (ambiente montado), a demonstração usa conteúdo de exemplo,
 * avisado na tela.
 */
export default async function IdeasPage({ params }: Props) {
  const { locale: raw } = await params;
  const locale = raw as Locale;
  setRequestLocale(locale);

  const [t, home, collections, designers, finishGroups, scenes, catalog] = await Promise.all([
    getTranslations({ locale, namespace: 'ideas' }),
    getHome(locale),
    getCollections(locale),
    getDesigners(locale),
    getFinishes(locale),
    getScenes(locale),
    getProducts(locale, { per_page: 1 }),
  ]);
  const launch = home.current_launch;
  const launchProducts = launch
    ? (await getProducts(locale, { launch: launch.slug, per_page: 12 })).data
    : home.featured_products;
  // Cada peça aparece uma vez só na página: a transição da foto (ideia 10) não aceita dois cards com o mesmo nome.
  const railProducts = launchProducts.length >= 6 ? launchProducts.slice(0, -3) : launchProducts;
  const railIds = new Set(railProducts.map((item) => item.id));
  const liftProducts =
    launchProducts.length >= 6
      ? launchProducts.slice(-3)
      : home.featured_products.filter((item) => !railIds.has(item.id)).slice(0, 3);
  const featured = (
    await getProductDetails(
      locale,
      home.featured_products.slice(0, 1).map((item) => item.slug),
    )
  )[0];
  const banner = home.banners[0] ?? null;
  const finishes = finishGroups
    .flatMap((group) => group.items)
    .filter((item) => item.swatch !== null)
    .slice(0, 8);

  // Ambiente cadastrado no painel, ou um exemplo montado com a foto de uma coleção e três peças reais.
  const exampleImage = collections.find((item) => item.cover)?.cover ?? banner?.image ?? null;
  const demoScene: Scene | null =
    scenes[0] ??
    (exampleImage && launchProducts.length >= DEMO_POINTS.length
      ? {
          id: 0,
          title: t('scenes.demoTitle'),
          image: exampleImage,
          hotspots: DEMO_POINTS.map((point, index) => ({ ...point, product: launchProducts[index]! })),
        }
      : null);

  return (
    <main className="ideas">
      <header className="wrap ideas__head">
        <h1>{t('title')}</h1>
        <p className="lead">{t('intro')}</p>
        <ul className="ideas__legend meta-inline">
          <li>
            <span className="label idea__status idea__status--ready">{t('status.ready')}</span>{' '}
            {t('legend.ready')}
          </li>
          <li>
            <span className="label idea__status idea__status--waiting">{t('status.waiting')}</span>{' '}
            {t('legend.waiting')}
          </li>
        </ul>
      </header>

      <IdeaSection number="1" title={t('rail.title')} description={t('rail.description')} status="ready">
        {railProducts.length > 0 ? (
          <div className="wrap">
            <ProductRail label={t('rail.title')} products={railProducts} />
          </div>
        ) : null}
      </IdeaSection>

      <IdeaSection number="2" title={t('lift.title')} description={t('lift.description')} status="ready">
        {liftProducts.length > 0 ? (
          <div className="wrap">
            <ProductGrid products={liftProducts} />
          </div>
        ) : null}
      </IdeaSection>

      <IdeaSection
        number={t('banner.number')}
        title={t('banner.title')}
        description={t('banner.description')}
        status="waiting"
        missing={t('banner.missing')}
      >
        {banner ? <HeroSection banner={banner} brandNames={[]} designerCount={0} index={1} /> : null}
      </IdeaSection>

      <IdeaSection number="4" title={t('scroll.title')} description={t('scroll.description')} status="ready">
        {collections.length > 0 ? (
          <div className="wrap ideas__tiles">
            {collections.slice(0, 2).map((collection) => (
              <CollectionTile key={collection.id} collection={collection} />
            ))}
          </div>
        ) : null}
        {featured ? <FeatureSection product={featured} /> : null}
      </IdeaSection>

      <IdeaSection
        number="5"
        title={t('header.title')}
        description={t('header.description')}
        status="ready"
      />

      <IdeaSection
        number="7"
        title={t('scenes.title')}
        description={t('scenes.description')}
        status={scenes.length > 0 ? 'ready' : 'waiting'}
        missing={scenes.length > 0 ? null : t('scenes.missing')}
        note={scenes.length > 0 ? null : t('scenes.demoNote')}
      >
        {demoScene ? (
          <div className="wrap">
            <SceneViewer scene={demoScene} />
          </div>
        ) : null}
      </IdeaSection>

      <IdeaSection
        number="9"
        title={t('finish.title')}
        description={t('finish.description')}
        status="waiting"
        missing={t('finish.missing')}
      >
        {finishes.length > 0 ? (
          <ul className="wrap finish-grid ideas__finishes">
            {finishes.map((item) => (
              <li key={item.id} className="finish-card">
                <FinishZoom
                  name={item.name}
                  code={item.code}
                  description={item.description}
                  swatch={item.swatch!}
                />
                <strong>{item.name}</strong>
              </li>
            ))}
          </ul>
        ) : null}
      </IdeaSection>

      <IdeaSection number="10" title={t('morph.title')} description={t('morph.description')} status="ready" />

      <IdeaSection
        number="12"
        title={t('micro.title')}
        description={t('micro.description')}
        status="waiting"
        missing={t('micro.missing')}
      >
        <dl className="wrap stats ideas__stats">
          <div>
            <dt className="num">
              <CountUp value={String(catalog.meta.total)} />
            </dt>
            <dd>{t('micro.products')}</dd>
          </div>
          <div>
            <dt className="num">
              <CountUp value={String(collections.length)} />
            </dt>
            <dd>{t('micro.collections')}</dd>
          </div>
          <div>
            <dt className="num">
              <CountUp value={String(designers.length)} />
            </dt>
            <dd>{t('micro.designers')}</dd>
          </div>
        </dl>
      </IdeaSection>

      <IdeaSection
        number="13"
        title={t('collections.title')}
        description={t('collections.description')}
        status="ready"
      >
        <div className="wrap">
          <Link className="link-arrow" href="/collections">
            {t('collections.link')}
          </Link>
        </div>
      </IdeaSection>

      <section className="wrap ideas__later" aria-labelledby="ideas-later">
        <h2 id="ideas-later">{t('later.title')}</h2>
        <ul>
          <li>{t('later.finishPhotos')}</li>
          <li>{t('later.glass')}</li>
          <li>{t('later.discarded')}</li>
        </ul>
      </section>
    </main>
  );
}
