import { useTranslations } from 'next-intl';
import { ProductRail } from '@/components/products/ProductRail';
import { Icon } from '@/components/ui/Icon';
import { Link } from '@/i18n/navigation';
import type { LaunchCard, ProductCard } from '@/lib/api/types';
import { sectionClass, type Tone } from './tone';

type LaunchesSectionProps = { launch: LaunchCard; products: ProductCard[]; tone: Tone };

export function LaunchesSection({ launch, products, tone }: LaunchesSectionProps) {
  const t = useTranslations('home.launches');
  return (
    <section className={sectionClass(tone)} aria-labelledby="launches-title">
      <div className="wrap">
        <div className="section-head" data-reveal="">
          <div>
            <h2 id="launches-title">{t('title')}</h2>
            <p className="lead">{launch.summary ?? launch.title}</p>
          </div>
          <Link className="link-arrow" href={{ pathname: '/launches/[slug]', params: { slug: launch.slug } }}>
            <span>{t('viewAll')}</span>
            <Icon name="arrow" />
          </Link>
        </div>
        <div data-reveal="">
          <ProductRail label={launch.title} products={products} />
        </div>
      </div>
    </section>
  );
}
