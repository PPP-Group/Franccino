'use client';

import { type FormEvent, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import type { Locale } from '@/i18n/config';
import { Link } from '@/i18n/navigation';
import type { ContactPayload, FormResult } from '@/lib/api/forms';
import { submitContact } from '@/lib/api/forms';
import { getPublicEnv } from '@/lib/env';
import { Turnstile, type TurnstileHandle } from './Turnstile';

type ContactFormProps = {
  /** Presets `product_id` and hides the subject field, forcing `type: 'quote'` (product page's budget form). */
  productId?: number;
  fixedType?: ContactPayload['type'];
};

type Status = 'idle' | 'sending' | 'success' | 'error' | 'rateLimited';

const CONTACT_TYPES: ContactPayload['type'][] = ['quote', 'assistance', 'partnership', 'press', 'other'];

const STATUS_ID = 'contact-form-status';

function fieldValue(formData: FormData, name: string): string | null {
  const value = formData.get(name);
  return typeof value === 'string' && value.trim().length > 0 ? value : null;
}

export function ContactForm({ productId, fixedType }: ContactFormProps) {
  const t = useTranslations('forms');
  const locale = useLocale() as Locale;
  const turnstileSiteKey = getPublicEnv().NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const turnstileRef = useRef<TurnstileHandle>(null);

  const [status, setStatus] = useState<Status>('idle');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    setStatus('sending');
    setFieldErrors({});

    const payload: ContactPayload = {
      type: fixedType ?? ((formData.get('type') as ContactPayload['type']) || 'other'),
      name: String(formData.get('name') ?? ''),
      email: String(formData.get('email') ?? ''),
      phone: fieldValue(formData, 'phone'),
      company: fieldValue(formData, 'company'),
      profession: fieldValue(formData, 'profession'),
      city: fieldValue(formData, 'city'),
      state: fieldValue(formData, 'state'),
      message: String(formData.get('message') ?? ''),
      product_id: productId,
      locale,
      source_url: typeof window === 'undefined' ? '' : window.location.href,
      consent: formData.get('consent') === 'on',
      turnstile_token: fieldValue(formData, 'cf-turnstile-response') ?? undefined,
    };

    try {
      const result: FormResult = await submitContact(payload);

      if (result.ok) {
        setStatus('success');
        form.reset();
        return;
      }

      setStatus(result.status === 429 ? 'rateLimited' : 'error');
      setFieldErrors(result.fieldErrors);
    } catch {
      // Network failure (offline, DNS, CORS, etc.): `submitContact` only
      // resolves with `{ ok: false }` for a completed HTTP response, so
      // anything that throws here never reached the API.
      setStatus('error');
    } finally {
      // Turnstile tokens are single-use; get a fresh one for the next
      // attempt regardless of how this one ended.
      turnstileRef.current?.reset();
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      {!fixedType && (
        <p>
          <label htmlFor="contact-type">{t('fields.type')}</label>
          <select
            id="contact-type"
            name="type"
            required
            defaultValue=""
            aria-invalid={Boolean(fieldErrors.type)}
            aria-describedby={fieldErrors.type ? STATUS_ID : undefined}
          >
            <option value="" disabled>
              {t('fields.type')}
            </option>
            {CONTACT_TYPES.map((type) => (
              <option key={type} value={type}>
                {t(`contactTypes.${type}`)}
              </option>
            ))}
          </select>
        </p>
      )}

      <p>
        <label htmlFor="contact-name">{t('fields.name')}</label>
        <input
          id="contact-name"
          name="name"
          type="text"
          required
          autoComplete="name"
          aria-invalid={Boolean(fieldErrors.name)}
          aria-describedby={fieldErrors.name ? 'contact-name-error' : undefined}
        />
        {fieldErrors.name && (
          <span id="contact-name-error" role="alert">
            {fieldErrors.name}
          </span>
        )}
      </p>

      <p>
        <label htmlFor="contact-email">{t('fields.email')}</label>
        <input
          id="contact-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          aria-invalid={Boolean(fieldErrors.email)}
          aria-describedby={fieldErrors.email ? 'contact-email-error' : undefined}
        />
        {fieldErrors.email && (
          <span id="contact-email-error" role="alert">
            {fieldErrors.email}
          </span>
        )}
      </p>

      <p>
        <label htmlFor="contact-phone">{t('fields.phone')}</label>
        <input
          id="contact-phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          aria-invalid={Boolean(fieldErrors.phone)}
          aria-describedby={fieldErrors.phone ? 'contact-phone-error' : undefined}
        />
        {fieldErrors.phone && (
          <span id="contact-phone-error" role="alert">
            {fieldErrors.phone}
          </span>
        )}
      </p>

      <p>
        <label htmlFor="contact-company">{t('fields.company')}</label>
        <input id="contact-company" name="company" type="text" autoComplete="organization" />
      </p>

      <p>
        <label htmlFor="contact-profession">{t('fields.profession')}</label>
        <input id="contact-profession" name="profession" type="text" />
      </p>

      <p>
        <label htmlFor="contact-city">{t('fields.city')}</label>
        <input id="contact-city" name="city" type="text" autoComplete="address-level2" />
      </p>

      <p>
        <label htmlFor="contact-state">{t('fields.state')}</label>
        <input id="contact-state" name="state" type="text" autoComplete="address-level1" />
      </p>

      <p>
        <label htmlFor="contact-message">{t('fields.message')}</label>
        <textarea
          id="contact-message"
          name="message"
          required
          aria-invalid={Boolean(fieldErrors.message)}
          aria-describedby={fieldErrors.message ? 'contact-message-error' : undefined}
        />
        {fieldErrors.message && (
          <span id="contact-message-error" role="alert">
            {fieldErrors.message}
          </span>
        )}
      </p>

      <p>
        <label>
          <input
            type="checkbox"
            name="consent"
            required
            aria-invalid={Boolean(fieldErrors.consent)}
            aria-describedby={fieldErrors.consent ? 'contact-consent-error' : undefined}
          />
          {t.rich('consent', {
            link: (chunks) => <Link href="/privacy">{chunks}</Link>,
          })}
        </label>
        {fieldErrors.consent && (
          <span id="contact-consent-error" role="alert">
            {fieldErrors.consent}
          </span>
        )}
      </p>

      {turnstileSiteKey && <Turnstile ref={turnstileRef} siteKey={turnstileSiteKey} />}

      <button type="submit" disabled={status === 'sending'}>
        {status === 'sending' ? t('sending') : t('submit')}
      </button>

      <p id={STATUS_ID} role="status">
        {status === 'success' && t('success')}
        {status === 'error' && (fieldErrors.type ?? fieldErrors.turnstile_token ?? t('error'))}
        {status === 'rateLimited' && t('rateLimited')}
      </p>
    </form>
  );
}
