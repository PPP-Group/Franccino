import type { Locale } from '@/i18n/config';
import { recordConsent } from '@/lib/api/forms';
import { COOKIE_POLICY_VERSION, setConsent, type ConsentCategories } from '@/lib/consent/store';

/**
 * Grava a escolha de cookies (aviso da primeira visita ou página de cookies) e registra na API como prova. O registro
 * não trava o site: falha de rede é ignorada.
 */
export function saveConsentChoice(chosen: ConsentCategories, locale: Locale): void {
  const choice = chosen.analytics || chosen.marketing ? 'granted' : 'denied';
  const visitorId = setConsent(choice, undefined, chosen);
  void recordConsent({
    visitor_id: visitorId,
    choice,
    policy_version: COOKIE_POLICY_VERSION,
    locale,
  }).catch(() => undefined);
}
