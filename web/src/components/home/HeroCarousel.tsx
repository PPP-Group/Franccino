'use client';

import { Children, useEffect, useState, type ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { CAROUSEL_INTERVAL_MS, shouldAutoplay, wrapIndex } from '@/lib/ui/carousel';
import { useReducedMotion } from '@/lib/ui/use-reduced-motion';

/**
 * Carrossel dos banners da home (Anexo I: banner principal em carrossel). Os slides chegam prontos do
 * servidor (`HeroSection`); aqui só se escolhe qual aparece, com uma troca suave a cada 7 s.
 *
 * Retorno do banco de ideias (26/10/2026, ideia 14): sem setas, pontos nem botão de pausa na tela. A troca para
 * no hover e no foco, nunca acontece para quem pediu menos movimento, e o botão de pausa continua no teclado e no
 * leitor de tela (aparece só com o foco, como o "pular para o conteúdo"), para a troca automática poder ser parada
 * (WCAG 2.2.2).
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
      <button
        type="button"
        className="hero-carousel__pause"
        aria-pressed={paused}
        onClick={() => setPaused((value) => !value)}
      >
        {paused ? t('play') : t('pause')}
      </button>
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
    </section>
  );
}
