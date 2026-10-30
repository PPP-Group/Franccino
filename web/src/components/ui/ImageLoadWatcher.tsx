'use client';

import { useEffect } from 'react';

function mark(image: HTMLImageElement) {
  image.dataset.loaded = '';
}

/**
 * Marca cada `<img>` que terminou de carregar (`data-loaded`), para a faixa de carregamento dos cards (motion.css)
 * sumir na hora certa sem tornar `ApiImage` um componente de cliente. Escuta o `load` na fase de captura, que pega
 * também as fotos que entram depois (paginação, navegação). Não desenha nada.
 */
export function ImageLoadWatcher() {
  useEffect(() => {
    const root = document.documentElement;
    const onDone = (event: Event) => {
      if (event.target instanceof HTMLImageElement) {
        mark(event.target);
      }
    };
    document.querySelectorAll('img').forEach((image) => {
      if (image.complete) {
        mark(image);
      }
    });
    document.addEventListener('load', onDone, true);
    document.addEventListener('error', onDone, true);
    root.dataset.imageWatch = '';
    return () => {
      document.removeEventListener('load', onDone, true);
      document.removeEventListener('error', onDone, true);
      delete root.dataset.imageWatch;
    };
  }, []);
  return null;
}
