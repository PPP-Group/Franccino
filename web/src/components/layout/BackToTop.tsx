'use client';

import { useTranslations } from 'next-intl';
import { Icon } from '@/components/ui/Icon';

/**
 * Seta "Topo" no canto inferior direito, no fim de cada página (revisão da Franccino, 12/11/2026, como no
 * viccarbe.com): volta ao topo de uma vez, sem rolagem animada, e o cabeçalho reaparece (o BootScript tira o
 * `data-header-hide` no topo).
 */
export function BackToTop() {
  const t = useTranslations('footer');
  return (
    <button
      type="button"
      className="back-to-top"
      aria-label={t('backToTopLabel')}
      onClick={() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        document.documentElement.removeAttribute('data-header-hide');
      }}
    >
      <Icon name="arrow" className="back-to-top__arrow" />
      <span className="back-to-top__label" aria-hidden="true">
        {t('backToTop')}
      </span>
    </button>
  );
}
