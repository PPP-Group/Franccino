'use client';

import { Children, useEffect, useState, type ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { CAROUSEL_INTERVAL_MS, shouldAutoplay, wrapIndex } from '@/lib/ui/carousel';
import { useReducedMotion } from '@/lib/ui/use-reduced-motion';

/**
 * Carrossel dos banners da home (Anexo I: banner principal em carrossel). Os slides chegam prontos do
 * servidor (`HeroSection`); aqui só se escolhe qual aparece, a cada 7 s. Rodada 3 (06/11/2026): os slides ficam
 * empilhados na mesma caixa e trocam por fusão (o que sai some enquanto o que entra aparece); a foto do slide ativo
 * aproxima devagar enquanto ele está na tela (home.css). Os slides fora da tela ficam `inert` e escondidos do leitor.
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
  // `previous`: o slide que acabou de sair continua com a foto aproximada durante a fusão (sem pulo no zoom).
  const [{ active, previous }, setSlides] = useState<{ active: number; previous: number | null }>({
    active: 0,
    previous: null,
  });
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const reducedMotion = useReducedMotion();
  const autoplay = shouldAutoplay(total, paused || hovered, reducedMotion);

  useEffect(() => {
    if (!autoplay) return;
    const timer = window.setInterval(() => {
      setSlides((current) => ({ active: wrapIndex(current.active + 1, total), previous: current.active }));
    }, CAROUSEL_INTERVAL_MS);
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
      {slides.map((slide, index) => {
        const isActive = index === active;
        const classes = ['hero-carousel__slide'];
        if (isActive) classes.push('is-active');
        else if (index === previous) classes.push('is-prev');
        return (
          <div
            key={index}
            className={classes.join(' ')}
            role="group"
            aria-roledescription={t('slideRoleDescription')}
            aria-label={t('slide', { current: index + 1, total })}
            aria-hidden={isActive ? undefined : true}
            inert={!isActive}
          >
            {slide}
          </div>
        );
      })}
    </section>
  );
}
