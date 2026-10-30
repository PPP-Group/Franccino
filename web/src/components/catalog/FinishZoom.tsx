'use client';

import { useTranslations } from 'next-intl';
import { useRef, useState } from 'react';
import { ApiImage } from '@/components/media/ApiImage';
import { Icon } from '@/components/ui/Icon';
import type { Image } from '@/lib/api/types';

type FinishZoomProps = {
  name: string;
  code: string | null;
  description: string | null;
  swatch: Image;
  /**
   * `swatch`: a própria amostra é o botão (página Acabamentos). `link`: um "Ver em detalhe" discreto ao lado do
   * acabamento escolhido, na página da peça, onde a amostra pequena já é o botão de escolha.
   */
  variant?: 'swatch' | 'link';
};

/**
 * Amostra do acabamento que abre em detalhe (banco de ideias, ideia 9, retorno de 26/10/2026). No lugar de uma lupa
 * que segue o mouse, uma imagem fixa em alta qualidade: primeiro inteira, e com um clique no tamanho real, para
 * percorrer a textura rolando (no celular, com o dedo e o gesto de pinça). A imagem grande só é pedida ao abrir.
 */
export function FinishZoom({ name, code, description, swatch, variant = 'swatch' }: FinishZoomProps) {
  const t = useTranslations('finishes.zoom');
  const common = useTranslations('common');
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const [open, setOpen] = useState(false);
  const [actual, setActual] = useState(false);
  const titleId = `finish-zoom-${swatch.id}`;

  function show() {
    setActual(false);
    setOpen(true);
    dialogRef.current?.showModal();
  }

  return (
    <>
      {variant === 'link' ? (
        <button type="button" className="finish-zoom__open-link" onClick={show}>
          {t('detail')}
          <span className="visually-hidden"> {name}</span>
        </button>
      ) : (
        <button
          type="button"
          className="finish-card__swatch finish-card__open"
          onClick={show}
          aria-label={t('open', { name })}
        >
          <ApiImage image={swatch} sizes="(max-width: 35rem) 50vw, 180px" />
          <span className="finish-card__zoom-icon" aria-hidden="true">
            <Icon name="plus" />
          </span>
        </button>
      )}
      <dialog
        ref={dialogRef}
        className="finish-zoom"
        aria-labelledby={titleId}
        onClose={() => setOpen(false)}
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            dialogRef.current?.close();
          }
        }}
      >
        <div className="finish-zoom__panel">
          <div className="finish-zoom__head">
            <div>
              <h2 id={titleId} className="finish-zoom__title">
                {name}
              </h2>
              {code ? <p className="meta num">{code}</p> : null}
            </div>
            <button
              type="button"
              className="finish-zoom__close"
              aria-label={common('close')}
              onClick={() => dialogRef.current?.close()}
            >
              <Icon name="close" />
            </button>
          </div>
          <div className={actual ? 'finish-zoom__stage is-actual' : 'finish-zoom__stage'} tabIndex={0}>
            {open ? (
              <ApiImage image={swatch} sizes={actual ? '2560px' : '(max-width: 48rem) 100vw, 900px'} />
            ) : null}
          </div>
          <div className="finish-zoom__foot">
            {description ? <p className="meta">{description}</p> : <span />}
            <button
              type="button"
              className="btn btn--ghost"
              aria-pressed={actual}
              onClick={() => setActual((value) => !value)}
            >
              {actual ? t('fit') : t('actual')}
            </button>
          </div>
          {actual ? <p className="meta finish-zoom__hint">{t('hint')}</p> : null}
        </div>
      </dialog>
    </>
  );
}
