'use client';

import { useEffect } from 'react';
import { useReducedMotion } from '@/lib/ui/use-reduced-motion';
import { parallaxShift } from '@/lib/ui/parallax';

/**
 * Paralaxe (ideia 04) em todos os navegadores: escreve em cada bloco `[data-parallax]` perto da tela a posição dele
 * na passagem (`--parallax-shift`, de -1 a 1) e marca `data-parallax-on` no <html>; o movimento (só `translate`) fica
 * em motion.css. Antes era CSS puro (`animation-timeline`), que não andava no Safari sem suporte e brigava com a
 * animação de carregamento das fotos. Para quem pediu menos movimento, não faz nada.
 */
export function Parallax() {
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) {
      return;
    }
    const blocks = Array.from(document.querySelectorAll<HTMLElement>('[data-parallax]'));
    if (blocks.length === 0) {
      return;
    }
    const visible = new Set<HTMLElement>();
    let frame = 0;

    function update() {
      frame = 0;
      const viewport = window.innerHeight;
      for (const block of visible) {
        const box = block.getBoundingClientRect();
        block.style.setProperty('--parallax-shift', parallaxShift(box.top, box.height, viewport).toFixed(4));
      }
    }

    function schedule() {
      if (frame === 0) {
        frame = window.requestAnimationFrame(update);
      }
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const block = entry.target as HTMLElement;
          if (entry.isIntersecting) visible.add(block);
          else visible.delete(block);
        }
        schedule();
      },
      { rootMargin: '25% 0px' },
    );
    blocks.forEach((block) => observer.observe(block));
    document.documentElement.dataset.parallaxOn = '';
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      if (frame !== 0) window.cancelAnimationFrame(frame);
      delete document.documentElement.dataset.parallaxOn;
      blocks.forEach((block) => block.style.removeProperty('--parallax-shift'));
    };
  }, [reducedMotion]);

  return null;
}
