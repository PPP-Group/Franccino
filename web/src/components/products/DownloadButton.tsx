'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import type { Locale } from '@/i18n/config';
import { ApiError } from '@/lib/api/errors';
import { requestDownloadLink } from '@/lib/api/forms';
import type { DownloadFile } from '@/lib/api/types';
import { formatFileSize } from '@/lib/format/file-size';

type State = 'idle' | 'loading' | 'failed' | 'rateLimited' | 'unavailable';

export function DownloadButton({
  file,
  variant = 'card',
}: {
  file: DownloadFile;
  variant?: 'card' | 'link';
}) {
  const t = useTranslations('downloads');
  const locale = useLocale() as Locale;
  const [state, setState] = useState<State>('idle');

  async function handleClick() {
    setState('loading');
    try {
      const { url } = await requestDownloadLink(file.id);
      setState('idle');
      window.location.assign(url);
    } catch (error) {
      if (error instanceof ApiError && error.status === 429) {
        setState('rateLimited');
      } else if (error instanceof ApiError && error.status === 404) {
        setState('unavailable');
      } else {
        setState('failed');
      }
    }
  }

  const busy = state === 'loading';
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
      {message ? (
        <p className="download-error" role="alert">
          {message}
        </p>
      ) : null}
    </div>
  );
}
