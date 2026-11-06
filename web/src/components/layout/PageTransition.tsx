'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useLayoutEffect, useRef, type ReactNode } from 'react';
import { installNavigationMotion, onRouteCommit } from './navigation-motion';

/**
 * Movimento da navegação (retorno de 06/11/2026). Não há mais fade entre páginas: trocar de uma listagem para outra é
 * imediato. Só a abertura de uma peça, coleção, projeto ou linha anima, com a foto crescendo do card até a página e
 * encolhendo de volta (`MorphImage`, `lib/ui/morph.ts`, motion.css). Este componente instala o controle da navegação
 * (`navigation-motion.ts`: rolagem devolvida na hora, volta do navegador animada, caminho que vira "voltar") e avisa a
 * cada troca de página, no mesmo quadro, antes da foto do movimento. Não desenha nada.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const mounted = useRef(false);

  useEffect(() => {
    installNavigationMotion();
  }, []);

  useLayoutEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    onRouteCommit();
  }, [pathname]);

  return children;
}
