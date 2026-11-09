'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { Icon } from '@/components/ui/Icon';
import type { Locale } from '@/i18n/config';
import type { ProductCard } from '@/lib/api/types';
import { toQuoteSnapshot } from '@/lib/quote/snapshot';
import { quoteActions } from '@/lib/quote/store';
import { flyToQuote } from '@/lib/ui/fly-to-quote';
import { showToast } from '@/lib/ui/toast';

export type QuickAddVariant = 'plate' | 'table' | 'button';

/** O que o botão usa da peça (também serve ao card, que não tem todos os campos de `ProductCard`). */
export type QuickAddProduct = Pick<ProductCard, 'id' | 'slug' | 'name' | 'cover'>;

const CLASS_BY_VARIANT: Record<QuickAddVariant, string> = {
  plate: 'quick-add',
  table: 'btn btn--ghost btn--compact',
  button: 'btn btn--ghost',
};

/** Quanto tempo o botão mostra a confirmação ("Adicionada à lista") antes de voltar a "Na lista". */
const CONFIRM_MS = 1500;

/**
 * Adiciona 1 unidade sem acabamento escolhido ("a definir", conflito C2). Ao adicionar, o visto entra e, no botão com
 * texto, "Adicionada à lista" aparece por um instante (microinteração 12d, motion.css); depois fica "Na lista".
 */
export function QuickAddButton({
  product,
  variant = 'plate',
}: {
  product: QuickAddProduct;
  variant?: QuickAddVariant;
}) {
  const t = useTranslations('quote');
  const locale = useLocale() as Locale;
  const [added, setAdded] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    const status = quoteActions.add(toQuoteSnapshot(product, locale));
    if (status === 'full') {
      showToast({ text: t('listFull'), quoteLink: true });
      return;
    }
    // A foto da peça (no card, na linha da tabela ou no bloco) voa até a lista no cabeçalho.
    flyToQuote(event.currentTarget.closest('.plate, tr, section, article')?.querySelector('img'));
    setAdded(true);
    setConfirming(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setConfirming(false), CONFIRM_MS);
    showToast({ text: t('addedPendingFinish', { name: product.name }), quoteLink: true });
  }

  const base = CLASS_BY_VARIANT[variant];
  return (
    <button
      type="button"
      className={added ? `${base} is-added` : base}
      aria-label={
        variant === 'button'
          ? undefined
          : added
            ? t('inListNamed', { name: product.name })
            : t('quickAdd', { name: product.name })
      }
      onClick={handleClick}
    >
      <span className="add-icon" key={added ? 'check' : 'plus'}>
        <Icon name={added ? 'check' : 'plus'} />
      </span>
      {variant === 'button' ? (
        <span>{confirming ? t('addedToList') : added ? t('inList') : t('addShort')}</span>
      ) : null}
    </button>
  );
}
