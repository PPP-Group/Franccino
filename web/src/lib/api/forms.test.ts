import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mapValidationErrors, submitContact, subscribeNewsletter } from './forms';
import type { ContactPayload, NewsletterPayload } from './forms';

const jsonResponse = (body: unknown, status: number) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

describe('mapValidationErrors', () => {
  it('keeps only the first message per field', () => {
    expect(mapValidationErrors({ errors: { email: ['inválido', 'x'], consent: ['obrigatório'] } })).toEqual({
      email: 'inválido',
      consent: 'obrigatório',
    });
  });

  it('returns an empty object when there is no errors field', () => {
    expect(mapValidationErrors({ message: 'Too Many Requests' })).toEqual({});
  });

  it('returns an empty object for a field with no messages', () => {
    expect(mapValidationErrors({ errors: { email: [] } })).toEqual({});
  });
});

const contactPayload: ContactPayload = {
  type: 'quote',
  name: 'Ana',
  email: 'ana@exemplo.com',
  phone: '+55 11 99999-0000',
  company: null,
  profession: 'architect',
  city: 'São Paulo',
  state: 'SP',
  message: 'Gostaria de um orçamento...',
  locale: 'pt',
  source_url: 'https://franccino.com.br/pt/produtos/cadeira-aura',
  consent: true,
};

const newsletterPayload: NewsletterPayload = {
  email: 'ana@exemplo.com',
  locale: 'pt',
  consent: true,
};

describe('submitContact', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_API_URL', 'http://api.test');
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('returns ok on 201', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(jsonResponse({ data: { received: true } }, 201));

    await expect(submitContact(contactPayload)).resolves.toEqual({ ok: true });

    const [url, init] = fetchMock.mock.calls[0]!;
    expect(String(url)).toBe('http://api.test/api/v1/contact');
    expect((init as RequestInit).method).toBe('POST');
  });

  it('returns field errors on 422', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      jsonResponse({ message: 'The given data was invalid.', errors: { email: ['inválido'] } }, 422),
    );

    await expect(submitContact(contactPayload)).resolves.toEqual({
      ok: false,
      status: 422,
      fieldErrors: { email: 'inválido' },
      message: 'The given data was invalid.',
    });
  });

  it('returns the status without field errors on 429', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse({ message: 'Too Many Requests' }, 429));

    await expect(submitContact(contactPayload)).resolves.toEqual({
      ok: false,
      status: 429,
      fieldErrors: {},
      message: 'Too Many Requests',
    });
  });

  it('rejects (does not resolve to a FormResult) on a network failure', async () => {
    // `submitContact` only maps *completed* HTTP responses to a `FormResult`
    // — a `fetch` rejection (offline, DNS, CORS) propagates instead, which is
    // exactly what `ContactForm`'s `try/catch` around this call now handles.
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new TypeError('Failed to fetch'));
    await expect(submitContact(contactPayload)).rejects.toThrow();
  });
});

describe('subscribeNewsletter', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_API_URL', 'http://api.test');
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('returns ok on the first subscription (201)', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse({ data: { subscribed: true } }, 201));
    await expect(subscribeNewsletter(newsletterPayload)).resolves.toEqual({ ok: true });
  });

  it('also returns ok when the email already exists (200)', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse({ data: { subscribed: true } }, 200));
    await expect(subscribeNewsletter(newsletterPayload)).resolves.toEqual({ ok: true });
  });

  it('returns field errors on 422', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      jsonResponse({ message: 'The given data was invalid.', errors: { consent: ['obrigatório'] } }, 422),
    );
    await expect(subscribeNewsletter(newsletterPayload)).resolves.toEqual({
      ok: false,
      status: 422,
      fieldErrors: { consent: 'obrigatório' },
      message: 'The given data was invalid.',
    });
  });

  it('rejects (does not resolve to a FormResult) on a network failure', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new TypeError('Failed to fetch'));
    await expect(subscribeNewsletter(newsletterPayload)).rejects.toThrow();
  });
});
