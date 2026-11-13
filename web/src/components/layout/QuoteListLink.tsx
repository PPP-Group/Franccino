'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import { Link } from '@/i18n/navigation';
import { useQuoteCount } from '@/lib/quote/hooks';
import { totalQuantity } from '@/lib/quote/list';
import { getQuoteItems, subscribeQuote } from '@/lib/quote/store';

/**
 * Quantas vezes a lista cresceu desde que a página abriu: muda só quando uma peça entra (nunca ao carregar a lista
 * salva nem ao tirar peças), para o ícone e o contador pulsarem uma vez (microinteração 12d, motion.css).
 */
function useGrowthPulse(): number {
  const [pulse, setPulse] = useState(0);
  useEffect(() => {
    let last = totalQuantity(getQuoteItems());
    return subscribeQuote(() => {
      const next = totalQuantity(getQuoteItems());
      if (next > last) {
        setPulse((value) => value + 1);
      }
      last = next;
    });
  }, []);
  return pulse;
}

export function QuoteListLink() {
  const t = useTranslations('header');
  const count = useQuoteCount();
  const pulse = useGrowthPulse();
  // A `key` remonta o ícone e o contador a cada peça nova, para a animação recomeçar.
  const pulsing = pulse > 0 ? '' : undefined;
  return (
    <Link href="/quote-list" aria-label={t('quoteList', { count })}>
      <span key={`icon-${pulse}`} className="list-icon" data-pulse={pulsing} data-quote-target="">
        <Icon name="bag" />
      </span>
      <span className="label-optional" aria-hidden="true">
        {t('quoteListShort')}
      </span>
      <span
        key={`count-${pulse}`}
        className="list-count num"
        data-empty={count === 0}
        data-pulse={pulsing}
        aria-hidden="true"
      >
        {count}
      </span>
    </Link>
  );
}
