'use client';

import { useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { useTranslations } from 'next-intl';

type ClampedTextProps = {
  /** Linhas visíveis antes do "Ver mais". */
  lines: number;
  children: ReactNode;
  className?: string;
};

/**
 * Texto longo recolhido em poucas linhas, com "Ver mais" e "Ver menos" (retorno de 17/11/2026: a descrição e os
 * materiais da peça ocupavam a primeira tela). O corte já vem do servidor (sem pulo ao carregar); o botão só
 * aparece quando o texto passa das linhas. Sem JavaScript, o texto aparece inteiro (`@media (scripting: none)`).
 */
export function ClampedText({ lines, children, className }: ClampedTextProps) {
  const t = useTranslations('product');
  const id = useId();
  const bodyRef = useRef<HTMLDivElement>(null);
  const [overflows, setOverflows] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const body = bodyRef.current;
    if (!body) return;
    const measure = () => {
      if (body.dataset.open === 'true') return;
      setOverflows(body.scrollHeight > body.clientHeight + 2);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(body);
    return () => observer.disconnect();
  }, []);

  return (
    <div className={className ? `clamped ${className}` : 'clamped'}>
      <div
        ref={bodyRef}
        id={id}
        className="clamped__body"
        data-open={open}
        data-overflows={overflows}
        style={{ '--clamp-lines': lines } as CSSProperties}
      >
        {children}
      </div>
      {overflows ? (
        <button
          type="button"
          className="clamped__toggle"
          aria-expanded={open}
          aria-controls={id}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? t('readLess') : t('readMore')}
        </button>
      ) : null}
    </div>
  );
}
