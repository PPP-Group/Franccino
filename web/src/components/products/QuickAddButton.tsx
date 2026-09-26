'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import type { Locale } from '@/i18n/config';
import type { ProductCard } from '@/lib/api/types';
import { toQuoteSnapshot } from '@/lib/quote/snapshot';
import { quoteActions } from '@/lib/quote/store';
import { showToast } from '@/lib/ui/toast';

export type QuickAddVariant = 'plate' | 'table' | 'button';

const CLASS_BY_VARIANT: Record<QuickAddVariant, string> = {
  plate: 'quick-add',
  table: 'btn btn--ghost btn--compact',
  button: 'btn btn--ghost',
};

/** Adiciona 1 unidade sem acabamento escolhido ("a definir", conflito C2). */
export function QuickAddButton({
  product,
  variant = 'plate',
}: {
  product: ProductCard;
  variant?: QuickAddVariant;
}) {
  const t = useTranslations('quote');
  const locale = useLocale() as Locale;
  const [added, setAdded] = useState(false);

  function handleClick() {
    const status = quoteActions.add(toQuoteSnapshot(product, locale));
    if (status === 'full') {
      showToast({ text: t('listFull'), quoteLink: true });
      return;
    }
    setAdded(true);
    showToast({ text: t('addedPendingFinish', { name: product.name }), quoteLink: true });
  }

  const base = CLASS_BY_VARIANT[variant];
  return (
    <button
      type="button"
      className={added ? `${base} is-added` : base}
      aria-label={variant === 'button' ? undefined : t('quickAdd', { name: product.name })}
      onClick={handleClick}
    >
      <Icon name={added ? 'check' : 'plus'} />
      {variant === 'button' ? <span>{added ? t('inList') : t('addShort')}</span> : null}
    </button>
  );
}
