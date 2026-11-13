import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Fragment, type ReactNode } from 'react';
import { CollectionsSection } from '@/components/home/CollectionsSection';
import { DesignersSection } from '@/components/home/DesignersSection';
import { FactorySection } from '@/components/home/FactorySection';
import { FeatureSection } from '@/components/home/FeatureSection';
import { HeroCarousel } from '@/components/home/HeroCarousel';
import { HeroSection } from '@/components/home/HeroSection';
import { LaunchesSection } from '@/components/home/LaunchesSection';
import { LinesSection } from '@/components/home/LinesSection';
import { PlannerTeaser } from '@/components/home/PlannerTeaser';
import { ProjectsSection } from '@/components/home/ProjectsSection';
import { ScenesSection } from '@/components/home/ScenesSection';
import { StoresSection } from '@/components/home/StoresSection';
import { TechnicalTeaser } from '@/components/home/TechnicalTeaser';
import { alternateTones, type Tone } from '@/components/home/tone';
import type { Locale } from '@/i18n/config';
import { getAreas, getProductDetails, getProducts } from '@/lib/api/catalog';
import {
  getCollections,
  getDesigners,
  getHome,
  getImagePoints,
  getPage,
  getProjects,
  getScenes,
  getSettings,
  getStores,
} from '@/lib/api/content';
import { emptyPage } from '@/lib/api/empty';
import type { ProductCard } from '@/lib/api/types';
import { toTechnicalRow } from '@/lib/catalog/technical';
import { pickPoints } from '@/lib/scenes/image-points';
import { buildMetadata } from '@/lib/seo/metadata';

type Props = { params: Promise<{ locale: string }> };

const TECHNICAL_ROWS = 5;
const LAUNCH_PRODUCTS = 12;
const PROJECTS = 6;

/**
 * Um bloco da home depois do banner. `bleed`: faixa de foto em largura total (sem fundo próprio, fora da alternância
 * de tons); os outros recebem o tom na ordem em que aparecem (branco, areia, branco...).
 */
type HomeBlock = { key: string; bleed?: boolean; render: (tone: Tone) => ReactNode };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'home.meta' });
  return buildMetadata({
    locale: locale as Locale,
    href: { pathname: '/' },
    title: t('title'),
    description: t('description'),
  });
}

export default async function HomePage({ params }: Props) {
  const { locale: raw } = await params;
  const locale = raw as Locale;
  setRequestLocale(locale);

  const [home, areas, designers, factory, storeList, settings, scenes, projectPage, imagePoints] =
    await Promise.all([
      getHome(locale),
      getAreas(locale),
      getDesigners(locale),
      getPage(locale, 'factory'),
      getStores(locale),
      getSettings(locale),
      getScenes(locale),
      getProjects(locale, { per_page: PROJECTS }),
      getImagePoints(locale),
    ]);
  // Pontos clicáveis sobre as fotos dos banners (retorno de 13/11/2026).
  const bannerPoints = pickPoints(
    imagePoints,
    home.banners.map((banner) => banner.image),
  );
  const launch = home.current_launch;
  const [launchPage, featured, allCollections] = await Promise.all([
    launch
      ? getProducts(locale, { launch: launch.slug, per_page: LAUNCH_PRODUCTS })
      : Promise.resolve(emptyPage<ProductCard>()),
    getProductDetails(
      locale,
      home.featured_products.slice(0, TECHNICAL_ROWS).map((product) => product.slug),
    ),
    // As coleções em destaque da home; sem destaque marcado no painel, as coleções publicadas.
    home.featured_collections.length > 0
      ? Promise.resolve(home.featured_collections)
      : getCollections(locale),
  ]);
  const feature = featured[0] ?? null;
  const brandNames = areas.map((area) => area.brand_name);
  const collections = allCollections.filter((collection) => collection.cover);
  const projects = projectPage.data.filter((project) => project.cover);

  // Ordem da home depois do banner. Cada bloco some sem dado (Lei de Tesler); o tom é dado depois, só aos que ficam.
  const blocks: HomeBlock[] = [];
  if (launch && launchPage.data.length > 0) {
    blocks.push({
      key: 'launches',
      render: (tone) => <LaunchesSection launch={launch} products={launchPage.data} tone={tone} />,
    });
  }
  if (areas.length > 0)
    blocks.push({ key: 'lines', bleed: true, render: () => <LinesSection areas={areas} /> });
  if (collections.length > 0) {
    blocks.push({
      key: 'collections',
      render: (tone) => <CollectionsSection collections={collections} tone={tone} />,
    });
  }
  if (scenes.length > 0) {
    blocks.push({ key: 'scenes', render: (tone) => <ScenesSection scenes={scenes} tone={tone} /> });
  }
  if (feature)
    blocks.push({ key: 'feature', render: (tone) => <FeatureSection product={feature} tone={tone} /> });
  if (projects.length > 0) {
    blocks.push({ key: 'projects', render: (tone) => <ProjectsSection projects={projects} tone={tone} /> });
  }
  blocks.push({ key: 'planner', render: (tone) => <PlannerTeaser tone={tone} /> });
  if (home.designers.length > 0) {
    blocks.push({
      key: 'designers',
      render: (tone) => <DesignersSection designers={home.designers} tone={tone} />,
    });
  }
  if (factory) {
    blocks.push({
      key: 'factory',
      bleed: Boolean(factory.cover),
      render: (tone) => <FactorySection page={factory} tone={tone} />,
    });
  }
  if (featured.length > 0) {
    blocks.push({
      key: 'technical',
      render: (tone) => <TechnicalTeaser rows={featured.map(toTechnicalRow)} tone={tone} />,
    });
  }
  // A home abre no estado com mais lojas (a lista ao lado do texto fica cheia, não com uma loja só); empate mantém a
  // ordem da API.
  const storeCount = (state: string) => storeList.stores.filter((store) => store.state === state).length;
  const statesByStoreCount = [...storeList.states].sort((a, b) => storeCount(b) - storeCount(a));
  if (storeList.stores.length > 0) {
    blocks.push({
      key: 'stores',
      render: (tone) => (
        <StoresSection
          stores={storeList.stores}
          states={statesByStoreCount}
          whatsapp={settings.quotes_whatsapp}
          tone={tone}
        />
      ),
    });
  }
  const tones = alternateTones(blocks.length);
  // Posição de cada bloco com fundo entre os blocos com fundo (as faixas de foto não contam).
  const toneOf = (index: number): Tone =>
    tones[blocks.slice(0, index).filter((block) => !block.bleed).length] ?? 'paper';

  const [lead, ...rest] = blocks;
  const hero =
    home.banners.length > 1 ? (
      <HeroCarousel>
        {home.banners.map((banner, index) => (
          <HeroSection
            key={index}
            index={index}
            banner={banner}
            brandNames={brandNames}
            designerCount={designers.length}
            points={banner.image ? bannerPoints[banner.image.id] : null}
          />
        ))}
      </HeroCarousel>
    ) : (
      <HeroSection
        banner={home.banners[0] ?? null}
        brandNames={brandNames}
        designerCount={designers.length}
        points={home.banners[0]?.image ? bannerPoints[home.banners[0].image.id] : null}
      />
    );

  // O banner fica parado só atrás da primeira seção, que sobe por cima dele: os dois vão juntos em `.home__lead`, e o
  // `sticky` não passa do fim dela (retorno do tech lead de 06/11/2026: o banner aparecia atrás das seções seguintes
  // enquanto as fotos delas carregavam).
  return (
    <main className="home">
      <div className="home__lead">
        {hero}
        {lead ? lead.render(toneOf(0)) : null}
      </div>
      {rest.map((block, index) => (
        <Fragment key={block.key}>{block.render(toneOf(index + 1))}</Fragment>
      ))}
    </main>
  );
}
