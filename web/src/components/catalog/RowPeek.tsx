'use client';

import { useEffect, useRef, useState } from 'react';
import { ApiImage } from '@/components/media/ApiImage';
import type { Image } from '@/lib/api/types';
import { peekPosition, PEEK_BOX } from '@/lib/catalog/row-peek';
import { REDUCED_MOTION } from '@/lib/ui/use-reduced-motion';

/** Só com mouse de verdade: no toque não há "passar por cima", e a prévia cobriria a tabela. */
const FINE_POINTER = '(hover: hover) and (pointer: fine)';

/** Quanto a prévia anda por quadro em direção ao ponteiro (segue suave, sem atraso que pareça lento). */
const FOLLOW = 0.2;

export type RowPeekItem = { id: number; images: Image[] };

/**
 * Fotos da peça que saem da linha da tabela técnica quando o mouse passa por ela (retorno de 06/11/2026): duas ou três
 * fotos levemente espalhadas, ao lado do ponteiro (nunca por cima dele), seguindo o movimento com suavidade; trocam ao
 * passar para outra linha. Só desktop com mouse; decorativa (o nome e o link da linha já dizem tudo), sem eventos de
 * ponteiro. Com "menos movimento", a prévia aparece parada, sem seguir nem crescer.
 */
export function RowPeek({ items }: { items: RowPeekItem[] }) {
  const layerRef = useRef<HTMLDivElement | null>(null);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [shownId, setShownId] = useState<number | null>(null);

  useEffect(() => {
    const layer = layerRef.current;
    const body = layer?.parentElement?.querySelector('tbody');
    if (!layer || !body || !window.matchMedia(FINE_POINTER).matches) {
      return;
    }
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
      if (event.pointerType !== 'mouse') {
        return;
      }
      const row = (event.target as Element).closest<HTMLElement>('tr[data-row-id]');
      if (!row) {
        setActiveId(null);
        return;
      }
      const id = Number(row.dataset.rowId);
      setActiveId(id);
      setShownId(id);
      const next = peekPosition(event.clientX, event.clientY, window.innerWidth, window.innerHeight);
      target.x = next.x;
      target.y = next.y;
      // Primeira entrada (ou sem movimento): a prévia nasce no lugar, sem atravessar a tela.
      if (!placed || reduce) {
        current.x = next.x;
        current.y = next.y;
        placed = true;
        paint();
        return;
      }
      if (!frame) {
        frame = requestAnimationFrame(step);
      }
    };
    const hide = () => {
      setActiveId(null);
      placed = false;
    };

    body.addEventListener('pointermove', onMove);
    body.addEventListener('pointerleave', hide);
    // A página rolou e a linha sob o ponteiro mudou sem evento de ponteiro: some até o próximo movimento.
    window.addEventListener('scroll', hide, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      body.removeEventListener('pointermove', onMove);
      body.removeEventListener('pointerleave', hide);
      window.removeEventListener('scroll', hide);
    };
  }, []);

  const shown = items.find((item) => item.id === shownId);
  return (
    <div
      ref={layerRef}
      className={activeId !== null && shown ? 'row-peek is-visible' : 'row-peek'}
      style={{ width: PEEK_BOX.width, height: PEEK_BOX.height }}
      aria-hidden="true"
    >
      {shown ? (
        // A chave troca o grupo a cada linha: as fotos da peça nova entram de novo (opacidade e escala).
        <div
          key={shown.id}
          className={`row-peek__group row-peek__group--${Math.min(shown.images.length, 3)}`}
        >
          {shown.images.slice(0, 3).map((image) => (
            <div key={image.id} className="row-peek__photo">
              <ApiImage image={image} sizes={`${PEEK_BOX.photo}px`} />
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
