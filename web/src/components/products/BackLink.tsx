'use client';

import { useTranslations } from 'next-intl';
import { Icon } from '@/components/ui/Icon';
import { cameFromSite } from '@/components/layout/navigation-motion';
import { Link, type AppHref } from '@/i18n/navigation';

/**
 * "Voltar" no alto da página da peça (revisão da Franccino, 18/11/2026). Quem veio de uma página do próprio site volta
 * para ela pelo histórico (a lista volta na mesma altura e a foto encolhe até o card); quem chegou de fora (Google,
 * link direto) vai para a lista da categoria da peça.
 */
export function BackLink({ fallback }: { fallback: AppHref }) {
  const t = useTranslations('product');
  return (
    <Link
      className="back-link"
      href={fallback}
      onClick={(event) => {
        if (cameFromSite() && window.history.length > 1) {
          event.preventDefault();
          window.history.back();
        }
      }}
    >
      <Icon name="arrow" className="back-link__arrow" />
      <span>{t('back')}</span>
    </Link>
  );
}
