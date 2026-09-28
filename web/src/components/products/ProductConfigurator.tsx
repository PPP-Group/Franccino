'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Icon } from '@/components/ui/Icon';
import { QuantityStepper } from '@/components/ui/QuantityStepper';
import type { Locale } from '@/i18n/config';
import { Link } from '@/i18n/navigation';
import type { ProductCard, ProductDetail } from '@/lib/api/types';
import { whatsappUrl } from '@/lib/contact-links';
import {
  initialSelection,
  pendingGroups,
  selectedFinishes,
  selectFinish,
  type FinishSelection,
} from '@/lib/product/finish-selection';
import { useQuoteCount } from '@/lib/quote/hooks';
import { formatFinishes } from '@/lib/quote/message';
import { toQuoteSnapshot } from '@/lib/quote/snapshot';
import { quoteActions } from '@/lib/quote/store';
import { FinishSelector } from './FinishSelector';

export type ConfiguratorProduct = ProductCard & Pick<ProductDetail, 'finishes'>;

type ProductConfiguratorProps = {
  product: ConfiguratorProduct;
  whatsapp: string | null;
  finishesNote: string | null;
  /** Conteúdo entre acabamentos e orçamento (medidas, na página de produto). */
  children?: ReactNode;
};

type Feedback = { kind: 'added' | 'full'; text: string };

export function ProductConfigurator({ product, whatsapp, finishesNote, children }: ProductConfiguratorProps) {
  const t = useTranslations('product');
  const q = useTranslations('quote');
  const common = useTranslations('common');
  const locale = useLocale() as Locale;
  const count = useQuoteCount();
  const [selection, setSelection] = useState<FinishSelection>(() => initialSelection(product.finishes));
  const [quantity, setQuantity] = useState(1);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [justAdded, setJustAdded] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const finishes = selectedFinishes(product.finishes, selection);
  const pending = pendingGroups(product.finishes, selection);
  const summary = formatFinishes(finishes, q('pendingFinish'));
  const whatsappHref = whatsappUrl(
    whatsapp,
    t('whatsappText', { quantity, name: product.name, finishes: summary }),
  );

  function handleAdd() {
    const status = quoteActions.add({ ...toQuoteSnapshot(product, locale, finishes), quantity });
    if (status === 'full') {
      setFeedback({ kind: 'full', text: q('listFull') });
      return;
    }
    setFeedback({ kind: 'added', text: t('added', { quantity, name: product.name, finishes: summary }) });
    setJustAdded(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setJustAdded(false), 2400);
  }

  return (
    <>
      {product.finishes.length > 0 ? (
        <FinishSelector
          groups={product.finishes}
          selection={selection}
          onSelect={(group, id) => setSelection((current) => selectFinish(current, group, id))}
          note={finishesNote}
        />
      ) : null}

      {children}

      <section className="buy block" aria-label={t('buyLabel')}>
        {pending.length > 0 ? (
          <p className="meta">{t('pendingHint', { groups: pending.join(', ') })}</p>
        ) : null}
        <div className="buy__row">
          <QuantityStepper value={quantity} onChange={setQuantity} label={t('quantity')} />
          <button type="button" className={justAdded ? 'btn is-added' : 'btn'} onClick={handleAdd}>
            <Icon name={justAdded ? 'check' : 'list'} />
            <span>{justAdded ? t('inList') : t('addToList')}</span>
          </button>
        </div>
        <div className="buy__secondary">
          {whatsappHref ? (
            <a className="btn btn--ghost" href={whatsappHref} target="_blank" rel="noopener noreferrer">
              <Icon name="chat" />
              <span>{t('whatsapp')}</span>
              <span className="visually-hidden">{common('opensInNewWindow')}</span>
            </a>
          ) : null}
          <Link className="btn btn--ghost" href="/stores">
            <Icon name="pin" />
            <span>{t('whereToBuy')}</span>
          </Link>
        </div>
        <p className={feedback?.kind === 'full' ? 'feedback feedback--alert' : 'feedback'} role="status">
          {feedback ? <span>{feedback.text}</span> : null}
          {feedback?.kind === 'added' ? (
            <Link href="/quote-list">{q('viewListCount', { count })}</Link>
          ) : null}
        </p>
      </section>
    </>
  );
}
