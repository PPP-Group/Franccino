'use client';

import {
  Children,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type FocusEvent,
  type ReactNode,
} from 'react';
import { useTranslations } from 'next-intl';
import { CAROUSEL_INTERVAL_MS, shouldAutoplay, wrapIndex } from '@/lib/ui/carousel';
import { useReducedMotion } from '@/lib/ui/use-reduced-motion';

/**
 * Carrossel dos banners da home (Anexo I: banner principal em carrossel). Os slides chegam prontos do
 * servidor (`HeroSection`); aqui só se escolhe qual aparece. Rodada 3 (06/11/2026): os slides ficam empilhados na
 * mesma caixa e trocam por fusão; a foto do slide ativo aproxima enquanto ele está na tela (home.css).
 *
 * Retorno de 09/11/2026: a troca não pausa mais com o mouse em cima (o banner ocupa a tela inteira, e a troca quase
 * nunca acontecia); no lugar do traço fino embaixo do título, uma barra por slide, que enche no tempo do slide, e o
 * fim dela troca o slide (a barra e a troca andam juntas). Cada barra leva ao slide dela.
 *
 * Banco de ideias (26/10/2026, ideia 14): sem setas nem botão de pausa na tela. A troca para com o foco do teclado,
 * nunca acontece para quem pediu menos movimento, e o botão de pausa continua no teclado e no leitor de tela (aparece
 * só com o foco), para a troca automática poder ser parada (WCAG 2.2.2).
 */
export function HeroCarousel({ children }: { children: ReactNode }) {
  const t = useTranslations('home.hero.carousel');
  const slides = Children.toArray(children);
  const total = slides.length;
  // `previous`: o slide que acabou de sair continua com a foto aproximada durante a fusão (sem pulo no zoom).
  // `round`: recomeça a barra quando o mesmo slide volta a ficar ativo.
  const [{ active, previous, round }, setSlides] = useState({
    active: 0,
    previous: null as number | null,
    round: 0,
  });
  const [paused, setPaused] = useState(false);
  const [focused, setFocused] = useState(false);
  // `undefined` até medir (no HTML do servidor as barras ficam escondidas, sem pular de lugar ao hidratar).
  const [barsTop, setBarsTop] = useState<number | null | undefined>(undefined);
  const rootRef = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();
  const autoplay = shouldAutoplay(total, paused || focused, reducedMotion);

  const go = useCallback(
    (index: number) => {
      setSlides((current) =>
        index === current.active
          ? current
          : { active: wrapIndex(index, total), previous: current.active, round: current.round + 1 },
      );
    },
    [total],
  );

  // As barras ficam no lugar do traço do título do slide ativo; sem título (arte com texto), embaixo.
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    const place = () => {
      const title = root.querySelectorAll('.hero-carousel__slide')[active]?.querySelector('.hero__title');
      if (!title) {
        setBarsTop(null);
        return;
      }
      // Pelo `offsetTop` (sem os `transform`): o título ainda está subindo na entrada quando é medido.
      let top = (title as HTMLElement).offsetHeight;
      let node: HTMLElement | null = title as HTMLElement;
      while (node && node !== root) {
        top += node.offsetTop;
        node = node.offsetParent as HTMLElement | null;
      }
      setBarsTop(top);
    };
    place();
    window.addEventListener('resize', place);
    return () => window.removeEventListener('resize', place);
  }, [active]);

  if (total <= 1) return <>{slides}</>;

  // Só o foco do teclado pausa: o clique numa barra também dá foco, e não deve parar a troca.
  function onFocus(event: FocusEvent<HTMLElement>) {
    setFocused(event.target instanceof HTMLElement && event.target.matches(':focus-visible'));
  }

  const style = { '--hero-interval': `${CAROUSEL_INTERVAL_MS}ms` } as CSSProperties;
  return (
    <section
      ref={rootRef}
      className={autoplay ? 'hero-carousel' : 'hero-carousel is-paused'}
      style={style}
      aria-roledescription={t('roleDescription')}
      aria-label={t('label')}
      onFocus={onFocus}
      onBlur={() => setFocused(false)}
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
      <div
        className={
          barsTop === undefined
            ? 'hero-carousel__bars is-unplaced'
            : barsTop === null
              ? 'hero-carousel__bars is-bottom'
              : 'hero-carousel__bars'
        }
        style={typeof barsTop === 'number' ? { top: barsTop } : undefined}
      >
        {slides.map((_, index) => {
          const state = index === active ? 'is-active' : index < active ? 'is-done' : '';
          return (
            <button
              key={index}
              type="button"
              className={`hero-carousel__bar ${state}`}
              aria-label={t('goTo', { current: index + 1, total })}
              aria-current={index === active ? 'true' : undefined}
              onClick={() => go(index)}
            >
              <span
                key={index === active ? `fill-${round}` : 'fill'}
                className="hero-carousel__fill"
                onAnimationEnd={index === active ? () => go(active + 1) : undefined}
              />
            </button>
          );
        })}
      </div>
    </section>
  );
}
