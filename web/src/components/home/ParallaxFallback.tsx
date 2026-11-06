'use client';

import { useEffect } from 'react';
import { useReducedMotion } from '@/lib/ui/use-reduced-motion';

/**
 * Paralaxe da home (ideia 04) nos navegadores sem `animation-timeline` (Firefox): escreve em cada bloco
 * `[data-parallax]` visível o quanto ele já passou pela tela (`--parallax-progress`, de 0 a 1) e marca
 * `data-parallax-js` no <html>; o movimento em si (só `translate`) fica em motion.css. Onde o CSS dá conta sozinho,
 * ou para quem pediu menos movimento, não faz nada.
 */
export function ParallaxFallback() {
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion || typeof CSS === 'undefined' || CSS.supports('animation-timeline: view()')) {
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
        const progress = Math.min(1, Math.max(0, (viewport - box.top) / (viewport + box.height)));
        block.style.setProperty('--parallax-progress', progress.toFixed(4));
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
      { rootMargin: '20% 0px' },
    );
    blocks.forEach((block) => observer.observe(block));
    document.documentElement.dataset.parallaxJs = '';
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      if (frame !== 0) window.cancelAnimationFrame(frame);
      delete document.documentElement.dataset.parallaxJs;
      blocks.forEach((block) => block.style.removeProperty('--parallax-progress'));
    };
  }, [reducedMotion]);

  return null;
}
