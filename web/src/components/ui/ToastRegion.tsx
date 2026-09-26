'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { Link } from '@/i18n/navigation';
import { onToast, type ToastData } from '@/lib/ui/toast';

const VISIBLE_MS = 3600;

/** Região única de avisos (role="status"), montada uma vez no layout. */
export function ToastRegion() {
  const t = useTranslations('quote');
  const [toast, setToast] = useState<ToastData | null>(null);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const off = onToast((next) => {
      setToast(next);
      clearTimeout(timer);
      timer = setTimeout(() => setToast(null), VISIBLE_MS);
    });
    return () => {
      off();
      clearTimeout(timer);
    };
  }, []);

  return (
    <div className={toast ? 'toast is-visible' : 'toast'} role="status" aria-live="polite">
      {toast ? <span>{toast.text}</span> : null}
      {toast?.quoteLink ? <Link href="/quote-list">{t('viewList')}</Link> : null}
    </div>
  );
}
