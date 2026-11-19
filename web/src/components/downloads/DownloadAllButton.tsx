'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import { DownloadLeadDialog } from '@/components/downloads/DownloadLeadDialog';
import { Icon } from '@/components/ui/Icon';
import { ApiError } from '@/lib/api/errors';
import { requestCollectionZip } from '@/lib/api/forms';
import { clearLeadToken, readLeadToken, saveLeadToken } from '@/lib/downloads/lead-token';

type State = 'idle' | 'preparing' | 'failed' | 'rateLimited';

/** Intervalo entre as perguntas enquanto o zip é montado, e o máximo de perguntas (cerca de 3 minutos). */
const POLL_MS = 6000;
const MAX_POLLS = 30;

/**
 * "Baixar todos os arquivos" no fim dos downloads de uma coleção (revisão da Franccino, 18/11/2026): pede o mesmo
 * cadastro dos outros downloads e baixa um zip com os arquivos de todas as peças. Na primeira vez o zip é montado na
 * hora (alguns minutos com blocos grandes): o botão mostra "Preparando…" e o download começa sozinho quando fica pronto.
 */
export function DownloadAllButton({ collectionSlug }: { collectionSlug: string }) {
  const t = useTranslations('downloads.all');
  const locale = useLocale();
  const [state, setState] = useState<State>('idle');
  const [asking, setAsking] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    },
    [],
  );

  async function attempt(token: string, polls: number) {
    try {
      const result = await requestCollectionZip(collectionSlug, locale, token);
      if (result.status === 'ready') {
        setState('idle');
        window.location.assign(result.url);
        return;
      }
      setState('preparing');
      if (polls >= MAX_POLLS) {
        setState('failed');
        return;
      }
      timer.current = window.setTimeout(() => void attempt(token, polls + 1), POLL_MS);
    } catch (error) {
      if (error instanceof ApiError && error.status === 422) {
        clearLeadToken();
        setState('idle');
        setAsking(true);
      } else if (error instanceof ApiError && error.status === 429) {
        setState('rateLimited');
      } else {
        setState('failed');
      }
    }
  }

  function start() {
    const token = readLeadToken();
    if (token) {
      setState('preparing');
      void attempt(token, 0);
    } else {
      setAsking(true);
    }
  }

  const busy = state === 'preparing';
  return (
    <div className="download-all">
      <button type="button" className="btn btn--ghost" onClick={start} disabled={busy} aria-busy={busy}>
        <Icon name="download" />
        <span>{busy ? t('preparing') : t('button')}</span>
      </button>
      {busy ? <p className="meta">{t('wait')}</p> : null}
      {state === 'failed' ? (
        <p className="download-error" role="alert">
          {t('failed')}
        </p>
      ) : null}
      {state === 'rateLimited' ? (
        <p className="download-error" role="alert">
          {t('rateLimited')}
        </p>
      ) : null}
      {asking ? (
        <DownloadLeadDialog
          onClose={() => setAsking(false)}
          onDone={(token) => {
            saveLeadToken(token);
            setAsking(false);
            setState('preparing');
            void attempt(token, 0);
          }}
        />
      ) : null}
    </div>
  );
}
