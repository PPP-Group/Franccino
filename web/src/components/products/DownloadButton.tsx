'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ApiError } from '@/lib/api/errors';
import { requestDownloadLink } from '@/lib/api/forms';

type Status = 'idle' | 'loading' | 'error' | 'rateLimited';

type DownloadButtonProps = {
  fileId: number;
};

export function DownloadButton({ fileId }: DownloadButtonProps) {
  const t = useTranslations('products');
  const tForms = useTranslations('forms');
  const [status, setStatus] = useState<Status>('idle');

  async function handleClick() {
    setStatus('loading');
    try {
      const { url } = await requestDownloadLink(fileId);
      window.location.href = url;
      setStatus('idle');
    } catch (error) {
      setStatus(error instanceof ApiError && error.status === 429 ? 'rateLimited' : 'error');
    }
  }

  return (
    <span>
      <button type="button" onClick={handleClick} disabled={status === 'loading'}>
        {status === 'loading' ? t('downloadPreparing') : t('download')}
      </button>
      {status === 'error' && <span role="alert">{t('downloadError')}</span>}
      {status === 'rateLimited' && <span role="alert">{tForms('rateLimited')}</span>}
    </span>
  );
}
