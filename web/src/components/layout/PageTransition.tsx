'use client';

import { usePathname } from 'next/navigation';
import { ViewTransition, type ReactNode } from 'react';

/**
 * Troca de página com fade (rodada 3, 06/11/2026: "a navegação não pode ser seca"): a página que sai some rápido e a
 * nova aparece logo depois (classes `page-exit` e `page-enter` em motion.css). O layout não desmonta na navegação,
 * por isso a chave é o caminho da URL: cada página nova entra e a anterior sai. Os pares com nome dentro da página (a
 * foto do card que cresce até a peça, `product-morph`) continuam funcionando por cima. Sem suporte do navegador ou
 * com movimento reduzido, a troca é imediata.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <ViewTransition key={pathname} enter="page-enter" exit="page-exit" default="none">
      {children}
    </ViewTransition>
  );
}
