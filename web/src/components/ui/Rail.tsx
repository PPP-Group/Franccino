'use client';

import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { Icon } from '@/components/ui/Icon';

type RailProps = {
  /** Nome da faixa para leitores de tela (a região rola pelo teclado também). */
  label: string;
  children: ReactNode;
  className?: string;
};

/**
 * Faixa horizontal com setas para avançar e voltar (clientes no fim de Projetos, "Nossa História" na
 * Fábrica). É uma rolagem nativa com encaixe: funciona com o dedo, o trackpad e o teclado; as setas só
 * rolam uma "página" da faixa e somem nas pontas.
 */
export function Rail({ label, children, className }: RailProps) {
  const common = useTranslations('common');
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [edges, setEdges] = useState({ start: true, end: true });

  const updateEdges = useCallback(() => {
    const track = trackRef.current;
    if (!track) {
      return;
    }
    setEdges({
      start: track.scrollLeft <= 1,
      end: track.scrollLeft + track.clientWidth >= track.scrollWidth - 1,
    });
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) {
      return;
    }
    updateEdges();
    const observer = new ResizeObserver(updateEdges);
    observer.observe(track);
    return () => {
      observer.disconnect();
    };
  }, [updateEdges]);

  function scrollByPage(direction: 1 | -1) {
    const track = trackRef.current;
    if (!track) {
      return;
    }
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    track.scrollBy({ left: direction * track.clientWidth * 0.9, behavior: reduce ? 'auto' : 'smooth' });
  }

  return (
    <div className={className ? `scroll-rail ${className}` : 'scroll-rail'}>
      <div
        ref={trackRef}
        className="scroll-rail__track"
        role="region"
        aria-label={label}
        tabIndex={0}
        onScroll={updateEdges}
      >
        {children}
      </div>
      {edges.start && edges.end ? null : (
        <div className="scroll-rail__controls">
          <button
            type="button"
            className="scroll-rail__button scroll-rail__button--previous"
            aria-label={common('scrollPrevious')}
            disabled={edges.start}
            onClick={() => scrollByPage(-1)}
          >
            <Icon name="arrow" />
          </button>
          <button
            type="button"
            className="scroll-rail__button"
            aria-label={common('scrollNext')}
            disabled={edges.end}
            onClick={() => scrollByPage(1)}
          >
            <Icon name="arrow" />
          </button>
        </div>
      )}
    </div>
  );
}
