'use client';

import { Children, useEffect, useState, useSyncExternalStore, type ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { Icon } from '@/components/ui/Icon';
import { CAROUSEL_INTERVAL_MS, shouldAutoplay, wrapIndex } from '@/lib/ui/carousel';

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';

function subscribeReducedMotion(onChange: () => void) {
  const query = window.matchMedia(REDUCED_MOTION);
  query.addEventListener('change', onChange);
  return () => query.removeEventListener('change', onChange);
}

/** `true` no servidor: nada gira antes da hidratação, e quem pediu menos movimento nunca vê girar. */
function useReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(REDUCED_MOTION).matches,
    () => true,
  );
}

/**
 * Carrossel dos banners da home (Anexo I: banner principal em carrossel). Os slides chegam prontos do
 * servidor (`HeroSection`); aqui só se escolhe qual aparece. Gira sozinho a cada 7 s, pausa no foco,
 * no hover e no botão, e respeita `prefers-reduced-motion`.
 */
export function HeroCarousel({ children }: { children: ReactNode }) {
  const t = useTranslations('home.hero.carousel');
  const slides = Children.toArray(children);
  const total = slides.length;
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const reducedMotion = useReducedMotion();
  const autoplay = shouldAutoplay(total, paused || hovered, reducedMotion);

  useEffect(() => {
    if (!autoplay) return;
    const timer = window.setInterval(
      () => setActive((index) => wrapIndex(index + 1, total)),
      CAROUSEL_INTERVAL_MS,
    );
    return () => window.clearInterval(timer);
  }, [autoplay, total]);

  if (total <= 1) return <>{slides}</>;

  return (
    <section
      className="hero-carousel"
      aria-roledescription={t('roleDescription')}
      aria-label={t('label')}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
    >
      {slides.map((slide, index) => (
        <div
          key={index}
          className="hero-carousel__slide"
          role="group"
          aria-roledescription={t('slideRoleDescription')}
          aria-label={t('slide', { current: index + 1, total })}
          hidden={index !== active}
        >
          {slide}
        </div>
      ))}
      <div className="hero-carousel__controls">
        <button
          type="button"
          className="hero-carousel__button"
          aria-label={paused ? t('play') : t('pause')}
          onClick={() => setPaused((value) => !value)}
        >
          <Icon name={paused ? 'play' : 'pause'} />
        </button>
        <button
          type="button"
          className="hero-carousel__button hero-carousel__button--previous"
          aria-label={t('previous')}
          onClick={() => setActive((index) => wrapIndex(index - 1, total))}
        >
          <Icon name="arrow" />
        </button>
        <ol className="hero-carousel__dots">
          {slides.map((_, index) => (
            <li key={index}>
              <button
                type="button"
                className="hero-carousel__dot"
                aria-label={t('goTo', { current: index + 1, total })}
                aria-current={index === active ? 'true' : undefined}
                onClick={() => setActive(index)}
              />
            </li>
          ))}
        </ol>
        <button
          type="button"
          className="hero-carousel__button"
          aria-label={t('next')}
          onClick={() => setActive((index) => wrapIndex(index + 1, total))}
        >
          <Icon name="arrow" />
        </button>
      </div>
    </section>
  );
}
