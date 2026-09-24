'use client';

import { type FormEvent, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import type { Locale } from '@/i18n/config';
import { Link } from '@/i18n/navigation';
import type { ContactPayload, FormResult } from '@/lib/api/forms';
import { submitContact } from '@/lib/api/forms';
import { getPublicEnv } from '@/lib/env';
import { Turnstile } from './Turnstile';

type ContactFormProps = {
  /** Presets `product_id` and hides the subject field, forcing `type: 'quote'` (product page's budget form). */
  productId?: number;
  fixedType?: ContactPayload['type'];
};

type Status = 'idle' | 'sending' | 'success' | 'error' | 'rateLimited';

const CONTACT_TYPES: ContactPayload['type'][] = ['quote', 'assistance', 'partnership', 'press', 'other'];

function fieldValue(formData: FormData, name: string): string | null {
  const value = formData.get(name);
  return typeof value === 'string' && value.trim().length > 0 ? value : null;
}

export function ContactForm({ productId, fixedType }: ContactFormProps) {
  const t = useTranslations('forms');
  const locale = useLocale() as Locale;
  const turnstileSiteKey = getPublicEnv().NEXT_PUBLIC_TURNSTILE_SITE_KEY;

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

    const result: FormResult = await submitContact(payload);

    if (result.ok) {
      setStatus('success');
      form.reset();
      return;
    }

    setStatus(result.status === 429 ? 'rateLimited' : 'error');
    setFieldErrors(result.fieldErrors);
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      {!fixedType && (
        <p>
          <label htmlFor="contact-type">{t('fields.type')}</label>
          <select id="contact-type" name="type" required defaultValue="">
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
        <input id="contact-name" name="name" type="text" required autoComplete="name" />
        {fieldErrors.name && <span role="alert">{fieldErrors.name}</span>}
      </p>

      <p>
        <label htmlFor="contact-email">{t('fields.email')}</label>
        <input id="contact-email" name="email" type="email" required autoComplete="email" />
        {fieldErrors.email && <span role="alert">{fieldErrors.email}</span>}
      </p>

      <p>
        <label htmlFor="contact-phone">{t('fields.phone')}</label>
        <input id="contact-phone" name="phone" type="tel" autoComplete="tel" />
        {fieldErrors.phone && <span role="alert">{fieldErrors.phone}</span>}
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
        <textarea id="contact-message" name="message" required />
        {fieldErrors.message && <span role="alert">{fieldErrors.message}</span>}
      </p>

      <p>
        <label>
          <input type="checkbox" name="consent" required />
          {t.rich('consent', {
            link: (chunks) => <Link href="/privacy">{chunks}</Link>,
          })}
        </label>
        {fieldErrors.consent && <span role="alert">{fieldErrors.consent}</span>}
      </p>

      {turnstileSiteKey && <Turnstile siteKey={turnstileSiteKey} />}

      <button type="submit" disabled={status === 'sending'}>
        {status === 'sending' ? t('sending') : t('submit')}
      </button>

      <p role="status">
        {status === 'success' && t('success')}
        {status === 'error' && t('error')}
        {status === 'rateLimited' && t('rateLimited')}
      </p>
    </form>
  );
}
