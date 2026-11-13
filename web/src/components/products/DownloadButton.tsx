'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';
import { DownloadLeadDialog } from '@/components/downloads/DownloadLeadDialog';
import { Icon } from '@/components/ui/Icon';
import type { Locale } from '@/i18n/config';
import { ApiError } from '@/lib/api/errors';
import { requestDownloadLink } from '@/lib/api/forms';
import type { DownloadFile } from '@/lib/api/types';
import { clearLeadToken, readLeadToken, saveLeadToken } from '@/lib/downloads/lead-token';
import { formatFileSize } from '@/lib/format/file-size';

type State = 'idle' | 'loading' | 'failed' | 'rateLimited' | 'unavailable';

export function DownloadButton({
  file,
  variant = 'card',
  label,
}: {
  file: DownloadFile;
  /** `program`: botão com o nome do programa (SketchUp, AutoCAD), na seção "Integre ao seu projeto". */
  variant?: 'card' | 'link' | 'program';
  label?: string;
}) {
  const t = useTranslations('downloads');
  const locale = useLocale() as Locale;
  const [state, setState] = useState<State>('idle');
  // Cadastro antes do primeiro download (revisão da Franccino, item 22): sem token guardado, abre o formulário.
  const [asking, setAsking] = useState(false);

  function handleClick() {
    const token = readLeadToken();
    if (token) {
      void download(token);
    } else {
      setAsking(true);
    }
  }

  async function download(token: string) {
    setState('loading');
    try {
      const { url } = await requestDownloadLink(file.id, token);
      setState('idle');
      window.location.assign(url);
    } catch (error) {
      if (error instanceof ApiError && error.status === 422) {
        // Cadastro vencido (apagado pela retenção): pede de novo.
        clearLeadToken();
        setState('idle');
        setAsking(true);
      } else if (error instanceof ApiError && error.status === 429) {
        setState('rateLimited');
      } else if (error instanceof ApiError && error.status === 404) {
        setState('unavailable');
      } else {
        setState('failed');
      }
    }
  }

  const busy = state === 'loading';
  const dialog = asking ? (
    <DownloadLeadDialog
      onClose={() => setAsking(false)}
      onDone={(token) => {
        saveLeadToken(token);
        setAsking(false);
        void download(token);
      }}
    />
  ) : null;
  const message =
    state === 'failed'
      ? t('failed')
      : state === 'rateLimited'
        ? t('rateLimited')
        : state === 'unavailable'
          ? t('unavailable')
          : null;

  if (variant === 'link') {
    return (
      <span className="download-link">
        <button
          type="button"
          className="file-link"
          onClick={handleClick}
          disabled={busy}
          aria-busy={busy}
          aria-label={t('linkLabel', { title: file.title, format: file.format })}
        >
          {file.format}
        </button>
        {dialog}
        {message ? (
          <span className="download-error" role="alert">
            {message}
          </span>
        ) : null}
      </span>
    );
  }

  if (variant === 'program') {
    return (
      <span className="download-link">
        <button
          type="button"
          className="btn btn--ghost tech-library__button"
          onClick={handleClick}
          disabled={busy}
          aria-busy={busy}
          aria-label={t('linkLabel', { title: file.title, format: file.format })}
        >
          <Icon name="download" />
          <span>{label ?? file.format}</span>
        </button>
        {dialog}
        {message ? (
          <span className="download-error" role="alert">
            {message}
          </span>
        ) : null}
      </span>
    );
  }

  const size = file.size ? formatFileSize(file.size, locale) : null;
  return (
    <div className="download">
      <button type="button" onClick={handleClick} disabled={busy} aria-busy={busy}>
        <Icon name="download" />
        <strong>{file.title}</strong>
        <small>{size ? t('formatAndSize', { format: file.format, size }) : file.format}</small>
      </button>
      {dialog}
      {message ? (
        <p className="download-error" role="alert">
          {message}
        </p>
      ) : null}
    </div>
  );
}
