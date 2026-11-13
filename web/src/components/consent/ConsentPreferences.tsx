'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useId, useState, useSyncExternalStore } from 'react';
import type { Locale } from '@/i18n/config';
import { saveConsentChoice } from '@/lib/consent/save';
import { getConsentCategories, subscribeConsent, type ConsentCategories } from '@/lib/consent/store';
import { useIsClient } from '@/lib/ui/use-is-client';

const NONE: ConsentCategories = { analytics: false, marketing: false };
const getServerCategories = () => null;

/**
 * Preferências de cookies dentro da página Política de cookies (retorno de 13/11/2026: no rodapé fica um link só). Mostra
 * a escolha atual, com os necessários sempre ligados, e grava a nova como o aviso da primeira visita.
 */
export function ConsentPreferences() {
  const t = useTranslations('consent');
  const locale = useLocale() as Locale;
  const id = useId();
  const isClient = useIsClient();
  const current = useSyncExternalStore(subscribeConsent, getConsentCategories, getServerCategories);
  const [draft, setDraft] = useState<ConsentCategories | null>(null);
  const [saved, setSaved] = useState(false);
  const value = draft ?? current ?? NONE;

  const change = (next: ConsentCategories) => {
    setDraft(next);
    setSaved(false);
  };
  const save = (chosen: ConsentCategories) => {
    saveConsentChoice(chosen, locale);
    setDraft(chosen);
    setSaved(true);
  };

  if (!isClient) {
    return null;
  }

  return (
    <section className="consent-preferences" aria-labelledby={`${id}-title`}>
      <h2 id={`${id}-title`}>{t('preferences')}</h2>
      <p className="lead">{current ? t('currentChoice') : t('noChoice')}</p>
      <fieldset className="consent-preferences__options">
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
            checked={value.analytics}
            onChange={(event) => change({ ...value, analytics: event.target.checked })}
          />
          <span>
            <strong>{t('analytics')}</strong> {t('analyticsText')}
          </span>
        </label>
        <label>
          <input
            type="checkbox"
            checked={value.marketing}
            onChange={(event) => change({ ...value, marketing: event.target.checked })}
          />
          <span>
            <strong>{t('marketing')}</strong> {t('marketingText')}
          </span>
        </label>
      </fieldset>
      <div className="consent-preferences__actions">
        <button type="button" className="btn" onClick={() => save(value)}>
          {t('save')}
        </button>
        <button
          type="button"
          className="btn btn--ghost"
          onClick={() => save({ analytics: true, marketing: true })}
        >
          {t('accept')}
        </button>
        <button type="button" className="btn btn--ghost" onClick={() => save(NONE)}>
          {t('decline')}
        </button>
      </div>
      <p className="meta" role="status">
        {saved ? t('saved') : ''}
      </p>
    </section>
  );
}
