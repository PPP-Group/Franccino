import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { DesignersSection } from '@/components/home/DesignersSection';
import { FactorySection } from '@/components/home/FactorySection';
import { FeatureSection } from '@/components/home/FeatureSection';
import { HeroSection } from '@/components/home/HeroSection';
import { LaunchesSection } from '@/components/home/LaunchesSection';
import { LinesSection } from '@/components/home/LinesSection';
import { PlannerTeaser } from '@/components/home/PlannerTeaser';
import { StoresSection } from '@/components/home/StoresSection';
import { TechnicalTeaser } from '@/components/home/TechnicalTeaser';
import type { Locale } from '@/i18n/config';
import { getAreas, getProductDetails, getProducts } from '@/lib/api/catalog';
import { getDesigners, getHome, getPage, getSettings, getStores } from '@/lib/api/content';
import { emptyPage } from '@/lib/api/empty';
import type { ProductCard } from '@/lib/api/types';
import { toTechnicalRow } from '@/lib/catalog/technical';
import { buildMetadata } from '@/lib/seo/metadata';

type Props = { params: Promise<{ locale: string }> };

const TECHNICAL_ROWS = 5;
const LAUNCH_PRODUCTS = 12;

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

  const [home, areas, designers, factory, storeList, settings] = await Promise.all([
    getHome(locale),
    getAreas(locale),
    getDesigners(locale),
    getPage(locale, 'factory'),
    getStores(locale),
    getSettings(locale),
  ]);
  const launch = home.current_launch;
  const [launchPage, featured] = await Promise.all([
    launch
      ? getProducts(locale, { launch: launch.slug, per_page: LAUNCH_PRODUCTS })
      : Promise.resolve(emptyPage<ProductCard>()),
    getProductDetails(
      locale,
      home.featured_products.slice(0, TECHNICAL_ROWS).map((product) => product.slug),
    ),
  ]);
  const feature = featured[0] ?? null;

  return (
    <main>
      <HeroSection
        banner={home.banners[0] ?? null}
        brandNames={areas.map((area) => area.brand_name)}
        designerCount={designers.length}
      />
      {launch && launchPage.data.length > 0 ? (
        <LaunchesSection launch={launch} products={launchPage.data} />
      ) : null}
      {areas.length > 0 ? <LinesSection areas={areas} /> : null}
      {feature ? <FeatureSection product={feature} /> : null}
      <PlannerTeaser />
      {home.designers.length > 0 ? <DesignersSection designers={home.designers} /> : null}
      {factory ? <FactorySection page={factory} /> : null}
      {featured.length > 0 ? <TechnicalTeaser rows={featured.map(toTechnicalRow)} /> : null}
      {storeList.stores.length > 0 ? (
        <StoresSection
          stores={storeList.stores}
          states={storeList.states}
          whatsapp={settings.quotes_whatsapp}
        />
      ) : null}
    </main>
  );
}
