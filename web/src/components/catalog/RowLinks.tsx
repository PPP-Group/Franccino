'use client';

import { useEffect, useRef } from 'react';

/** O que já é clicável dentro da linha: segue o próprio caminho (categoria, linha, designer, download, lista). */
const OWN_ACTION = 'a, button, input, select, textarea, label, [role="button"]';

/**
 * Clique em qualquer lugar da linha da tabela técnica abre a peça (retorno de 07/11/2026). Os links e botões de dentro
 * da linha (categoria, linha, designer, downloads, lista) continuam indo para onde apontam. O clique só repassa para o
 * link da peça (`a[data-row-link]`), então a navegação, o Ctrl/Cmd + clique e o botão do meio funcionam como num link.
 * Texto selecionado com o mouse não abre nada. O teclado usa o próprio link da peça (a linha não vira um botão).
 */
export function RowLinks() {
  const anchorRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const body = anchorRef.current?.parentElement?.querySelector('tbody');
    if (!body) return;

    const linkOf = (event: MouseEvent): HTMLAnchorElement | null => {
      const target = event.target as Element | null;
      if (!target || target.closest(OWN_ACTION)) return null;
      if (window.getSelection()?.toString()) return null;
      return target.closest('tr')?.querySelector<HTMLAnchorElement>('a[data-row-link]') ?? null;
    };

    const onClick = (event: MouseEvent) => {
      const link = linkOf(event);
      if (!link) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey) {
        window.open(link.href, '_blank', 'noopener');
        return;
      }
      link.click();
    };
    const onAux = (event: MouseEvent) => {
      if (event.button !== 1) return;
      const link = linkOf(event);
      if (link) window.open(link.href, '_blank', 'noopener');
    };

    body.addEventListener('click', onClick);
    body.addEventListener('auxclick', onAux);
    return () => {
      body.removeEventListener('click', onClick);
      body.removeEventListener('auxclick', onAux);
    };
  }, []);

  return <span ref={anchorRef} hidden />;
}
