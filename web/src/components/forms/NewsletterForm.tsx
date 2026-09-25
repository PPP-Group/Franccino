'use client';

import { type FormEvent, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import type { Locale } from '@/i18n/config';
import { Link } from '@/i18n/navigation';
import type { FormResult, NewsletterPayload } from '@/lib/api/forms';
import { subscribeNewsletter } from '@/lib/api/forms';
import { getPublicEnv } from '@/lib/env';
import { Turnstile, type TurnstileHandle } from './Turnstile';

type NewsletterFormProps = {
  /** Identifies where the subscription came from (e.g. `'footer'`). */
  source?: string;
};

type Status = 'idle' | 'sending' | 'success' | 'error' | 'rateLimited';

const STATUS_ID = 'newsletter-form-status';

export function NewsletterForm({ source }: NewsletterFormProps) {
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

    const name = formData.get('name');

    const payload: NewsletterPayload = {
      email: String(formData.get('email') ?? ''),
      name: typeof name === 'string' && name.trim().length > 0 ? name : undefined,
      locale,
      source,
      consent: formData.get('consent') === 'on',
      turnstile_token: (formData.get('cf-turnstile-response') as string) || undefined,
    };

    try {
      const result: FormResult = await subscribeNewsletter(payload);

      if (result.ok) {
        setStatus('success');
        form.reset();
        return;
      }

      setStatus(result.status === 429 ? 'rateLimited' : 'error');
      setFieldErrors(result.fieldErrors);
    } catch {
      // Network failure: `subscribeNewsletter` only resolves with
      // `{ ok: false }` for a completed HTTP response.
      setStatus('error');
    } finally {
      // Turnstile tokens are single-use; get a fresh one for the next attempt.
      turnstileRef.current?.reset();
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <p>
        <label htmlFor="newsletter-email">{t('fields.email')}</label>
        <input
          id="newsletter-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          aria-invalid={Boolean(fieldErrors.email)}
          aria-describedby={fieldErrors.email ? 'newsletter-email-error' : undefined}
        />
        {fieldErrors.email && (
          <span id="newsletter-email-error" role="alert">
            {fieldErrors.email}
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
            aria-describedby={fieldErrors.consent ? 'newsletter-consent-error' : undefined}
          />
          {t.rich('consent', {
            link: (chunks) => <Link href="/privacy">{chunks}</Link>,
          })}
        </label>
        {fieldErrors.consent && (
          <span id="newsletter-consent-error" role="alert">
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
        {status === 'error' && (fieldErrors.turnstile_token ?? t('error'))}
        {status === 'rateLimited' && t('rateLimited')}
      </p>
    </form>
  );
}
