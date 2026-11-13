'use client';

import { useTranslations } from 'next-intl';
import { useRef, useState, type ReactNode } from 'react';

/**
 * Galeria longa com "Ver mais" (revisão de 13/11/2026: projeto e Fábrica). Fechada, os itens marcados com `is-extra`
 * pelo servidor ficam escondidos (sem salto ao hidratar); aberta, o "Ver menos" fica preso ao pé da tela enquanto a
 * galeria passa, e fechar volta ao começo dela.
 */
export function ShowMore({
  hidden,
  children,
  moreLabel,
  inline = false,
}: {
  hidden: number;
  children: ReactNode;
  /** Texto do botão fechado (padrão: "Ver mais N imagens"). */
  moreLabel?: string;
  /** Lista curta (os arquivos da peça): o botão logo abaixo, alinhado à esquerda, sem ficar preso ao pé da tela. */
  inline?: boolean;
}) {
  const t = useTranslations('gallery');
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  if (hidden <= 0) {
    return <>{children}</>;
  }

  function close() {
    setOpen(false);
    const top = root.current?.getBoundingClientRect().top ?? 0;
    if (top < 0) {
      root.current?.scrollIntoView({ block: 'start' });
    }
  }

  return (
    <div
      ref={root}
      className={['show-more', inline ? 'show-more--inline' : '', open ? 'is-open' : '']
        .filter(Boolean)
        .join(' ')}
    >
      {children}
      <div className="show-more__bar">
        <button
          type="button"
          className="btn btn--ghost btn--compact show-more__button"
          aria-expanded={open}
          onClick={open ? close : () => setOpen(true)}
        >
          {open ? t('less') : (moreLabel ?? t('more', { count: hidden }))}
        </button>
      </div>
    </div>
  );
}
