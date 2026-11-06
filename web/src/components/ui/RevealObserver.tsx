'use client';

import { useEffect } from 'react';

const SELECTOR = '[data-reveal]';

/** Variantes em que os filhos aparecem em sequência (o atraso de cada um vem de `--reveal-index`). */
const SEQUENCES = new Set(['stagger', 'curtain-stagger']);

function prepare(element: Element) {
  if (SEQUENCES.has(element.getAttribute('data-reveal') ?? '')) {
    Array.from(element.children).forEach((child, index) => {
      (child as HTMLElement).style.setProperty('--reveal-index', String(Math.min(index, 8)));
    });
  }
}

/**
 * Faz os blocos marcados com `data-reveal` aparecerem quando entram na tela, uma vez só (banco de ideias, ideia 04):
 * o texto sobe 20 px e ganha opacidade; `data-reveal="curtain"` abre a foto como uma cortina. `data-reveal="stagger"`
 * e `data-reveal="curtain-stagger"` num grupo fazem os filhos aparecerem em sequência (motion.css). Substitui a animação presa à
 * rolagem, que parava no meio quando a pessoa parava de rolar (retorno de 06/11/2026). Observa também o que entra
 * depois, na troca de página. Sem JavaScript, ou com movimento reduzido, tudo aparece pronto (motion.css).
 */
export function RevealObserver() {
  useEffect(() => {
    const root = document.documentElement;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            io.unobserve(entry.target);
          }
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.12 },
    );
    const watch = (scope: ParentNode) => {
      scope.querySelectorAll(`${SELECTOR}:not(.is-revealed)`).forEach((element) => {
        prepare(element);
        io.observe(element);
      });
    };
    watch(document);
    const mo = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        mutation.addedNodes.forEach((node) => {
          if (node instanceof Element) {
            if (node.matches(SELECTOR)) {
              prepare(node);
              io.observe(node);
            }
            watch(node);
          }
        });
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });
    root.dataset.revealReady = '';
    return () => {
      io.disconnect();
      mo.disconnect();
      delete root.dataset.revealReady;
    };
  }, []);
  return null;
}
