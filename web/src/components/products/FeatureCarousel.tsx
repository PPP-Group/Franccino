'use client';

import { useTranslations } from 'next-intl';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  ViewTransition,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
} from 'react';
import { ApiImage } from '@/components/media/ApiImage';
import { Icon } from '@/components/ui/Icon';
import { Link } from '@/i18n/navigation';
import type { ProductCard } from '@/lib/api/types';
import {
  clampIndex,
  counterNumber,
  DRAG_THRESHOLD_PX,
  initialIndex,
  keyTarget,
  nearestIndex,
  releaseIndex,
} from '@/lib/ui/feature-carousel';
import { useReducedMotion } from '@/lib/ui/use-reduced-motion';
import { productMorphName } from './ProductPlate';

export type FeatureCarouselProduct = Pick<
  ProductCard,
  'id' | 'slug' | 'name' | 'cover' | 'category' | 'area'
>;

/** Largura da peça do centro (`--fc-item` em carousel.css), com folga para o zoom de 5% do hover. */
const ITEM_SIZES = '(max-width: 48rem) 66vw, (min-width: 100rem) 570px, 36vw';

/** Prazo máximo para a rolagem suave terminar quando o navegador não tem o evento `scrollend`. */
const SETTLE_FALLBACK_MS = 800;

type Drag = {
  pointerId: number;
  x: number;
  left: number;
  startIndex: number;
  moved: boolean;
  lastX: number;
  lastT: number;
  velocity: number;
};

type FeatureCarouselProps = {
  /** Nome do carrossel para leitores de tela. */
  label: string;
  products: FeatureCarouselProduct[];
};

/**
 * Carrossel com a peça em destaque (banco de ideias, ideia 01, aprovada com ajustes em 26/10/2026): a peça do centro
 * fica grande e nítida, as vizinhas menores e mais claras; ao passar para o lado, a próxima cresce e o nome troca com
 * ela. Só a foto, o nome e a categoria: sem acabamentos, sem "ver peça" e sem 3D (o 3D fica na página da peça). O
 * clique na foto abre a peça, com a foto crescendo até a página (`ViewTransition`, ideia 10).
 *
 * É uma rolagem nativa com encaixe no centro (dedo, trackpad, teclado); o mouse arrasta, com o cursor redondo
 * "Arraste" da ideia 12. Escala e opacidade ficam no CSS (carousel.css); com movimento reduzido nada cresce nem anima.
 */
export function FeatureCarousel({ label, products }: FeatureCarouselProps) {
  const t = useTranslations('featureCarousel');
  // O nome curto da área, como no menu (Casa, Giardini).
  const nav = useTranslations('nav');
  const reduceMotion = useReducedMotion();
  const total = products.length;
  const [active, setActive] = useState(() => initialIndex(total));
  const rootRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const linkRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const cursorRef = useRef<HTMLSpanElement | null>(null);
  const drag = useRef<Drag | null>(null);
  const suppressClick = useRef(false);
  const settleTimer = useRef<number | undefined>(undefined);
  const scrollFrame = useRef<number | undefined>(undefined);
  const cursor = useRef({ x: 0, y: 0, tx: 0, ty: 0, frame: 0, visible: false });

  const centers = useCallback(
    () => itemRefs.current.map((item) => (item ? item.offsetLeft + item.offsetWidth / 2 : 0)),
    [],
  );

  const leftFor = useCallback((index: number) => {
    const track = trackRef.current;
    const item = itemRefs.current[index];
    if (!track || !item) return 0;
    return item.offsetLeft + item.offsetWidth / 2 - track.clientWidth / 2;
  }, []);

  const syncActive = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    setActive(nearestIndex(centers(), track.scrollLeft + track.clientWidth / 2));
  }, [centers]);

  /** Fim da rolagem depois do arrasto: devolve o encaixe à faixa. */
  const settle = useCallback(() => {
    window.clearTimeout(settleTimer.current);
    const track = trackRef.current;
    if (track && !drag.current) {
      delete track.dataset.dragging;
    }
  }, []);

  const goTo = useCallback(
    (index: number) => {
      const track = trackRef.current;
      if (!track) return;
      const target = clampIndex(index, total);
      setActive(target);
      track.scrollTo({ left: leftFor(target), behavior: reduceMotion ? 'auto' : 'smooth' });
    },
    [leftFor, reduceMotion, total],
  );

  // Abre com a segunda peça no centro (com 3 ou mais). O CSS `scroll-initial-target` já faz isso antes do JavaScript
  // nos navegadores que o têm; aqui fica para os outros.
  useLayoutEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollLeft = leftFor(initialIndex(total));
  }, [leftFor, total]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const onScrollEnd = () => settle();
    const cursorState = cursor.current;
    track.addEventListener('scrollend', onScrollEnd);
    return () => {
      track.removeEventListener('scrollend', onScrollEnd);
      window.clearTimeout(settleTimer.current);
      if (scrollFrame.current !== undefined) window.cancelAnimationFrame(scrollFrame.current);
      window.cancelAnimationFrame(cursorState.frame);
    };
  }, [settle]);

  function onScroll() {
    if (scrollFrame.current !== undefined) return;
    scrollFrame.current = window.requestAnimationFrame(() => {
      scrollFrame.current = undefined;
      syncActive();
    });
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const target = keyTarget(event.key, active, total);
    if (target === null) return;
    event.preventDefault();
    goTo(target);
    linkRefs.current[target]?.focus({ preventScroll: true });
  }

  // ---------- arrasto com o mouse (o dedo e o trackpad já rolam sozinhos) ----------

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    const track = trackRef.current;
    if (!track || event.pointerType !== 'mouse' || event.button !== 0 || total < 2) return;
    drag.current = {
      pointerId: event.pointerId,
      x: event.clientX,
      left: track.scrollLeft,
      startIndex: active,
      moved: false,
      lastX: event.clientX,
      lastT: event.timeStamp,
      velocity: 0,
    };
    rootRef.current?.setAttribute('data-pressed', '');
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    moveCursor(event);
    const state = drag.current;
    const track = trackRef.current;
    if (!state || !track || event.pointerId !== state.pointerId) return;
    const dx = event.clientX - state.x;
    if (!state.moved) {
      if (Math.abs(dx) < DRAG_THRESHOLD_PX) return;
      state.moved = true;
      window.clearTimeout(settleTimer.current);
      track.dataset.dragging = '';
      track.setPointerCapture(event.pointerId);
    }
    const dt = event.timeStamp - state.lastT;
    if (dt > 0) {
      // Positivo quando a faixa avança (o mouse vai para a esquerda); média curta para não pular com um evento solto.
      state.velocity = 0.7 * ((state.lastX - event.clientX) / dt) + 0.3 * state.velocity;
    }
    state.lastX = event.clientX;
    state.lastT = event.timeStamp;
    track.scrollLeft = state.left - dx;
  }

  function endDrag(event: PointerEvent<HTMLDivElement>) {
    const state = drag.current;
    rootRef.current?.removeAttribute('data-pressed');
    if (!state || event.pointerId !== state.pointerId) return;
    drag.current = null;
    const track = trackRef.current;
    if (!state.moved || !track) return;
    if (track.hasPointerCapture(event.pointerId)) track.releasePointerCapture(event.pointerId);
    suppressClick.current = true;
    window.setTimeout(() => {
      suppressClick.current = false;
    }, 0);
    const nearest = nearestIndex(centers(), track.scrollLeft + track.clientWidth / 2);
    goTo(releaseIndex(nearest, state.startIndex, state.velocity, total));
    settleTimer.current = window.setTimeout(settle, SETTLE_FALLBACK_MS);
  }

  // ---------- cursor "Arraste" (ideia 12): segue o mouse com um leve atraso ----------

  function moveCursor(event: PointerEvent<HTMLDivElement>) {
    const root = rootRef.current;
    if (!root || event.pointerType !== 'mouse' || reduceMotion || total < 2) return;
    const rect = root.getBoundingClientRect();
    const state = cursor.current;
    state.tx = event.clientX - rect.left;
    state.ty = event.clientY - rect.top;
    if (!state.visible) {
      state.visible = true;
      state.x = state.tx;
      state.y = state.ty;
      root.setAttribute('data-cursor', '');
      paintCursor();
    }
  }

  function paintCursor() {
    const state = cursor.current;
    const node = cursorRef.current;
    if (!node || !state.visible) return;
    state.x += (state.tx - state.x) * 0.22;
    state.y += (state.ty - state.y) * 0.22;
    node.style.transform = `translate3d(${state.x}px, ${state.y}px, 0)`;
    state.frame = window.requestAnimationFrame(paintCursor);
  }

  function hideCursor() {
    const state = cursor.current;
    state.visible = false;
    window.cancelAnimationFrame(state.frame);
    rootRef.current?.removeAttribute('data-cursor');
  }

  const current = products[active];

  return (
    <div
      ref={rootRef}
      className="feature-carousel"
      role="region"
      aria-roledescription={t('roleDescription')}
      aria-label={label}
    >
      <div
        ref={trackRef}
        className="feature-carousel__track"
        onScroll={onScroll}
        onKeyDown={onKeyDown}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onPointerLeave={hideCursor}
        onDragStart={(event) => event.preventDefault()}
        onClickCapture={(event) => {
          if (suppressClick.current) {
            event.preventDefault();
            event.stopPropagation();
          }
        }}
      >
        {products.map((product, index) => {
          const isActive = index === active;
          const cover = product.cover;
          const mediaStyle = cover?.width
            ? ({ '--plate-img-max': `${cover.width}px` } as CSSProperties)
            : undefined;
          return (
            <div
              key={product.id}
              ref={(node) => {
                itemRefs.current[index] = node;
              }}
              className={`feature-carousel__item ${isActive ? 'is-active' : index < active ? 'is-before' : 'is-after'}`}
              role="group"
              aria-roledescription={t('slideRoleDescription')}
              aria-label={t('slide', { current: index + 1, total, name: product.name })}
              data-initial={index === initialIndex(total) ? '' : undefined}
            >
              <Link
                ref={(node) => {
                  linkRefs.current[index] = node;
                }}
                className="feature-carousel__link"
                href={{ pathname: '/products/[slug]', params: { slug: product.slug } }}
                tabIndex={isActive ? 0 : -1}
                draggable={false}
                onFocus={(event) => {
                  // Só o foco do teclado traz a peça ao centro; o clique do mouse pode ser o começo de um arrasto.
                  if (!isActive && event.currentTarget.matches(':focus-visible')) goTo(index);
                }}
              >
                <div className="feature-carousel__media">
                  <div
                    className={
                      cover
                        ? 'feature-carousel__frame hover-zoom'
                        : 'feature-carousel__frame feature-carousel__frame--empty'
                    }
                    style={mediaStyle}
                  >
                    {cover ? (
                      <ViewTransition
                        name={productMorphName(product.slug)}
                        share="product-morph"
                        default="none"
                      >
                        <ApiImage image={cover} sizes={ITEM_SIZES} />
                      </ViewTransition>
                    ) : null}
                  </div>
                </div>
                <div className="feature-carousel__caption">
                  <h3 className="feature-carousel__name">{product.name}</h3>
                  <p className="feature-carousel__meta">
                    {t('meta', { category: product.category.name, area: nav(product.area.key) })}
                  </p>
                </div>
              </Link>
            </div>
          );
        })}
      </div>
      {total > 1 ? (
        <div className="feature-carousel__controls">
          <button
            type="button"
            className="feature-carousel__button feature-carousel__button--previous"
            aria-label={t('previous')}
            disabled={active === 0}
            onClick={() => goTo(active - 1)}
          >
            <Icon name="arrow" />
          </button>
          <p className="feature-carousel__counter num" aria-hidden="true">
            {t('counter', { current: counterNumber(active + 1), total: counterNumber(total) })}
          </p>
          <button
            type="button"
            className="feature-carousel__button"
            aria-label={t('next')}
            disabled={active === total - 1}
            onClick={() => goTo(active + 1)}
          >
            <Icon name="arrow" />
          </button>
        </div>
      ) : null}
      <p className="visually-hidden" aria-live="polite" aria-atomic="true">
        {current ? t('status', { current: active + 1, total, name: current.name }) : null}
      </p>
      <span ref={cursorRef} className="feature-carousel__cursor" aria-hidden="true">
        <span className="feature-carousel__cursor-dot">{t('drag')}</span>
      </span>
    </div>
  );
}
