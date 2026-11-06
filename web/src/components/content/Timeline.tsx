'use client';

import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { Icon } from '@/components/ui/Icon';
import type { TimelineBlockData } from '@/lib/api/types';

/** Duração da rolagem pelas setas e pelo teclado: movimento grande, como os outros do site (--t-slow). */
const SCROLL_MS = 700;
/** Arrasto com o mouse: abaixo disso é clique, não arrasto. */
const DRAG_THRESHOLD_PX = 6;
/** Ano com muitos fatos ganha largura dupla e fatos em duas colunas: a faixa não fica alta e vazia nos outros anos. */
const WIDE_FACTS = 4;

/** Mesma curva de --ease-out (cubic-bezier(0.23, 1, 0.32, 1)), aproximada por uma potência: começa rápido e pousa. */
function easeOut(progress: number): number {
  return 1 - Math.pow(1 - progress, 4);
}

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Fatos do ano: cada linha do texto do painel vira um item. */
function factsOf(text: string | null): string[] {
  return (text ?? '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

/**
 * "Nossa História" como linha do tempo de verdade (rodada 3, 06/11/2026): um fio contínuo com um marco por ano, o ano
 * em destaque, título e fatos embaixo. O ano ativo fica em evidência e o fio "enche" até ele. Setas ao lado do título,
 * rolagem nativa com encaixe (dedo, trackpad e arrasto com o mouse), rolagem suave com a curva do site pelas setas e
 * pelo teclado (setas, Home e End). O primeiro e o último ano alinham com as margens da página. Com movimento reduzido,
 * a rolagem é instantânea.
 */
export function Timeline({ data, title }: { data: TimelineBlockData; title: string }) {
  const t = useTranslations('blocks');
  const common = useTranslations('common');
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);
  const animation = useRef<number>(0);
  const programmatic = useRef(false);
  const settleTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const drag = useRef<{ x: number; left: number; moved: boolean } | null>(null);
  const [active, setActive] = useState(0);
  const count = data.items.length;

  /** Início da área visível, já descontada a margem da página (scroll-padding). */
  const startPadding = useCallback((viewport: HTMLElement) => {
    return parseFloat(getComputedStyle(viewport).scrollPaddingInlineStart) || 0;
  }, []);

  const scrollToItem = useCallback(
    (index: number) => {
      const viewport = viewportRef.current;
      const item = itemRefs.current[index];
      if (!viewport || !item) {
        return;
      }
      const max = viewport.scrollWidth - viewport.clientWidth;
      const target = Math.max(0, Math.min(max, item.offsetLeft - startPadding(viewport)));
      cancelAnimationFrame(animation.current);
      if (prefersReducedMotion() || Math.abs(target - viewport.scrollLeft) < 1) {
        viewport.scrollLeft = target;
        return;
      }
      // Sem encaixe durante a animação: o navegador não "puxa" a faixa a cada quadro.
      programmatic.current = true;
      viewport.classList.add('is-animating');
      const from = viewport.scrollLeft;
      const start = performance.now();
      const step = (now: number) => {
        const progress = Math.min(1, (now - start) / SCROLL_MS);
        viewport.scrollLeft = from + (target - from) * easeOut(progress);
        if (progress < 1) {
          animation.current = requestAnimationFrame(step);
        } else {
          viewport.classList.remove('is-animating');
          programmatic.current = false;
        }
      };
      animation.current = requestAnimationFrame(step);
    },
    [startPadding],
  );

  const goTo = useCallback(
    (index: number) => {
      const next = Math.max(0, Math.min(count - 1, index));
      setActive(next);
      scrollToItem(next);
    },
    [count, scrollToItem],
  );

  /** Depois de uma rolagem da própria pessoa, o ano ativo é o que ficou no começo da faixa. */
  const syncFromScroll = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport || programmatic.current) {
      return;
    }
    const start = viewport.scrollLeft + startPadding(viewport);
    let nearest = 0;
    let distance = Infinity;
    itemRefs.current.forEach((item, index) => {
      if (!item) {
        return;
      }
      const gap = Math.abs(item.offsetLeft - start);
      if (gap < distance) {
        distance = gap;
        nearest = index;
      }
    });
    const atEnd = viewport.scrollLeft + viewport.clientWidth >= viewport.scrollWidth - 2;
    // No fim da faixa os últimos anos não chegam ao começo: o ativo escolhido pelas setas continua valendo.
    setActive((current) => (atEnd && current > nearest ? current : nearest));
  }, [startPadding]);

  useEffect(() => {
    const animationFrame = animation;
    const timer = settleTimer;
    return () => {
      cancelAnimationFrame(animationFrame.current);
      clearTimeout(timer.current);
    };
  }, []);

  function handleScroll() {
    clearTimeout(settleTimer.current);
    settleTimer.current = setTimeout(syncFromScroll, 120);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const keys: Record<string, number> = {
      ArrowRight: active + 1,
      ArrowLeft: active - 1,
      Home: 0,
      End: count - 1,
    };
    if (event.key in keys) {
      event.preventDefault();
      goTo(keys[event.key]);
    }
  }

  // Arrasto com o mouse (o dedo e o trackpad já rolam sozinhos).
  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    const viewport = viewportRef.current;
    if (event.pointerType !== 'mouse' || event.button !== 0 || !viewport) {
      return;
    }
    stopAnimation();
    drag.current = { x: event.clientX, left: viewport.scrollLeft, moved: false };
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    const viewport = viewportRef.current;
    const state = drag.current;
    if (!viewport || !state) {
      return;
    }
    const delta = event.clientX - state.x;
    if (!state.moved && Math.abs(delta) < DRAG_THRESHOLD_PX) {
      return;
    }
    if (!state.moved) {
      state.moved = true;
      viewport.setPointerCapture(event.pointerId);
      viewport.classList.add('is-dragging');
    }
    viewport.scrollLeft = state.left - delta;
  }

  function handlePointerUp(event: PointerEvent<HTMLDivElement>) {
    const viewport = viewportRef.current;
    const state = drag.current;
    drag.current = null;
    if (!viewport || !state?.moved) {
      return;
    }
    viewport.releasePointerCapture(event.pointerId);
    viewport.classList.remove('is-dragging');
    // Pousa no ano mais perto, com a mesma rolagem suave das setas.
    const start = viewport.scrollLeft + startPadding(viewport);
    let nearest = 0;
    let distance = Infinity;
    itemRefs.current.forEach((item, index) => {
      const gap = item ? Math.abs(item.offsetLeft - start) : Infinity;
      if (gap < distance) {
        distance = gap;
        nearest = index;
      }
    });
    goTo(nearest);
    // O clique que termina o arrasto não ativa o ano embaixo do ponteiro (vem logo depois do pointerup).
    const swallow = (click: MouseEvent) => click.stopPropagation();
    viewport.addEventListener('click', swallow, { capture: true, once: true });
    setTimeout(() => viewport.removeEventListener('click', swallow, { capture: true }), 0);
  }

  /** A roda ou o trackpad no meio da rolagem das setas: a pessoa assume, a animação para. */
  function stopAnimation() {
    if (!programmatic.current) {
      return;
    }
    cancelAnimationFrame(animation.current);
    viewportRef.current?.classList.remove('is-animating');
    programmatic.current = false;
  }

  if (count === 0) {
    return null;
  }

  return (
    <section className="timeline-block" aria-label={t('timeline')}>
      <div className="wrap timeline-block__head" data-reveal>
        <h2>{title}</h2>
        {count > 1 ? (
          <div className="timeline-block__controls">
            <button
              type="button"
              className="timeline-block__button timeline-block__button--previous"
              aria-label={common('scrollPrevious')}
              disabled={active === 0}
              onClick={() => goTo(active - 1)}
            >
              <Icon name="arrow" />
            </button>
            <button
              type="button"
              className="timeline-block__button"
              aria-label={common('scrollNext')}
              disabled={active === count - 1}
              onClick={() => goTo(active + 1)}
            >
              <Icon name="arrow" />
            </button>
          </div>
        ) : null}
      </div>
      <div
        ref={viewportRef}
        className="timeline-block__viewport"
        role="region"
        aria-label={t('timeline')}
        tabIndex={0}
        onScroll={handleScroll}
        onWheel={stopAnimation}
        onTouchStart={stopAnimation}
        onKeyDown={handleKeyDown}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <ol className="timeline" data-reveal="stagger">
          {data.items.map((item, index) => {
            const facts = factsOf(item.text);
            const className = [
              'timeline__item',
              facts.length > WIDE_FACTS ? 'timeline__item--wide' : '',
              index === active ? 'is-active' : index < active ? 'is-past' : '',
            ]
              .filter(Boolean)
              .join(' ');
            return (
              <li
                key={index}
                ref={(element) => {
                  itemRefs.current[index] = element;
                }}
                className={className}
                aria-current={index === active ? 'step' : undefined}
                onClick={() => goTo(index)}
              >
                <span className="timeline__rail" aria-hidden="true">
                  <span className="timeline__fill" />
                  <span className="timeline__dot" />
                </span>
                <span className="timeline__year num">{item.year}</span>
                <h3>{item.title}</h3>
                {facts.length > 0 ? (
                  <ul className="timeline__facts">
                    {facts.map((fact, factIndex) => (
                      <li key={factIndex}>{fact}</li>
                    ))}
                  </ul>
                ) : null}
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
