/**
 * Helpers puros do formulário de contato (leitura do `FormData`, validação,
 * montagem do payload do `POST /contact`). `ContactForm` só liga estes
 * helpers ao markup — nenhuma regra de negócio no componente.
 */

import type { Locale } from '@/i18n/config';
import type { ContactItem, ContactPayload } from '@/lib/api/forms';

export const CONTACT_TYPES = ['quote', 'assistance', 'partnership', 'press', 'other'] as const;
export const PROFESSIONS = ['architect', 'interior_designer', 'retailer', 'end_customer', 'other'] as const;
export const BRAZIL_STATES = [
  'AC',
  'AL',
  'AP',
  'AM',
  'BA',
  'CE',
  'DF',
  'ES',
  'GO',
  'MA',
  'MT',
  'MS',
  'MG',
  'PA',
  'PB',
  'PR',
  'PE',
  'PI',
  'RJ',
  'RN',
  'RS',
  'RO',
  'RR',
  'SC',
  'SP',
  'SE',
  'TO',
] as const;

export type ContactType = (typeof CONTACT_TYPES)[number];
export type Profession = (typeof PROFESSIONS)[number];

export type ContactFormValues = {
  type: ContactType;
  name: string;
  email: string;
  phone: string;
  company: string;
  profession: Profession | '';
  city: string;
  state: string;
  message: string;
  consent: boolean;
};

export type ContactField = keyof ContactFormValues;
export type ContactFieldError = 'required' | 'invalidEmail' | 'tooLong' | 'consent';
export type ContactErrors = Partial<Record<ContactField, ContactFieldError>>;

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Limites do `ContactRequest` da API (P2, Task 12). */
const MAX_LENGTH: Partial<Record<ContactField, number>> = {
  name: 120,
  email: 190,
  phone: 40,
  company: 120,
  city: 120,
  message: 5000,
};

const FIELD_ORDER: ContactField[] = [
  'type',
  'name',
  'email',
  'phone',
  'company',
  'city',
  'state',
  'profession',
  'message',
  'consent',
];

function text(form: FormData, name: string): string {
  const value = form.get(name);
  return typeof value === 'string' ? value : '';
}

function isOneOf<T extends string>(list: readonly T[], value: string): value is T {
  return (list as readonly string[]).includes(value);
}

export function readContactForm(form: FormData, fallbackType: ContactType): ContactFormValues {
  const type = text(form, 'type');
  const profession = text(form, 'profession');
  const state = text(form, 'state');
  return {
    type: isOneOf(CONTACT_TYPES, type) ? type : fallbackType,
    name: text(form, 'name'),
    email: text(form, 'email'),
    phone: text(form, 'phone'),
    company: text(form, 'company'),
    profession: isOneOf(PROFESSIONS, profession) ? profession : '',
    city: text(form, 'city'),
    state: isOneOf(BRAZIL_STATES, state) ? state : '',
    message: text(form, 'message'),
    consent: form.get('consent') === 'on',
  };
}

export function validateContact(
  values: ContactFormValues,
  options: { messageRequired: boolean },
): ContactErrors {
  const errors: ContactErrors = {};
  if (!values.name.trim()) {
    errors.name = 'required';
  }
  if (!values.email.trim()) {
    errors.email = 'required';
  } else if (!EMAIL_PATTERN.test(values.email.trim())) {
    errors.email = 'invalidEmail';
  }
  if (options.messageRequired && !values.message.trim()) {
    errors.message = 'required';
  }
  if (!values.consent) {
    errors.consent = 'consent';
  }
  for (const [field, max] of Object.entries(MAX_LENGTH) as [ContactField, number][]) {
    const value = values[field];
    if (typeof value === 'string' && value.trim().length > max && !errors[field]) {
      errors[field] = 'tooLong';
    }
  }
  return errors;
}

export function firstInvalidField(errors: Partial<Record<ContactField, unknown>>): ContactField | null {
  return FIELD_ORDER.find((field) => errors[field]) ?? null;
}

export type ContactPayloadOptions = {
  locale: Locale;
  sourceUrl: string;
  productId?: number;
  items?: ContactItem[];
  composeMessage?: (typed: string) => string;
  turnstileToken?: string | null;
};

export function buildContactPayload(
  values: ContactFormValues,
  options: ContactPayloadOptions,
): ContactPayload {
  const optional = (value: string) => value.trim() || null;
  return {
    type: values.type,
    name: values.name.trim(),
    email: values.email.trim(),
    phone: optional(values.phone),
    company: optional(values.company),
    profession: values.profession || null,
    city: optional(values.city),
    state: values.state || null,
    message: options.composeMessage ? options.composeMessage(values.message) : values.message.trim(),
    ...(options.productId ? { product_id: options.productId } : {}),
    ...(options.items && options.items.length > 0 ? { items: options.items } : {}),
    locale: options.locale,
    source_url: options.sourceUrl,
    consent: values.consent,
    ...(options.turnstileToken ? { turnstile_token: options.turnstileToken } : {}),
  };
}

/** Chave de erro da API → campo do formulário (`items.*` e `turnstile_token` viram erro geral). */
export function fieldFromServer(key: string): ContactField | null {
  return (FIELD_ORDER as string[]).includes(key) ? (key as ContactField) : null;
}
