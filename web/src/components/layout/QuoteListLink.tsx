'use client';

import { useTranslations } from 'next-intl';
import { Icon } from '@/components/ui/Icon';
import { Link } from '@/i18n/navigation';
import { useQuoteCount } from '@/lib/quote/hooks';

export function QuoteListLink() {
  const t = useTranslations('header');
  const count = useQuoteCount();
  return (
    <Link href="/quote-list" aria-label={t('quoteList', { count })}>
      <Icon name="list" />
      <span className="label-optional" aria-hidden="true">
        {t('quoteListShort')}
      </span>
      {/* key: remonta o contador a cada mudança para reiniciar a animação de destaque. */}
      <span key={count} className="list-count num" data-empty={count === 0} aria-hidden="true">
        {count}
      </span>
    </Link>
  );
}
