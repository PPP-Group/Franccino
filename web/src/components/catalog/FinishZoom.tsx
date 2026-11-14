'use client';

import { useTranslations } from 'next-intl';
import { useRef, useState } from 'react';
import { flushSync } from 'react-dom';
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

type StartViewTransition = (update: () => Promise<void> | void) => ViewTransition;

const MORPH = 'finish-zoom';
const PANEL = 'finish-zoom-panel';
const IMAGE_WAIT_MS = 600;

function waitForImage(image: HTMLImageElement | null | undefined): Promise<unknown> {
  if (!image || (image.complete && image.naturalWidth > 0)) {
    return image ? image.decode().catch(() => undefined) : Promise.resolve();
  }
  return Promise.race([
    new Promise((resolve) => {
      image.addEventListener('load', resolve, { once: true });
      image.addEventListener('error', resolve, { once: true });
    }),
    new Promise((resolve) => window.setTimeout(resolve, IMAGE_WAIT_MS)),
  ]);
}

/**
 * Amostra do acabamento que abre em detalhe (banco de ideias, ideia 9). A janela fica no meio da tela, e a amostra
 * cresce até a imagem grande ao abrir e encolhe de volta ao fechar (retorno de 13/11/2026: a janela abria colada no canto
 * de cima e aparecia de uma vez; o "tamanho real" ampliava a foto e a deixava borrada, e saiu). A imagem grande só é
 * pedida ao abrir.
 */
export function FinishZoom({ name, code, description, swatch, variant = 'swatch' }: FinishZoomProps) {
  const t = useTranslations('finishes.zoom');
  const common = useTranslations('common');
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const swatchRef = useRef<HTMLSpanElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const titleId = `finish-zoom-${swatch.id}`;

  /** Troca com a amostra crescendo até a janela (ou voltando), quando o navegador tem o movimento entre estados. */
  function morph(update: () => void, opening: boolean) {
    const doc = document as Document & { startViewTransition?: StartViewTransition };
    const from = opening ? swatchRef.current : stageRef.current;
    const to = opening ? stageRef.current : swatchRef.current;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!doc.startViewTransition || reduce || !from || !to || variant !== 'swatch') {
      update();
      return;
    }
    const panel = dialogRef.current;
    from.style.viewTransitionName = MORPH;
    if (panel && !opening) panel.style.viewTransitionName = PANEL;
    const transition = doc.startViewTransition(async () => {
      from.style.viewTransitionName = '';
      if (panel) panel.style.viewTransitionName = '';
      flushSync(update);
      to.style.viewTransitionName = MORPH;
      if (panel && opening) panel.style.viewTransitionName = PANEL;
      if (opening) await waitForImage(to.querySelector('img'));
    });
    void transition.finished.finally(() => {
      from.style.viewTransitionName = '';
      to.style.viewTransitionName = '';
      if (panel) panel.style.viewTransitionName = '';
    });
  }

  function show() {
    morph(() => {
      setOpen(true);
      dialogRef.current?.showModal();
    }, true);
  }

  function hide() {
    morph(() => dialogRef.current?.close(), false);
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
          <span ref={swatchRef} className="finish-card__swatch-image">
            <ApiImage image={swatch} sizes="(max-width: 35rem) 46vw, 260px" />
          </span>
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
        onCancel={(event) => {
          // Esc: fecha com o movimento de volta.
          event.preventDefault();
          hide();
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            hide();
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
            <button type="button" className="finish-zoom__close" aria-label={common('close')} onClick={hide}>
              <Icon name="close" />
            </button>
          </div>
          <div ref={stageRef} className="finish-zoom__stage">
            {open ? <ApiImage image={swatch} sizes="(max-width: 48rem) 100vw, 900px" fade={false} /> : null}
          </div>
          {description ? <p className="meta finish-zoom__description">{description}</p> : null}
        </div>
      </dialog>
    </>
  );
}
