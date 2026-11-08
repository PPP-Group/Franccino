'use client';

import { useEffect } from 'react';

const SELECTOR = '[data-reveal]';

/** Variantes em que os filhos aparecem em sequência (o atraso de cada um vem de `--reveal-index`). */
const SEQUENCES = new Set(['stagger', 'curtain-stagger']);

/** Tempo máximo que a cortina espera a foto chegar antes de abrir mesmo assim (rede lenta). */
const CURTAIN_WAIT_MS = 2500;

/**
 * A cortina só abre com a foto pronta (retorno de 07/11/2026: abria sobre o tom de carregamento e a foto aparecia do
 * nada depois). Espera as fotos de dentro chegarem, com um limite.
 */
function whenImagesReady(element: Element, done: () => void) {
  const pending = Array.from(element.querySelectorAll('img')).filter(
    (img) => !img.complete || img.naturalWidth === 0,
  );
  if (pending.length === 0) {
    done();
    return;
  }
  let left = pending.length;
  let finished = false;
  const finish = () => {
    if (finished) return;
    finished = true;
    window.clearTimeout(timer);
    done();
  };
  const timer = window.setTimeout(finish, CURTAIN_WAIT_MS);
  pending.forEach((img) => {
    // Foto preguiçosa que já está perto da tela: pede agora, para não esperar o navegador decidir.
    img.loading = 'eager';
    const settle = () => {
      left -= 1;
      if (left === 0) {
        // Decodifica antes de abrir: a cortina corre sobre a foto pronta, sem piscar.
        void img
          .decode()
          .catch(() => undefined)
          .finally(finish);
      }
    };
    img.addEventListener('load', settle, { once: true });
    img.addEventListener('error', settle, { once: true });
  });
}

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
            const target = entry.target;
            io.unobserve(target);
            if ((target.getAttribute('data-reveal') ?? '').startsWith('curtain')) {
              whenImagesReady(target, () => target.classList.add('is-revealed'));
            } else {
              target.classList.add('is-revealed');
            }
          }
        }
      },
      // Sem limiar de área: uma grade alta (36 peças) nunca chegava a 12% à vista no topo e ficava em branco (07/11).
      { rootMargin: '0px 0px -8% 0px', threshold: 0 },
    );
    // As cortinas começam a baixar a foto um pouco antes de entrar na tela, para abrir sem esperar.
    const early = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.querySelectorAll('img[loading="lazy"]').forEach((img) => {
              (img as HTMLImageElement).loading = 'eager';
            });
            early.unobserve(entry.target);
          }
        }
      },
      { rootMargin: '600px 0px 600px 0px' },
    );
    // Cada bloco é observado uma vez. A varredura roda depois de cada mudança da página (num quadro), e não só nos nós
    // adicionados: o React às vezes insere o elemento e só depois põe o `data-reveal`, e a grade voltava em branco ao
    // trocar a tabela técnica pela grade (retorno de 07/11/2026).
    const tracked = new WeakSet<Element>();
    const watch = () => {
      document.querySelectorAll(`${SELECTOR}:not(.is-revealed)`).forEach((element) => {
        if (tracked.has(element)) return;
        tracked.add(element);
        prepare(element);
        io.observe(element);
        if ((element.getAttribute('data-reveal') ?? '').startsWith('curtain')) early.observe(element);
      });
    };
    watch();
    let frame = 0;
    const mo = new MutationObserver(() => {
      if (!frame) {
        frame = window.requestAnimationFrame(() => {
          frame = 0;
          watch();
        });
      }
    });
    mo.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['data-reveal'],
    });
    root.dataset.revealReady = '';
    return () => {
      window.cancelAnimationFrame(frame);
      io.disconnect();
      early.disconnect();
      mo.disconnect();
      delete root.dataset.revealReady;
    };
  }, []);
  return null;
}
