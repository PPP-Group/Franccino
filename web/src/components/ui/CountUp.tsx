'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { countAt, parseCountable } from '@/lib/ui/count-up';
import { useReducedMotion } from '@/lib/ui/use-reduced-motion';

const DURATION_MS = 1400;

/**
 * Número que conta até o valor quando entra na tela (banco de ideias, ideia 12). O HTML do servidor já traz o valor
 * final (sem JavaScript, para buscadores e para quem pediu menos movimento nada muda); o leitor de tela sempre lê o
 * valor final, nunca os quadros intermediários.
 */
export function CountUp({ value }: { value: string }) {
  const countable = useMemo(() => parseCountable(value), [value]);
  const reducedMotion = useReducedMotion();
  const ref = useRef<HTMLSpanElement | null>(null);
  const [shown, setShown] = useState<string | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element || !countable || reducedMotion) {
      return;
    }
    let frame = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) {
          return;
        }
        observer.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const progress = (now - start) / DURATION_MS;
          setShown(progress >= 1 ? null : countAt(countable, progress));
          if (progress < 1) {
            frame = requestAnimationFrame(tick);
          }
        };
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.6 },
    );
    observer.observe(element);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [countable, reducedMotion]);

  if (!countable) {
    return <>{value}</>;
  }
  return (
    <span ref={ref} className="count-up">
      <span aria-hidden="true">{shown ?? value}</span>
      <span className="visually-hidden">{value}</span>
    </span>
  );
}
