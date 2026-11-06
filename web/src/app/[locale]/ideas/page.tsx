import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { FinishZoom } from '@/components/catalog/FinishZoom';
import { ProductGrid } from '@/components/catalog/ProductGrid';
import { CollectionTile } from '@/components/content/CollectionTile';
import { FeatureSection } from '@/components/home/FeatureSection';
import { HeroSection } from '@/components/home/HeroSection';
import { SceneViewer } from '@/components/home/SceneViewer';
import { IdeaSection } from '@/components/ideas/IdeaSection';
import { FeatureCarousel } from '@/components/products/FeatureCarousel';
import { QuickAddButton } from '@/components/products/QuickAddButton';
import { CountUp } from '@/components/ui/CountUp';
import { Icon } from '@/components/ui/Icon';
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

/** As ideias que ficaram para mais tarde ou foram descartadas no PDF de retorno, na ordem do PDF. */
const OTHER_IDEAS = [
  { key: 'i02', number: '02', decision: 'later' },
  { key: 'i03', number: '03', decision: 'discarded' },
  { key: 'i05', number: '05', decision: 'later' },
  { key: 'i06', number: '06', decision: 'discarded' },
  { key: 'i08', number: '08', decision: 'later' },
  { key: 'i11', number: '11', decision: 'discarded' },
  { key: 'i14', number: '14', decision: 'discarded' },
] as const;

/**
 * Prévia do banco de ideias com a numeração e as decisões do PDF de retorno da Franccino: cada ideia aprovada
 * funcionando com o conteúdo atual, a situação ("no ar" ou "precisa de conteúdo") e o que falta de material; no fim,
 * as que ficaram para mais tarde ou foram descartadas. Fica fora do menu, do mapa do site e do sitemap, e não é
 * indexada. Onde falta material (ambiente montado), a demonstração usa conteúdo de exemplo, avisado na tela.
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
  const morphProducts =
    launchProducts.length >= 6
      ? launchProducts.slice(-3)
      : home.featured_products.filter((item) => !railIds.has(item.id)).slice(0, 3);
  const featured = (
    await getProductDetails(
      locale,
      home.featured_products.slice(0, 1).map((item) => item.slug),
    )
  )[0];
  // O banner com vídeo, se houver algum cadastrado; senão o primeiro, só com a foto.
  const videoBanner = home.banners.find((item) => item.video) ?? null;
  const addProduct = morphProducts[0] ?? railProducts[0] ?? null;
  const banner = videoBanner ?? home.banners[0] ?? null;
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
        <ul className="ideas__legend">
          <li>
            <span className="label idea__status idea__status--live">{t('status.live')}</span>
            <span>{t('legend.live')}</span>
          </li>
          <li>
            <span className="label idea__status idea__status--waiting">{t('status.waiting')}</span>
            <span>{t('legend.waiting')}</span>
          </li>
        </ul>
      </header>

      <IdeaSection
        number="01"
        title={t('carousel.title')}
        decision="adjusted"
        adjustment={t('carousel.adjustment')}
        description={t('carousel.description')}
        status="live"
      >
        {railProducts.length > 0 ? (
          <div className="wrap">
            <FeatureCarousel label={t('carousel.title')} products={railProducts} />
          </div>
        ) : null}
      </IdeaSection>

      <IdeaSection
        number="04"
        title={t('scroll.title')}
        decision="approved"
        description={t('scroll.description')}
        status="live"
      >
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
        number="07"
        title={t('scenes.title')}
        decision="approved"
        description={t('scenes.description')}
        status={scenes.length > 0 ? 'live' : 'waiting'}
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
        number="09"
        title={t('finish.title')}
        decision="adjusted"
        adjustment={t('finish.adjustment')}
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

      <IdeaSection
        number="10"
        title={t('morph.title')}
        decision="approved"
        description={t('morph.description')}
        status="live"
      >
        {morphProducts.length > 0 ? (
          <div className="wrap">
            <ProductGrid products={morphProducts} />
          </div>
        ) : null}
      </IdeaSection>

      <IdeaSection
        number="12"
        title={t('micro.title')}
        decision="adjusted"
        adjustment={t('micro.adjustment')}
        description={t('micro.description')}
        status="live"
      >
        <ul className="wrap micro-demos">
          <li className="micro-demo">
            <p className="label micro-demo__letter">{t('micro.letter', { letter: 'a' })}</p>
            <h3>{t('micro.arrow.title')}</h3>
            <p className="meta">{t('micro.arrow.body')}</p>
            <div className="micro-demo__stage">
              <Link className="btn btn--ghost" href="/products">
                <span>{t('micro.arrow.button')}</span>
                <Icon name="arrow" />
              </Link>
              <Link className="link-arrow" href="/collections">
                <span>{t('micro.arrow.link')}</span>
                <Icon name="arrow" />
              </Link>
            </div>
          </li>
          <li className="micro-demo">
            <p className="label micro-demo__letter">{t('micro.letter', { letter: 'b' })}</p>
            <h3>{t('micro.underline.title')}</h3>
            <p className="meta">{t('micro.underline.body')}</p>
            <div className="micro-demo__stage">
              <Link className="link-grow" href="/collections">
                {t('micro.underline.collections')}
              </Link>
              <Link className="link-grow" href="/designers">
                {t('micro.underline.designers')}
              </Link>
              <Link className="link-grow" href="/projects">
                {t('micro.underline.projects')}
              </Link>
            </div>
          </li>
          <li className="micro-demo">
            <p className="label micro-demo__letter">{t('micro.letter', { letter: 'c' })}</p>
            <h3>{t('micro.drag.title')}</h3>
            <p className="meta">{t('micro.drag.body')}</p>
          </li>
          <li className="micro-demo">
            <p className="label micro-demo__letter">{t('micro.letter', { letter: 'd' })}</p>
            <h3>{t('micro.added.title')}</h3>
            <p className="meta">{t('micro.added.body')}</p>
            {addProduct ? (
              <div className="micro-demo__stage">
                <QuickAddButton product={addProduct} variant="button" />
              </div>
            ) : null}
          </li>
          <li className="micro-demo">
            <p className="label micro-demo__letter">{t('micro.letter', { letter: 'e' })}</p>
            <h3>{t('micro.count.title')}</h3>
            <p className="meta">{t('micro.count.body')}</p>
            <dl className="micro-demo__stage micro-demo__stats">
              <div>
                <dt className="num">
                  <CountUp value={String(catalog.meta.total)} />
                </dt>
                <dd className="meta">{t('micro.count.products')}</dd>
              </div>
              <div>
                <dt className="num">
                  <CountUp value={String(collections.length)} />
                </dt>
                <dd className="meta">{t('micro.count.collections')}</dd>
              </div>
              <div>
                <dt className="num">
                  <CountUp value={String(designers.length)} />
                </dt>
                <dd className="meta">{t('micro.count.designers')}</dd>
              </div>
            </dl>
          </li>
          <li className="micro-demo">
            <p className="label micro-demo__letter">{t('micro.letter', { letter: 'f' })}</p>
            <h3>{t('micro.loading.title')}</h3>
            <p className="meta">{t('micro.loading.body')}</p>
            <div className="micro-demo__stage micro-demo__skeleton" aria-hidden="true">
              <span className="skeleton micro-demo__skeleton-photo" />
              <span className="skeleton micro-demo__skeleton-line" />
              <span className="skeleton micro-demo__skeleton-line micro-demo__skeleton-line--short" />
            </div>
          </li>
        </ul>
      </IdeaSection>

      <IdeaSection
        number="13"
        title={t('video.title')}
        decision="approved"
        description={t('video.description')}
        status={videoBanner ? 'live' : 'waiting'}
        missing={videoBanner ? null : t('video.missing')}
        note={videoBanner ? null : t('video.note')}
      >
        {banner ? <HeroSection banner={banner} brandNames={[]} designerCount={0} index={1} /> : null}
      </IdeaSection>

      <section className="wrap ideas__others" aria-labelledby="ideas-others">
        <h2 id="ideas-others">{t('others.title')}</h2>
        <p className="lead">{t('others.intro')}</p>
        <ul className="ideas__other-list">
          {OTHER_IDEAS.map((idea) => (
            <li key={idea.key} className="idea-other">
              <span className="label idea__number">{t('number', { number: idea.number })}</span>
              <strong className="idea-other__title">{t(`others.${idea.key}.title`)}</strong>
              <span className={`label idea__decision idea__decision--${idea.decision}`}>
                {t(`decision.${idea.decision}`)}
              </span>
              <p className="meta idea-other__note">{t(`others.${idea.key}.note`)}</p>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
