'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { PeekPhotos, peekSize } from '@/components/catalog/PeekPhotos';
import type { Image } from '@/lib/api/types';
import { peekPosition } from '@/lib/catalog/row-peek';
import { useIsClient } from '@/lib/ui/use-is-client';
import { REDUCED_MOTION } from '@/lib/ui/use-reduced-motion';

const FINE_POINTER = '(hover: hover) and (pointer: fine)';
const FOLLOW = 0.2;

/**
 * Capas das outras cores da peça que flutuam ao lado do ponteiro no hover do card da grade (retorno de 16/11/2026),
 * como as fotos da tabela técnica (`RowPeek`): só as outras cores, nunca a que já está no card. Fica no `body` (um
 * card dentro de uma esteira com `transform` prenderia a camada fixa), só desktop com mouse, decorativa. Foto e etiqueta
 * retas, sem a inclinação da tabela técnica (retorno de 16/11/2026).
 */
export function PlatePeek({ colors }: { colors: Image[] }) {
  const anchorRef = useRef<HTMLSpanElement | null>(null);
  const layerRef = useRef<HTMLDivElement | null>(null);
  const mounted = useIsClient();
  const [visible, setVisible] = useState(false);
  const { width, height } = peekSize({ images: [], colors });

  useEffect(() => {
    const card = anchorRef.current?.parentElement;
    const layer = layerRef.current;
    if (!mounted || !card || !layer || !window.matchMedia(FINE_POINTER).matches) return;
    const box = { width, height };
    const reduce = window.matchMedia(REDUCED_MOTION).matches;
    const target = { x: 0, y: 0 };
    const current = { x: 0, y: 0 };
    let frame = 0;
    let placed = false;
    const paint = () => {
      layer.style.transform = `translate3d(${current.x}px, ${current.y}px, 0)`;
    };
    const step = () => {
      current.x += (target.x - current.x) * FOLLOW;
      current.y += (target.y - current.y) * FOLLOW;
      paint();
      frame =
        Math.abs(target.x - current.x) + Math.abs(target.y - current.y) > 0.5
          ? requestAnimationFrame(step)
          : 0;
    };
    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return;
      const next = peekPosition(event.clientX, event.clientY, window.innerWidth, window.innerHeight, box);
      target.x = next.x;
      target.y = next.y;
      setVisible(true);
      if (!placed || reduce) {
        current.x = next.x;
        current.y = next.y;
        placed = true;
        paint();
        return;
      }
      if (!frame) frame = requestAnimationFrame(step);
    };
    const hide = () => {
      setVisible(false);
      placed = false;
    };
    card.addEventListener('pointermove', onMove);
    card.addEventListener('pointerleave', hide);
    window.addEventListener('scroll', hide, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      card.removeEventListener('pointermove', onMove);
      card.removeEventListener('pointerleave', hide);
      window.removeEventListener('scroll', hide);
    };
  }, [mounted, width, height]);

  return (
    <>
      <span ref={anchorRef} hidden />
      {mounted
        ? createPortal(
            <div
              ref={layerRef}
              className={visible ? 'row-peek is-visible' : 'row-peek'}
              style={{ width, height }}
              aria-hidden="true"
            >
              {visible ? <PeekPhotos colors={colors} images={[]} straight /> : null}
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
