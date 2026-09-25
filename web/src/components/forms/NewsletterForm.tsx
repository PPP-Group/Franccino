'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useId, useRef, useState, type FormEvent } from 'react';
import { Icon } from '@/components/ui/Icon';
import type { Locale } from '@/i18n/config';
import { Link } from '@/i18n/navigation';
import { subscribeNewsletter } from '@/lib/api/forms';
import { getPublicEnv } from '@/lib/env';
import { EMAIL_PATTERN } from '@/lib/forms/contact';
import { Turnstile, type TurnstileHandle } from './Turnstile';

type NewsletterStatus = 'idle' | 'sending' | 'success' | 'invalid' | 'failed' | 'rateLimited';

export function NewsletterForm({ source = 'footer' }: { source?: string }) {
  const t = useTranslations('newsletter');
  const locale = useLocale() as Locale;
  const baseId = useId();
  const siteKey = getPublicEnv().NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const turnstileRef = useRef<TurnstileHandle>(null);
  const [status, setStatus] = useState<NewsletterStatus>('idle');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const email = String(data.get('email') ?? '').trim();
    if (!EMAIL_PATTERN.test(email) || data.get('consent') !== 'on') {
      setStatus('invalid');
      return;
    }
    setStatus('sending');
    try {
      const token = data.get('cf-turnstile-response');
      const result = await subscribeNewsletter({
        email,
        locale,
        source,
        consent: true,
        ...(typeof token === 'string' && token ? { turnstile_token: token } : {}),
      });
      if (result.ok) {
        form.reset();
        setStatus('success');
        return;
      }
      setStatus(result.status === 429 ? 'rateLimited' : 'failed');
    } catch {
      // Network failure: `subscribeNewsletter` only resolves with
      // `{ ok: false }` for a completed HTTP response.
      setStatus('failed');
    } finally {
      // Turnstile tokens are single-use; get a fresh one for the next attempt.
      turnstileRef.current?.reset();
    }
  }

  const message =
    status === 'idle'
      ? null
      : status === 'sending'
        ? t('status.sending')
        : status === 'success'
          ? t('status.success')
          : status === 'invalid'
            ? t('status.invalid')
            : status === 'rateLimited'
              ? t('status.rateLimited')
              : t('status.failed');

  return (
    <form className="newsletter-form" noValidate onSubmit={handleSubmit}>
      <p className="footer-muted">{t('intro')}</p>
      <div className="newsletter">
        <label className="visually-hidden" htmlFor={`${baseId}-email`}>
          {t('emailLabel')}
        </label>
        <input
          id={`${baseId}-email`}
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder={t('placeholder')}
          aria-invalid={status === 'invalid' ? true : undefined}
          aria-describedby={`${baseId}-status`}
        />
        <button type="submit" aria-label={t('submit')} disabled={status === 'sending'}>
          <Icon name="arrow" />
        </button>
      </div>
      <label className="newsletter__consent">
        <input type="checkbox" name="consent" required />
        <span>{t.rich('consent', { privacy: (chunks) => <Link href="/privacy">{chunks}</Link> })}</span>
      </label>
      {siteKey ? <Turnstile ref={turnstileRef} siteKey={siteKey} /> : null}
      <p className="newsletter__status" id={`${baseId}-status`} role="status">
        {message}
      </p>
    </form>
  );
}
