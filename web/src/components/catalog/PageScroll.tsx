'use client';

import { useEffect, useRef } from 'react';

/**
 * Clique na paginação do fim da lista à espera da página nova. Fica fora do componente porque a lista pode remontar na
 * troca de página (retorno de 16/11/2026: quem trocava para a tabela técnica pelo botão, sem recarregar, e clicava em
 * "Próxima" embaixo recebia a lista remontada, o componente nascia já com a página nova e a página ficava no meio).
 */
let pendingAt = 0;
/** Depois disso a espera vale como perdida (a navegação não aconteceu), em ms. */
const PENDING_MS = 15000;

/**
 * Ao trocar de página na lista, rola suave até o começo dela (`[data-page-anchor]`), abaixo do cabeçalho fixo, se a
 * pessoa clicou na paginação do fim e estava mais para baixo. Quem clicou em cima já está lá: nada se mexe.
 */
export function PageScroll({ page }: { page: number }) {
  const marker = useRef<HTMLSpanElement>(null);
  const previous = useRef(page);

  // O clique num link desta paginação marca a espera (o `<span>` fica dentro da `<nav>` da paginação).
  useEffect(() => {
    const nav = marker.current?.parentElement;
    if (!nav) return undefined;
    const onClick = (event: MouseEvent) => {
      if ((event.target as Element | null)?.closest('a[href]')) pendingAt = Date.now();
    };
    nav.addEventListener('click', onClick);
    return () => nav.removeEventListener('click', onClick);
  }, []);

  useEffect(() => {
    const changed = previous.current !== page;
    previous.current = page;
    const pending = Date.now() - pendingAt < PENDING_MS;
    pendingAt = 0;
    if (!changed && !pending) return;
    const anchor = document.querySelector<HTMLElement>('[data-page-anchor]');
    if (!anchor) return;
    const header = document.querySelector<HTMLElement>('.site-header')?.offsetHeight ?? 0;
    const top = anchor.getBoundingClientRect().top - header - 16;
    if (top >= 0) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: window.scrollY + top, behavior: reduce ? 'auto' : 'smooth' });
  }, [page]);

  return <span ref={marker} hidden />;
}
