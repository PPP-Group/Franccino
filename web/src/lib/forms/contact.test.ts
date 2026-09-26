import { describe, expect, it } from 'vitest';
import {
  buildContactPayload,
  fieldFromServer,
  firstInvalidField,
  readContactForm,
  validateContact,
  type ContactFormValues,
} from './contact';

const form = (entries: Record<string, string>) => {
  const data = new FormData();
  for (const [key, value] of Object.entries(entries)) {
    data.set(key, value);
  }
  return data;
};

const values = (overrides: Partial<ContactFormValues> = {}): ContactFormValues => ({
  type: 'quote',
  name: 'Ana',
  email: 'ana@exemplo.com',
  phone: '',
  company: '',
  profession: '',
  city: '',
  state: '',
  message: '',
  consent: true,
  ...overrides,
});

describe('contact form helpers', () => {
  it('reads the form and drops values outside the enums', () => {
    const read = readContactForm(
      form({ type: 'spam', name: 'Ana', profession: 'astronaut', state: 'Outro', consent: 'on' }),
      'quote',
    );
    expect(read).toMatchObject({ type: 'quote', name: 'Ana', profession: '', state: '', consent: true });
    expect(readContactForm(form({ profession: 'architect', state: 'MG' }), 'other')).toMatchObject({
      type: 'other',
      profession: 'architect',
      state: 'MG',
      consent: false,
    });
  });

  it('validates required fields, email, consent and lengths', () => {
    expect(
      validateContact(values({ name: ' ', email: '', consent: false }), { messageRequired: true }),
    ).toEqual({
      name: 'required',
      email: 'required',
      message: 'required',
      consent: 'consent',
    });
    expect(validateContact(values({ email: 'ana@' }), { messageRequired: false })).toEqual({
      email: 'invalidEmail',
    });
    expect(validateContact(values({ name: 'a'.repeat(121) }), { messageRequired: false })).toEqual({
      name: 'tooLong',
    });
    expect(validateContact(values(), { messageRequired: false })).toEqual({});
  });

  it('points to the first invalid field in form order', () => {
    expect(firstInvalidField({ consent: 'consent', email: 'required' })).toBe('email');
    expect(firstInvalidField({})).toBeNull();
  });

  it('builds the payload with nulls, composed message and items', () => {
    const payload = buildContactPayload(
      values({ phone: ' ', city: ' Belo Horizonte ', message: 'Entrega em BH' }),
      {
        locale: 'pt',
        sourceUrl: 'https://franccino.com.br/pt/lista-de-orcamento',
        items: [{ product_id: 12, quantity: 6, finish_ids: [101] }],
        composeMessage: (typed) => `${typed}\n\nPeças:`,
        turnstileToken: 'token',
      },
    );
    expect(payload).toEqual({
      type: 'quote',
      name: 'Ana',
      email: 'ana@exemplo.com',
      phone: null,
      company: null,
      profession: null,
      city: 'Belo Horizonte',
      state: null,
      message: 'Entrega em BH\n\nPeças:',
      items: [{ product_id: 12, quantity: 6, finish_ids: [101] }],
      locale: 'pt',
      source_url: 'https://franccino.com.br/pt/lista-de-orcamento',
      consent: true,
      turnstile_token: 'token',
    });
  });

  it('omits empty items and adds the product id', () => {
    const payload = buildContactPayload(values({ message: 'Oi' }), {
      locale: 'en',
      sourceUrl: 'https://x',
      productId: 12,
      items: [],
    });
    expect(payload).not.toHaveProperty('items');
    expect(payload).not.toHaveProperty('turnstile_token');
    expect(payload.product_id).toBe(12);
  });

  it('maps server error keys to form fields', () => {
    expect(fieldFromServer('email')).toBe('email');
    expect(fieldFromServer('items.0.quantity')).toBeNull();
    expect(fieldFromServer('turnstile_token')).toBeNull();
  });
});
