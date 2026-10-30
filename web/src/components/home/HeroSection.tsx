import { useTranslations } from 'next-intl';
import { ApiImage } from '@/components/media/ApiImage';
import { Icon } from '@/components/ui/Icon';
import { Link } from '@/i18n/navigation';
import type { Banner } from '@/lib/api/types';
import { buildSrcSet } from '@/lib/images/srcset';
import { HeroVideo } from './HeroVideo';

type HeroSectionProps = {
  banner: Banner | null;
  brandNames: string[];
  designerCount: number;
  /** Posição no carrossel: só o primeiro slide tem `h1` e imagem com prioridade (LCP). */
  index?: number;
};

/**
 * Banner da home. Todos os campos podem vir `null` (R19).
 *
 * - Com foto (ou vídeo): o site só escreve o que foi cadastrado. Retorno do banco de ideias (26/10/2026, ideias 3 e
 *   14): a arte do banner já traz o texto do marketing, então sem título nada é escrito por cima, nem botão nem
 *   sombra. O título da seção fica só para leitores de tela, e com `cta_url` o banner inteiro vira o link.
 * - Sem foto: a placa branca com o título padrão e os atalhos do catálogo, para a home nunca abrir vazia.
 */
export function HeroSection({ banner, brandNames, designerCount, index = 0 }: HeroSectionProps) {
  const t = useTranslations('home.hero');
  const photo = banner?.image ?? null;
  const first = index === 0;
  const titleId = first ? 'hero-title' : `hero-title-${index + 1}`;
  const Heading = first ? 'h1' : 'h2';

  if (!banner || !photo) {
    return (
      <PlainHero
        banner={banner}
        brandNames={brandNames}
        designerCount={designerCount}
        titleId={titleId}
        heading={Heading}
      />
    );
  }

  const hasText = Boolean(banner.title || banner.subtitle);
  const cta = banner.cta_url ? { url: banner.cta_url, label: banner.cta_label } : null;
  return (
    <section className={hasText ? 'hero' : 'hero hero--clean'} aria-labelledby={titleId}>
      <picture className="hero__picture">
        {banner.image_mobile ? (
          <source media="(max-width: 47.99rem)" srcSet={buildSrcSet(banner.image_mobile)} sizes="100vw" />
        ) : null}
        <ApiImage image={photo} sizes="100vw" priority={first} className="hero__img" />
      </picture>
      {banner.video ? <HeroVideo src={banner.video} /> : null}
      {hasText ? (
        <div className="hero__plate">
          <Heading className={banner.title ? 'display' : 'visually-hidden'} id={titleId}>
            {banner.title ?? t('fallbackTitle')}
          </Heading>
          {banner.subtitle ? <p className="lead">{banner.subtitle}</p> : null}
          {cta?.label ? (
            <div className="hero__actions">
              <a className="btn" href={cta.url}>
                {cta.label}
              </a>
            </div>
          ) : null}
        </div>
      ) : (
        <Heading className="visually-hidden" id={titleId}>
          {t('fallbackTitle')}
        </Heading>
      )}
      {cta && !(hasText && cta.label) ? (
        <a className="hero__link" href={cta.url} aria-label={cta.label ?? (photo.alt || t('open'))} />
      ) : null}
    </section>
  );
}

function PlainHero({
  banner,
  brandNames,
  designerCount,
  titleId,
  heading: Heading,
}: {
  banner: Banner | null;
  brandNames: string[];
  designerCount: number;
  titleId: string;
  heading: 'h1' | 'h2';
}) {
  const t = useTranslations('home.hero');
  const hasMeta = brandNames.length > 0 || designerCount > 0;
  return (
    <section className="hero hero--plain" aria-labelledby={titleId}>
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
