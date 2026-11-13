'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useId, useState, useSyncExternalStore } from 'react';
import type { Locale } from '@/i18n/config';
import { Link } from '@/i18n/navigation';
import { applyConsent, denyConsentByDefault, loadGtm } from '@/lib/consent/gtm';
import { saveConsentChoice } from '@/lib/consent/save';
import {
  CONSENT_OPEN_EVENT,
  getConsent,
  getConsentCategories,
  getServerConsent,
  subscribeConsent,
  type ConsentCategories,
} from '@/lib/consent/store';
import { getPublicEnv } from '@/lib/env';
import { useIsClient } from '@/lib/ui/use-is-client';

const getServerCategories = () => null;

/**
 * Aviso de cookies (Anexo I e LGPD). Aparece na primeira visita, sempre (retorno de 12/11/2026: com o Tag Manager ainda
 * sem conta, ele não aparecia): "Aceitar todos", "Recusar" e "Personalizar", com os cookies necessários sempre ligados
 * e as categorias de análise e de marketing à escolha. O Tag Manager só carrega com alguma categoria liberada, já com o
 * Consent Mode do Google na escolha da pessoa. A escolha fica registrada na API (`POST /consents`) e o aviso reabre pelo
 * "Preferências de cookies" do rodapé. Com a AdOpt (`NEXT_PUBLIC_CONSENT_PROVIDER=adopt`), o aviso é o dela.
 */
export function ConsentBanner() {
  const t = useTranslations('consent');
  const locale = useLocale() as Locale;
  const isClient = useIsClient();
  const id = useId();
  const env = getPublicEnv();
  const gtmId = env.NEXT_PUBLIC_GTM_ID ?? null;
  const adopt = env.NEXT_PUBLIC_CONSENT_PROVIDER === 'adopt';
  const consent = useSyncExternalStore(subscribeConsent, getConsent, getServerConsent);
  const categories = useSyncExternalStore(subscribeConsent, getConsentCategories, getServerCategories);
  const [reopened, setReopened] = useState(false);
  const [customizing, setCustomizing] = useState(false);
  const [draft, setDraft] = useState<ConsentCategories>({ analytics: false, marketing: false });

  useEffect(() => {
    if (!gtmId) return;
    if (adopt) {
      // `loadGtm` não carrega duas vezes; o padrão "negado" entra só antes da primeira carga.
      if (!document.querySelector('script[src*="googletagmanager.com/gtm.js"]')) {
        denyConsentByDefault();
      }
      loadGtm(gtmId);
      return;
    }
    if (categories && (categories.analytics || categories.marketing)) {
      if (!document.querySelector('script[src*="googletagmanager.com/gtm.js"]')) {
        denyConsentByDefault();
      }
      applyConsent(categories);
      loadGtm(gtmId);
    }
  }, [gtmId, adopt, categories]);

  useEffect(() => {
    const open = () => {
      setDraft(getConsentCategories() ?? { analytics: false, marketing: false });
      setCustomizing(true);
      setReopened(true);
    };
    window.addEventListener(CONSENT_OPEN_EVENT, open);
    return () => window.removeEventListener(CONSENT_OPEN_EVENT, open);
  }, []);

  if (!isClient || adopt || (consent !== null && !reopened)) {
    return null;
  }

  const save = (chosen: ConsentCategories) => {
    saveConsentChoice(chosen, locale);
    setReopened(false);
    setCustomizing(false);
  };

  return (
    <section className="consent-banner" aria-labelledby={`${id}-title`} role="region">
      <div className="consent-banner__copy">
        <h2 id={`${id}-title`} className="consent-banner__title">
          {t('title')}
        </h2>
        <p>{t('body')}</p>
        {customizing ? (
          <fieldset className="consent-banner__options">
            <legend className="visually-hidden">{t('categories')}</legend>
            <label>
              <input type="checkbox" checked disabled />
              <span>
                <strong>{t('necessary')}</strong> {t('necessaryText')}
              </span>
            </label>
            <label>
              <input
                type="checkbox"
                checked={draft.analytics}
                onChange={(event) => setDraft({ ...draft, analytics: event.target.checked })}
              />
              <span>
                <strong>{t('analytics')}</strong> {t('analyticsText')}
              </span>
            </label>
            <label>
              <input
                type="checkbox"
                checked={draft.marketing}
                onChange={(event) => setDraft({ ...draft, marketing: event.target.checked })}
              />
              <span>
                <strong>{t('marketing')}</strong> {t('marketingText')}
              </span>
            </label>
          </fieldset>
        ) : null}
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
        {customizing ? (
          <button type="button" className="btn" onClick={() => save(draft)}>
            {t('save')}
          </button>
        ) : (
          <button type="button" className="btn" onClick={() => save({ analytics: true, marketing: true })}>
            {t('accept')}
          </button>
        )}
        <button
          type="button"
          className="btn btn--ghost"
          onClick={() => save({ analytics: false, marketing: false })}
        >
          {t('decline')}
        </button>
        {customizing ? null : (
          <button type="button" className="btn btn--ghost" onClick={() => setCustomizing(true)}>
            {t('customize')}
          </button>
        )}
      </div>
    </section>
  );
}
