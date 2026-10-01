'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useSyncExternalStore } from 'react';
import type { Locale } from '@/i18n/config';
import { Link } from '@/i18n/navigation';
import { recordConsent } from '@/lib/api/forms';
import { loadGtm } from '@/lib/consent/gtm';
import {
  COOKIE_POLICY_VERSION,
  getConsent,
  getServerConsent,
  setConsent,
  subscribeConsent,
  type ConsentChoice,
} from '@/lib/consent/store';
import { getPublicEnv } from '@/lib/env';
import { useIsClient } from '@/lib/ui/use-is-client';

/**
 * Aviso de cookies (Anexo I e LGPD): "Aceitar" e "Recusar" com o mesmo peso, Tag Manager só depois do
 * aceite, escolha registrada na API (`POST /consents`). Sem `NEXT_PUBLIC_GTM_ID` não há o que consentir
 * e o aviso não aparece. Só monta no navegador, sem piscar na primeira pintura.
 */
export function ConsentBanner() {
  const t = useTranslations('consent');
  const locale = useLocale() as Locale;
  const isClient = useIsClient();
  const gtmId = getPublicEnv().NEXT_PUBLIC_GTM_ID ?? null;
  const consent = useSyncExternalStore(subscribeConsent, getConsent, getServerConsent);

  useEffect(() => {
    if (gtmId && consent === 'granted') {
      loadGtm(gtmId);
    }
  }, [gtmId, consent]);

  if (!isClient || !gtmId || consent !== null) {
    return null;
  }

  const choose = (choice: ConsentChoice) => {
    const visitorId = setConsent(choice);
    // O registro é prova, não condição: falha de rede não trava o site.
    void recordConsent({
      visitor_id: visitorId,
      choice,
      policy_version: COOKIE_POLICY_VERSION,
      locale,
    }).catch(() => undefined);
  };

  return (
    <section className="consent-banner" aria-labelledby="consent-title" role="region">
      <div className="consent-banner__copy">
        <h2 id="consent-title" className="consent-banner__title">
          {t('title')}
        </h2>
        <p>{t('body')}</p>
        <ul className="meta-inline">
          <li>
            <Link href="/cookies">{t('policy')}</Link>
          </li>
          <li>
            <Link href="/privacy">{t('privacy')}</Link>
          </li>
        </ul>
      </div>
      <div className="consent-banner__actions">
        <button type="button" className="btn" onClick={() => choose('granted')}>
          {t('accept')}
        </button>
        <button type="button" className="btn btn--ghost" onClick={() => choose('denied')}>
          {t('decline')}
        </button>
      </div>
    </section>
  );
}
