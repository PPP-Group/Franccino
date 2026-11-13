'use client';

import { useTranslations } from 'next-intl';
import { useRef, type ReactNode } from 'react';
import { Icon } from '@/components/ui/Icon';

/**
 * Miniaturas embaixo do texto e "Ver imagens", que abre a galeria inteira numa janela (revisão de 13/11/2026: na
 * coleção, as peças vêm logo depois da introdução, e a galeria fica a um clique). A miniatura clicada abre a janela
 * já na foto dela (`data-gallery-index` na galeria).
 */
export function GalleryDialog({
  title,
  count,
  previews,
  children,
}: {
  title: string;
  count: number;
  previews: ReactNode[];
  children: ReactNode;
}) {
  const t = useTranslations('gallery');
  const dialog = useRef<HTMLDialogElement>(null);

  function open(index: number) {
    const element = dialog.current;
    if (!element) return;
    element.showModal();
    const target = element.querySelector<HTMLElement>(`[data-gallery-index="${index}"]`);
    if (index > 0 && target) {
      target.scrollIntoView({ block: 'start' });
    } else {
      element.scrollTop = 0;
    }
  }

  return (
    <div className="gallery-peek">
      <ul className="gallery-peek__thumbs">
        {previews.map((preview, index) => (
          <li key={index}>
            <button type="button" onClick={() => open(index)} aria-label={t('openAt', { index: index + 1 })}>
              {preview}
            </button>
          </li>
        ))}
      </ul>
      <button type="button" className="link-arrow gallery-peek__open" onClick={() => open(0)}>
        {t('open', { count })}
      </button>
      <dialog
        ref={dialog}
        className="gallery-dialog"
        aria-label={title}
        onClick={(event) => {
          if (event.target === event.currentTarget) event.currentTarget.close();
        }}
      >
        <div className="gallery-dialog__bar">
          <p className="gallery-dialog__title">{title}</p>
          <button
            type="button"
            className="gallery-dialog__close"
            aria-label={t('close')}
            onClick={() => dialog.current?.close()}
          >
            <Icon name="close" />
          </button>
        </div>
        <div className="gallery-dialog__body">{children}</div>
      </dialog>
    </div>
  );
}
