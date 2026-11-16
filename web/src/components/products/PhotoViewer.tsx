'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useRef, type PointerEvent } from 'react';
import { ApiImage } from '@/components/media/ApiImage';
import { Icon } from '@/components/ui/Icon';
import type { Image } from '@/lib/api/types';
import { stepIndex } from '@/lib/product/gallery';

/** Distância mínima de um arrasto horizontal (toque) para trocar de foto, em px. */
const SWIPE_PX = 48;

type PhotoViewerProps = {
  images: Image[];
  index: number;
  open: boolean;
  title: string;
  onIndexChange: (index: number) => void;
  onClose: () => void;
};

/**
 * A foto da peça em tela cheia (retorno de 16/11/2026: clicar na foto da página da peça a mostra bem maior). Janela
 * nativa (`<dialog>`, Esc fecha), uma foto por vez, setas dos lados e as setas do teclado; no celular, arrastar para o
 * lado troca de foto. A foto nunca passa do tamanho que tem de verdade, para não ficar borrada.
 */
export function PhotoViewer({ images, index, open, title, onIndexChange, onClose }: PhotoViewerProps) {
  const t = useTranslations('product.stage');
  const dialog = useRef<HTMLDialogElement>(null);
  const swipe = useRef<number | null>(null);
  const current = images[index] ?? null;
  const many = images.length > 1;

  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    if (open && !element.open) element.showModal();
    if (!open && element.open) element.close();
  }, [open]);

  useEffect(() => {
    if (!open || !many) return undefined;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') onIndexChange(stepIndex(index, 1, images.length));
      if (event.key === 'ArrowLeft') onIndexChange(stepIndex(index, -1, images.length));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, many, index, images.length, onIndexChange]);

  function onPointerDown(event: PointerEvent) {
    if (event.pointerType === 'touch') swipe.current = event.clientX;
  }

  function onPointerUp(event: PointerEvent) {
    const start = swipe.current;
    swipe.current = null;
    if (start === null || !many) return;
    const dx = event.clientX - start;
    if (Math.abs(dx) >= SWIPE_PX) onIndexChange(stepIndex(index, dx < 0 ? 1 : -1, images.length));
  }

  return (
    <dialog
      ref={dialog}
      className="gallery-dialog photo-viewer"
      aria-label={title}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="gallery-dialog__bar">
        <p className="gallery-dialog__title">
          {title}
          {many ? (
            <span className="photo-viewer__count num">
              {t('count', { index: index + 1, total: images.length })}
            </span>
          ) : null}
        </p>
        <button
          type="button"
          className="gallery-dialog__close"
          aria-label={t('closeViewer')}
          onClick={onClose}
        >
          <Icon name="close" />
        </button>
      </div>
      <div className="photo-viewer__stage" onPointerDown={onPointerDown} onPointerUp={onPointerUp}>
        {open && current ? (
          <ApiImage key={current.id} image={current} sizes="100vw" priority className="photo-viewer__img" />
        ) : null}
        {many ? (
          <>
            <button
              type="button"
              className="photo-arrow is-prev"
              aria-label={t('previousImage')}
              onClick={() => onIndexChange(stepIndex(index, -1, images.length))}
            >
              <Icon name="arrow" />
            </button>
            <button
              type="button"
              className="photo-arrow is-next"
              aria-label={t('nextImage')}
              onClick={() => onIndexChange(stepIndex(index, 1, images.length))}
            >
              <Icon name="arrow" />
            </button>
          </>
        ) : null}
      </div>
    </dialog>
  );
}
