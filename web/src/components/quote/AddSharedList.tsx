'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';
import { Link } from '@/i18n/navigation';
import type { Locale } from '@/i18n/config';
import type { SharedList } from '@/lib/api/types';
import { toQuoteSnapshot } from '@/lib/quote/snapshot';
import { quoteActions } from '@/lib/quote/store';

/** "Adicionar à minha lista": copia a lista recebida para a lista de desejos deste navegador. */
export function AddSharedList({ items }: { items: SharedList['items'] }) {
  const t = useTranslations('sharedList');
  const locale = useLocale() as Locale;
  const [added, setAdded] = useState(false);

  if (added) {
    return (
      <Link className="btn" href="/quote-list">
        {t('openMine')}
      </Link>
    );
  }

  return (
    <button
      type="button"
      className="btn"
      onClick={() => {
        for (const item of items) {
          const finishes = item.finishes.map((finish) => ({ ...finish, group: '' }));
          quoteActions.add({
            ...toQuoteSnapshot(item.product, locale, finishes),
            quantity: item.quantity,
            ...(item.note ? { note: item.note } : {}),
          });
        }
        setAdded(true);
      }}
    >
      {t('addAll')}
    </button>
  );
}
