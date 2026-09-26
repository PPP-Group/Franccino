'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useId, useRef, useState, type FormEvent, type ReactNode } from 'react';
import type { Locale } from '@/i18n/config';
import { Link } from '@/i18n/navigation';
import { submitContact, type ContactItem } from '@/lib/api/forms';
import { getPublicEnv } from '@/lib/env';
import {
  BRAZIL_STATES,
  buildContactPayload,
  CONTACT_TYPES,
  fieldFromServer,
  firstInvalidField,
  PROFESSIONS,
  readContactForm,
  validateContact,
  type ContactField,
  type ContactFieldError,
  type ContactType,
} from '@/lib/forms/contact';
import { Turnstile, type TurnstileHandle } from './Turnstile';

type Status = 'idle' | 'sending' | 'success' | 'failed' | 'rateLimited';

export type ContactFormProps = {
  type?: ContactType;
  typeSelectable?: boolean;
  productId?: number;
  items?: ContactItem[];
  composeMessage?: (typed: string) => string;
  messageRequired?: boolean;
  messageLabel?: string;
  messagePlaceholder?: string;
  submitLabel?: string;
  successMessage?: string;
  onSuccess?: () => void;
};

function FieldShell(props: {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  errorId: string;
  children: ReactNode;
}) {
  const t = useTranslations('contactForm');
  return (
    <div className="field">
      <label htmlFor={props.id}>
        {props.label}
        {props.required ? (
          <span className="req" aria-hidden="true">
            {t('requiredMark')}
          </span>
        ) : null}
      </label>
      {props.children}
      {props.error ? (
        <p className="error" id={props.errorId}>
          {props.error}
        </p>
      ) : null}
    </div>
  );
}

export function ContactForm({
  type = 'other',
  typeSelectable = false,
  productId,
  items,
  composeMessage,
  messageRequired = true,
  messageLabel,
  messagePlaceholder,
  submitLabel,
  successMessage,
  onSuccess,
}: ContactFormProps) {
  const t = useTranslations('contactForm');
  const locale = useLocale() as Locale;
  const baseId = useId();
  const siteKey = getPublicEnv().NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const turnstileRef = useRef<TurnstileHandle>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [errors, setErrors] = useState<Partial<Record<ContactField, string>>>({});
  const [serverMessage, setServerMessage] = useState<string | null>(null);

  const fieldId = (field: ContactField) => `${baseId}-${field}`;
  const errorId = (field: ContactField) => `${baseId}-${field}-error`;
  const aria = (field: ContactField) => ({
    'aria-invalid': errors[field] ? true : undefined,
    'aria-describedby': errors[field] ? errorId(field) : undefined,
  });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const values = readContactForm(data, type);
    const found = validateContact(values, { messageRequired });

    const messages: Partial<Record<ContactField, string>> = {};
    for (const [field, code] of Object.entries(found) as [ContactField, ContactFieldError][]) {
      messages[field] = t(`errors.${code}`);
    }
    setErrors(messages);
    setServerMessage(null);

    const first = firstInvalidField(found);
    if (first) {
      form.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }

    setStatus('sending');
    try {
      const token = data.get('cf-turnstile-response');
      const result = await submitContact(
        buildContactPayload(values, {
          locale,
          sourceUrl: window.location.href,
          productId,
          items,
          composeMessage,
          turnstileToken: typeof token === 'string' ? token : null,
        }),
      );

      if (result.ok) {
        form.reset();
        setStatus('success');
        onSuccess?.();
        return;
      }
      if (result.status === 429) {
        setStatus('rateLimited');
        return;
      }
      // `turnstile_token` and `type` errors have no dedicated field to land on
      // (the challenge widget has no visible input; the subject select is
      // hidden when `typeSelectable` is false) — they surface in the alert
      // instead of a per-field message.
      const mapped: Partial<Record<ContactField, string>> = {};
      for (const [key, message] of Object.entries(result.fieldErrors)) {
        if (key === 'turnstile_token' || key === 'type') {
          continue;
        }
        const field = fieldFromServer(key);
        if (field) {
          mapped[field] = message;
        }
      }
      setErrors(mapped);
      setServerMessage(
        Object.keys(mapped).length === 0
          ? (result.fieldErrors.turnstile_token ?? result.message ?? null)
          : null,
      );
      setStatus('failed');
    } catch {
      // Network failure (offline, DNS, CORS, etc.): `submitContact` only
      // resolves with `{ ok: false }` for a completed HTTP response, so
      // anything that throws here never reached the API.
      setStatus('failed');
    } finally {
      // Turnstile tokens are single-use; get a fresh one for the next
      // attempt regardless of how this one ended.
      turnstileRef.current?.reset();
    }
  }

  if (status === 'success') {
    return (
      <div className="form-status" role="status">
        <strong>{successMessage ?? t('success')}</strong>
      </div>
    );
  }

  const hasFieldErrors = Object.keys(errors).length > 0;
  const alert =
    status === 'rateLimited'
      ? t('rateLimited')
      : hasFieldErrors
        ? t('errorSummary')
        : status === 'failed'
          ? (serverMessage ?? t('failed'))
          : null;

  return (
    <form className="form" noValidate onSubmit={handleSubmit}>
      <p className="meta">{t('requiredHint')}</p>

      {typeSelectable ? (
        <FieldShell id={fieldId('type')} label={t('type')} errorId={errorId('type')}>
          <select id={fieldId('type')} name="type" defaultValue={type}>
            {CONTACT_TYPES.map((value) => (
              <option key={value} value={value}>
                {t(`types.${value}`)}
              </option>
            ))}
          </select>
        </FieldShell>
      ) : null}

      <FieldShell
        id={fieldId('name')}
        label={t('name')}
        required
        error={errors.name}
        errorId={errorId('name')}
      >
        <input
          id={fieldId('name')}
          name="name"
          autoComplete="name"
          required
          maxLength={120}
          {...aria('name')}
        />
      </FieldShell>

      <div className="pair">
        <FieldShell
          id={fieldId('email')}
          label={t('email')}
          required
          error={errors.email}
          errorId={errorId('email')}
        >
          <input
            id={fieldId('email')}
            name="email"
            type="email"
            autoComplete="email"
            required
            maxLength={190}
            {...aria('email')}
          />
        </FieldShell>
        <FieldShell id={fieldId('phone')} label={t('phone')} error={errors.phone} errorId={errorId('phone')}>
          <input
            id={fieldId('phone')}
            name="phone"
            type="tel"
            autoComplete="tel"
            maxLength={40}
            {...aria('phone')}
          />
        </FieldShell>
      </div>

      <FieldShell
        id={fieldId('company')}
        label={t('company')}
        error={errors.company}
        errorId={errorId('company')}
      >
        <input
          id={fieldId('company')}
          name="company"
          autoComplete="organization"
          maxLength={120}
          {...aria('company')}
        />
      </FieldShell>

      <div className="pair">
        <FieldShell id={fieldId('city')} label={t('city')} error={errors.city} errorId={errorId('city')}>
          <input
            id={fieldId('city')}
            name="city"
            autoComplete="address-level2"
            maxLength={120}
            {...aria('city')}
          />
        </FieldShell>
        <FieldShell id={fieldId('state')} label={t('state')} error={errors.state} errorId={errorId('state')}>
          <select
            id={fieldId('state')}
            name="state"
            autoComplete="address-level1"
            defaultValue=""
            {...aria('state')}
          >
            <option value="">{t('statePlaceholder')}</option>
            {BRAZIL_STATES.map((uf) => (
              <option key={uf} value={uf}>
                {uf}
              </option>
            ))}
          </select>
        </FieldShell>
      </div>

      <FieldShell
        id={fieldId('profession')}
        label={t('profession')}
        error={errors.profession}
        errorId={errorId('profession')}
      >
        <select id={fieldId('profession')} name="profession" defaultValue="" {...aria('profession')}>
          <option value="">{t('professionPlaceholder')}</option>
          {PROFESSIONS.map((value) => (
            <option key={value} value={value}>
              {t(`professions.${value}`)}
            </option>
          ))}
        </select>
      </FieldShell>

      <FieldShell
        id={fieldId('message')}
        label={messageLabel ?? t('message')}
        required={messageRequired}
        error={errors.message}
        errorId={errorId('message')}
      >
        <textarea
          id={fieldId('message')}
          name="message"
          rows={4}
          maxLength={5000}
          required={messageRequired}
          placeholder={messagePlaceholder}
          {...aria('message')}
        />
      </FieldShell>

      <div className="field">
        <label className="consent">
          <input type="checkbox" name="consent" required {...aria('consent')} />
          <span>{t.rich('consent', { privacy: (chunks) => <Link href="/privacy">{chunks}</Link> })}</span>
        </label>
        {errors.consent ? (
          <p className="error" id={errorId('consent')}>
            {errors.consent}
          </p>
        ) : null}
      </div>

      {siteKey ? <Turnstile ref={turnstileRef} siteKey={siteKey} /> : null}

      {alert ? (
        <p className="form-error" role="alert">
          {alert}
        </p>
      ) : null}

      <button
        className="btn btn--block"
        type="submit"
        disabled={status === 'sending'}
        aria-busy={status === 'sending'}
      >
        {status === 'sending' ? t('sending') : (submitLabel ?? t('submit'))}
      </button>
    </form>
  );
}
