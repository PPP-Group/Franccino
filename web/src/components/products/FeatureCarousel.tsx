'use client';

import { useTranslations } from 'next-intl';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
} from 'react';
import { MorphImage } from '@/components/media/MorphImage';
import { Icon } from '@/components/ui/Icon';
import { Link } from '@/i18n/navigation';
import type { ProductCard } from '@/lib/api/types';
import { morphTypes } from '@/lib/ui/morph';
import {
  clampIndex,
  counterNumber,
  coverflowPose,
  DRAG_THRESHOLD_PX,
  dragPosition,
  initialIndex,
  keyTarget,
  releaseIndex,
  wheelStep,
  type CoverflowPose,
} from '@/lib/ui/feature-carousel';
import { useReducedMotion } from '@/lib/ui/use-reduced-motion';
import { productMorphName } from './ProductPlate';

export type FeatureCarouselProduct = Pick<
  ProductCard,
  'id' | 'slug' | 'name' | 'cover' | 'cutout' | 'category' | 'area'
>;

/** Largura da peça do centro (`--fc-item` em carousel.css), com folga para o zoom de 5% do hover. */
const ITEM_SIZES = '(max-width: 48rem) 66vw, (min-width: 100rem) 560px, 36vw';

/** Uma peça de arrasto vale esta fração da largura da peça do centro (a vizinha está a meia largura dela). */
const DRAG_STEP_RATIO = 0.55;

/** Depois de andar uma peça pela rolagem lateral, espera este tempo antes de aceitar a próxima. */
const WHEEL_COOLDOWN_MS = 420;

type Drag = {
  pointerId: number;
  x: number;
  y: number;
  startIndex: number;
  stepPx: number;
  position: number;
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

/** Variáveis do CSS que posicionam a peça no palco (carousel.css). */
function poseStyle(pose: CoverflowPose): CSSProperties {
  return {
    '--fc-x': pose.x.toFixed(4),
    '--fc-s': pose.scale.toFixed(4),
    '--fc-f': pose.fade.toFixed(4),
    '--fc-o': pose.opacity.toFixed(4),
    zIndex: pose.z,
  } as CSSProperties;
}

/**
 * Carrossel com a peça em destaque (banco de ideias, ideia 01, aprovada com ajustes em 26/10/2026), no desenho da
 * referência da Franccino: as peças sem fundo, empilhadas num palco claro, a do centro grande e na frente, com a sombra
 * de contato no chão, e as vizinhas encostadas nela, menores e mais apagadas quanto mais longe. Embaixo, o nome e a
 * categoria da peça do centro e o contador. Sem acabamentos, sem "ver peça" e sem 3D (o 3D fica na página da peça).
 *
 * A foto é a `cutout` (PNG/WebP sem fundo) quando o painel tem; sem ela, a capa em fundo branco, que some no palco por
 * `mix-blend-mode: multiply`. O clique na peça do centro abre a peça, com a foto crescendo até a página
 * (`ViewTransition`, ideia 10); o clique numa vizinha a traz para o centro.
 *
 * Nada rola: as peças ficam no mesmo lugar e só mudam `transform`, `opacity` e `filter` (a pose vem de `coverflowPose`).
 * Arrasta com o dedo e com o mouse (com o cursor redondo "Arraste" da ideia 12), anda com as setas do teclado, com os
 * botões e com a rolagem lateral do trackpad. Com movimento reduzido as peças trocam sem animar.
 */
export function FeatureCarousel({ label, products }: FeatureCarouselProps) {
  const t = useTranslations('featureCarousel');
  // O nome curto da área, como no menu (Casa, Giardini).
  const nav = useTranslations('nav');
  const reduceMotion = useReducedMotion();
  const total = products.length;
  const [active, setActive] = useState(() => initialIndex(total));
  // A peça cujo nome aparece embaixo: acompanha o arrasto antes de `active` mudar no fim do gesto.
  const [shown, setShown] = useState(active);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const linkRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const cursorRef = useRef<HTMLSpanElement | null>(null);
  const drag = useRef<Drag | null>(null);
  const suppressClick = useRef(false);
  const activeRef = useRef(active);
  // O nome embaixo troca durante o arrasto só quando muda de peça (sem desenhar o React a cada movimento).
  const shownRef = useRef(active);
  const wheel = useRef({ accumulated: 0, lockedUntil: 0 });
  const cursor = useRef({ x: 0, y: 0, tx: 0, ty: 0, frame: 0, visible: false });

  /** Põe cada peça na pose da posição dada (fracionária durante o arrasto), direto no DOM. */
  const paint = useCallback((position: number) => {
    itemRefs.current.forEach((node, index) => {
      if (!node) return;
      const pose = coverflowPose(index - position);
      node.style.setProperty('--fc-x', pose.x.toFixed(4));
      node.style.setProperty('--fc-s', pose.scale.toFixed(4));
      node.style.setProperty('--fc-f', pose.fade.toFixed(4));
      node.style.setProperty('--fc-o', pose.opacity.toFixed(4));
      node.style.zIndex = String(pose.z);
      node.toggleAttribute('data-hidden', pose.hidden);
    });
  }, []);

  const goTo = useCallback(
    (index: number) => {
      const target = clampIndex(index, total);
      activeRef.current = target;
      shownRef.current = target;
      setActive(target);
      setShown(target);
      // Mesmo índice (arrasto que voltou): o React não desenha de novo, então a pose volta por aqui.
      paint(target);
    },
    [paint, total],
  );

  useLayoutEffect(() => {
    activeRef.current = active;
    paint(active);
  }, [active, paint]);

  // Rolagem lateral (trackpad, roda inclinada): uma peça por gesto. Ouvinte nativo para poder segurar o "voltar" do
  // navegador no gesto de dois dedos.
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || total < 2) return;
    const onWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return;
      event.preventDefault();
      const state = wheel.current;
      if (event.timeStamp < state.lockedUntil) return;
      const { step, rest } = wheelStep(state.accumulated + event.deltaX);
      state.accumulated = rest;
      if (step !== 0) {
        state.lockedUntil = event.timeStamp + WHEEL_COOLDOWN_MS;
        goTo(activeRef.current + step);
      }
    };
    stage.addEventListener('wheel', onWheel, { passive: false });
    return () => stage.removeEventListener('wheel', onWheel);
  }, [goTo, total]);

  useEffect(() => {
    const cursorState = cursor.current;
    return () => window.cancelAnimationFrame(cursorState.frame);
  }, []);

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const target = keyTarget(event.key, active, total);
    if (target === null) return;
    event.preventDefault();
    goTo(target);
    linkRefs.current[target]?.focus({ preventScroll: true });
  }

  // ---------- arrasto (dedo, caneta e mouse) ----------

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (total < 2 || (event.pointerType === 'mouse' && event.button !== 0)) return;
    if ((event.target as Element).closest('button')) return;
    const item = itemRefs.current[active];
    drag.current = {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      startIndex: active,
      stepPx: (item?.offsetWidth ?? 400) * DRAG_STEP_RATIO,
      position: active,
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
    const stage = stageRef.current;
    if (!state || !stage || event.pointerId !== state.pointerId) return;
    const dx = event.clientX - state.x;
    if (!state.moved) {
      const dy = event.clientY - state.y;
      // Gesto mais vertical que horizontal: é a página rolando, não o carrossel.
      if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) >= DRAG_THRESHOLD_PX) {
        drag.current = null;
        rootRef.current?.removeAttribute('data-pressed');
        return;
      }
      if (Math.abs(dx) < DRAG_THRESHOLD_PX) return;
      state.moved = true;
      stage.dataset.dragging = '';
      stage.setPointerCapture(event.pointerId);
    }
    const dt = event.timeStamp - state.lastT;
    if (dt > 0) {
      // Positivo quando a faixa avança (o ponteiro vai para a esquerda); média curta para não pular com um evento solto.
      state.velocity = 0.7 * ((state.lastX - event.clientX) / dt) + 0.3 * state.velocity;
    }
    state.lastX = event.clientX;
    state.lastT = event.timeStamp;
    state.position = dragPosition(state.startIndex, dx, state.stepPx, total);
    paint(state.position);
    const nearest = clampIndex(Math.round(state.position), total);
    if (nearest !== shownRef.current) {
      shownRef.current = nearest;
      setShown(nearest);
    }
  }

  function endDrag(event: PointerEvent<HTMLDivElement>) {
    const state = drag.current;
    rootRef.current?.removeAttribute('data-pressed');
    if (!state || event.pointerId !== state.pointerId) return;
    drag.current = null;
    const stage = stageRef.current;
    if (!state.moved || !stage) return;
    if (stage.hasPointerCapture(event.pointerId)) stage.releasePointerCapture(event.pointerId);
    delete stage.dataset.dragging;
    suppressClick.current = true;
    window.setTimeout(() => {
      suppressClick.current = false;
    }, 0);
    const nearest = clampIndex(Math.round(state.position), total);
    const target = releaseIndex(nearest, state.startIndex, state.velocity, total);
    goTo(target);
    if (event.pointerType !== 'mouse') hideCursor();
  }

  function onItemClick(event: MouseEvent<HTMLAnchorElement>, index: number) {
    if (index === active) return;
    // A vizinha não abre a peça: vem para o centro.
    event.preventDefault();
    goTo(index);
  }

  // ---------- cursor "Arraste" (ideia 12): segue o mouse com um leve atraso ----------

  function moveCursor(event: PointerEvent<HTMLDivElement>) {
    const root = rootRef.current;
    if (!root || event.pointerType !== 'mouse' || reduceMotion || total < 2) return;
    // Sobre as setas fica o cursor normal: a bolha esconderia o botão.
    if (!drag.current?.moved && (event.target as Element).closest('button')) {
      hideCursor();
      return;
    }
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

  const current = products[shown] ?? products[active];
  // Só capas em fundo branco (ou uma parte delas): as peças ficam um pouco mais afastadas, porque a capa fundida no
  // palco não tapa a vizinha de trás (carousel.css).
  const rootClass = products.every((product) => product.cutout)
    ? 'feature-carousel'
    : 'feature-carousel feature-carousel--packshots';
  const stageClass = reduceMotion ? 'feature-carousel__stage' : 'feature-carousel__stage is-animated';

  return (
    <div
      ref={rootRef}
      className={rootClass}
      role="region"
      aria-roledescription={t('roleDescription')}
      aria-label={label}
    >
      <div
        ref={stageRef}
        className={stageClass}
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
          // Sem a foto recortada, a capa em fundo branco: o branco some no palco (multiply, carousel.css).
          const image = product.cutout ?? product.cover;
          const kind = product.cutout ? 'is-cutout' : 'is-packshot';
          const pose = coverflowPose(index - active);
          return (
            <div
              key={product.id}
              ref={(node) => {
                itemRefs.current[index] = node;
              }}
              className={['feature-carousel__item', kind, isActive ? 'is-active' : null]
                .filter(Boolean)
                .join(' ')}
              style={poseStyle(pose)}
              data-hidden={pose.hidden ? '' : undefined}
              role="group"
              aria-roledescription={t('slideRoleDescription')}
              aria-label={t('slide', { current: index + 1, total, name: product.name })}
            >
              <Link
                ref={(node) => {
                  linkRefs.current[index] = node;
                }}
                className="feature-carousel__link"
                href={{ pathname: '/products/[slug]', params: { slug: product.slug } }}
                transitionTypes={image ? morphTypes(productMorphName(product.slug)) : undefined}
                data-morph-link={image ? productMorphName(product.slug) : undefined}
                tabIndex={isActive ? 0 : -1}
                draggable={false}
                aria-label={product.name}
                onClick={(event) => onItemClick(event, index)}
              >
                <span
                  className={
                    image
                      ? 'feature-carousel__frame'
                      : 'feature-carousel__frame feature-carousel__frame--empty'
                  }
                >
                  {image ? (
                    <MorphImage
                      name={productMorphName(product.slug)}
                      image={image}
                      sizes={ITEM_SIZES}
                      fit="contain"
                    />
                  ) : null}
                </span>
                <span className="feature-carousel__shadow" aria-hidden="true" />
              </Link>
            </div>
          );
        })}
        {total > 1 ? (
          <>
            <button
              type="button"
              className="feature-carousel__button feature-carousel__button--previous"
              aria-label={t('previous')}
              disabled={active === 0}
              onClick={() => goTo(active - 1)}
            >
              <Icon name="arrow" />
            </button>
            <button
              type="button"
              className="feature-carousel__button feature-carousel__button--next"
              aria-label={t('next')}
              disabled={active === total - 1}
              onClick={() => goTo(active + 1)}
            >
              <Icon name="arrow" />
            </button>
          </>
        ) : null}
      </div>
      {current ? (
        <div className="feature-carousel__caption" key={current.id} aria-hidden="true">
          <p className="feature-carousel__name">{current.name}</p>
          <p className="feature-carousel__meta">
            {t('meta', { category: current.category.name, area: nav(current.area.key) })}
          </p>
          {total > 1 ? (
            <p className="feature-carousel__counter num">
              {t('counter', { current: counterNumber(shown + 1), total: counterNumber(total) })}
            </p>
          ) : null}
        </div>
      ) : null}
      <p className="visually-hidden" aria-live="polite" aria-atomic="true">
        {products[active] ? t('status', { current: active + 1, total, name: products[active].name }) : null}
      </p>
      <span ref={cursorRef} className="feature-carousel__cursor" aria-hidden="true">
        <span className="feature-carousel__cursor-dot">{t('drag')}</span>
      </span>
    </div>
  );
}
