'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { ApiImage } from '@/components/media/ApiImage';
import type { Image } from '@/lib/api/types';
import { PREVIEW_COUNT } from '@/lib/catalog/technical';
import { peekBox, peekPosition, PEEK_PHOTO } from '@/lib/catalog/row-peek';
import { REDUCED_MOTION } from '@/lib/ui/use-reduced-motion';

/** Só com mouse de verdade: no toque não há "passar por cima", e a prévia cobriria a tabela. */
const FINE_POINTER = '(hover: hover) and (pointer: fine)';

/** Quanto a prévia anda por quadro em direção ao ponteiro (segue suave, sem atraso que pareça lento). */
const FOLLOW = 0.2;

export type RowPeekItem = { id: number; images: Image[] };

/**
 * Fotos da peça que saem da linha da tabela técnica quando o mouse passa por ela (retornos de 06 e 07/11/2026): até
 * quatro fotos que nascem empilhadas e se abrem lado a lado, como cartas que se separam, para dar para ver todas; ao
 * lado do ponteiro (nunca por cima dele), seguindo o movimento com suavidade; trocam ao passar para outra linha. Só
 * desktop com mouse; decorativa (o nome e o link da linha já dizem tudo), sem eventos de ponteiro. Com "menos
 * movimento", a prévia aparece aberta e parada.
 */
export function RowPeek({ items }: { items: RowPeekItem[] }) {
  const layerRef = useRef<HTMLDivElement | null>(null);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [shownId, setShownId] = useState<number | null>(null);
  // Quantas fotos cada linha abre (a caixa muda de largura com elas).
  const counts = useRef(new Map<number, number>());
  useEffect(() => {
    counts.current = new Map(items.map((item) => [item.id, Math.min(item.images.length, PREVIEW_COUNT)]));
  }, [items]);

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
      const box = peekBox(counts.current.get(id) ?? 1);
      const next = peekPosition(event.clientX, event.clientY, window.innerWidth, window.innerHeight, box);
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
  const photos = shown ? shown.images.slice(0, PREVIEW_COUNT) : [];
  const box = peekBox(photos.length);
  return (
    <div
      ref={layerRef}
      className={activeId !== null && shown ? 'row-peek is-visible' : 'row-peek'}
      style={{ width: box.width, height: box.height }}
      aria-hidden="true"
    >
      {shown ? (
        // A chave troca o grupo a cada linha: as fotos da peça nova saem de novo da pilha e se abrem.
        <div key={shown.id} className="row-peek__group">
          {photos.map((image, index) => (
            <div
              key={image.id}
              className="row-peek__photo"
              style={
                {
                  '--i': index,
                  '--peek-rotate': index % 2 ? '1.5deg' : '-1.5deg',
                  zIndex: photos.length - index,
                } as CSSProperties
              }
            >
              <ApiImage image={image} sizes={`${PEEK_PHOTO.width}px`} />
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
