import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Fragment, type ReactNode } from 'react';
import { CollectionsSection } from '@/components/home/CollectionsSection';
import { DesignersSection } from '@/components/home/DesignersSection';
import { FactorySection } from '@/components/home/FactorySection';
import { HeroCarousel } from '@/components/home/HeroCarousel';
import { HeroSection } from '@/components/home/HeroSection';
import { LaunchesSection } from '@/components/home/LaunchesSection';
import { LinesSection } from '@/components/home/LinesSection';
import { PlannerTeaser } from '@/components/home/PlannerTeaser';
import { ROOM_PLANNER_ENABLED } from '@/lib/features';
import { ProjectsSection } from '@/components/home/ProjectsSection';
import { ScenesSection } from '@/components/home/ScenesSection';
import { alternateTones, type Tone } from '@/components/home/tone';
import type { Locale } from '@/i18n/config';
import { getAreas, getProducts } from '@/lib/api/catalog';
import { getCollections, getDesigners, getHome, getPage, getProjects, getScenes } from '@/lib/api/content';
import { emptyPage } from '@/lib/api/empty';
import type { ProductCard } from '@/lib/api/types';
import { buildMetadata } from '@/lib/seo/metadata';

type Props = { params: Promise<{ locale: string }> };

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

  const [home, areas, designers, factory, scenes, projectPage] = await Promise.all([
    getHome(locale),
    getAreas(locale),
    getDesigners(locale),
    getPage(locale, 'factory'),
    getScenes(locale),
    getProjects(locale, { per_page: PROJECTS }),
  ]);
  const launch = home.current_launch;
  const [launchPage, allCollections] = await Promise.all([
    launch
      ? getProducts(locale, { launch: launch.slug, per_page: LAUNCH_PRODUCTS })
      : Promise.resolve(emptyPage<ProductCard>()),
    // As coleções em destaque da home; sem destaque marcado no painel, as coleções publicadas.
    home.featured_collections.length > 0
      ? Promise.resolve(home.featured_collections)
      : getCollections(locale),
  ]);
  const brandNames = areas.map((area) => area.brand_name);
  const collections = allCollections.filter((collection) => collection.cover);
  const projects = projectPage.data.filter((project) => project.cover);

  // Ordem da home depois do banner ("Alterações site", Franccino, 18/11/2026: a home estava enorme). Lançamentos, logo
  // depois os designers (o diferencial da marca), as áreas, as coleções, os ambientes, o Corporativo e a Fábrica. Saíram
  // a peça avulsa, os blocos técnicos (agora no menu, Área do Profissional), as lojas (no menu) e a Sala para montar.
  // Cada bloco some sem dado (Lei de Tesler); o tom é dado depois, só aos que ficam.
  const blocks: HomeBlock[] = [];
  if (launch && launchPage.data.length > 0) {
    blocks.push({
      key: 'launches',
      render: (tone) => <LaunchesSection launch={launch} products={launchPage.data} tone={tone} />,
    });
  }
  if (home.designers.length > 0) {
    blocks.push({
      key: 'designers',
      render: (tone) => <DesignersSection designers={home.designers} tone={tone} />,
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
  if (projects.length > 0) {
    blocks.push({ key: 'projects', render: (tone) => <ProjectsSection projects={projects} tone={tone} /> });
  }
  // Sala para montar desligada (reunião de 18/11/2026, `lib/features.ts`).
  if (ROOM_PLANNER_ENABLED) blocks.push({ key: 'planner', render: (tone) => <PlannerTeaser tone={tone} /> });
  if (factory) {
    blocks.push({
      key: 'factory',
      bleed: Boolean(factory.cover),
      render: (tone) => <FactorySection page={factory} tone={tone} />,
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
          />
        ))}
      </HeroCarousel>
    ) : (
      <HeroSection
        banner={home.banners[0] ?? null}
        brandNames={brandNames}
        designerCount={designers.length}
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
