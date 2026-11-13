'use client';

import { useEffect, useRef } from 'react';

/**
 * Ao trocar de página na lista, rola suave até o começo dela (`[data-page-anchor]`), abaixo do cabeçalho fixo, se a
 * pessoa estava mais para baixo (clicou na paginação do fim). Quem clicou em cima já está lá: nada se mexe.
 */
export function PageScroll({ page }: { page: number }) {
  const previous = useRef(page);
  useEffect(() => {
    if (previous.current === page) return;
    previous.current = page;
    const anchor = document.querySelector<HTMLElement>('[data-page-anchor]');
    if (!anchor) return;
    const header = document.querySelector<HTMLElement>('.site-header')?.offsetHeight ?? 0;
    const top = anchor.getBoundingClientRect().top - header - 16;
    if (top >= 0) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: window.scrollY + top, behavior: reduce ? 'auto' : 'smooth' });
  }, [page]);
  return null;
}
