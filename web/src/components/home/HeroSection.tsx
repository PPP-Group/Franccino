import { useTranslations } from 'next-intl';
import { ApiImage } from '@/components/media/ApiImage';
import { Icon } from '@/components/ui/Icon';
import { Link } from '@/i18n/navigation';
import type { Banner } from '@/lib/api/types';
import { buildSrcSet } from '@/lib/images/srcset';

type HeroSectionProps = {
  banner: Banner | null;
  brandNames: string[];
  designerCount: number;
  /** Posição no carrossel: só o primeiro slide tem `h1` e imagem com prioridade (LCP). */
  index?: number;
};

/**
 * Hero do primeiro banner. Todos os campos do banner podem vir `null` (R19): sem imagem de desktop
 * vira a placa sem foto, e texto ausente não é inventado (o título cai no `fallbackTitle` da placa).
 */
export function HeroSection({ banner, brandNames, designerCount, index = 0 }: HeroSectionProps) {
  const t = useTranslations('home.hero');
  const photo = banner?.image ?? null;
  const hasMeta = brandNames.length > 0 || designerCount > 0;
  const first = index === 0;
  const titleId = first ? 'hero-title' : `hero-title-${index + 1}`;
  const Heading = first ? 'h1' : 'h2';
  return (
    <section className={photo ? 'hero' : 'hero hero--plain'} aria-labelledby={titleId}>
      {photo ? (
        <picture className="hero__picture">
          {banner?.image_mobile ? (
            <source media="(max-width: 47.99rem)" srcSet={buildSrcSet(banner.image_mobile)} sizes="100vw" />
          ) : null}
          <ApiImage image={photo} sizes="100vw" priority={first} className="hero__img" />
        </picture>
      ) : null}
      <div className="hero__plate">
        <Heading className="display" id={titleId}>
          {banner?.title ?? t('fallbackTitle')}
        </Heading>
        {banner?.subtitle ? <p className="lead">{banner.subtitle}</p> : null}
        <div className="hero__actions">
          {banner?.cta_label && banner.cta_url ? (
            <a className="btn" href={banner.cta_url}>
              {banner.cta_label}
            </a>
          ) : (
            <Link className="btn" href="/products">
              {t('catalog')}
            </Link>
          )}
          <Link className="btn btn--ghost" href="/room-planner">
            <Icon name="ruler" />
            <span>{t('planner')}</span>
          </Link>
        </div>
        {hasMeta ? (
          <ul className="meta hero__meta">
            {brandNames.map((name) => (
              <li key={name}>{name}</li>
            ))}
            {designerCount > 0 ? <li>{t('designers', { count: designerCount })}</li> : null}
          </ul>
        ) : null}
      </div>
    </section>
  );
}
