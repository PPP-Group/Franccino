/**
 * Browser-side form submitters. These call the Laravel API directly from the
 * browser (CORS is only open for `FRONTEND_URL`), so rate limiting and
 * Turnstile see the visitor's real IP — see `docs/api.md` ("Escrita").
 *
 * Uses `getPublicEnv()` (not `serverEnv()`), since this module runs in the
 * browser and only `NEXT_PUBLIC_*` variables are available there.
 */

import type { Locale } from '@/i18n/config';
import { getPublicEnv } from '@/lib/env';
import { ApiError } from './client';

export type ContactPayload = {
  type: 'quote' | 'assistance' | 'partnership' | 'press' | 'other';
  name: string;
  email: string;
  phone: string | null;
  company?: string | null;
  profession?: string | null;
  city?: string | null;
  state?: string | null;
  message: string;
  product_id?: number;
  locale: Locale;
  source_url: string;
  consent: boolean;
  turnstile_token?: string;
};

export type NewsletterPayload = {
  email: string;
  name?: string;
  locale: Locale;
  source?: string;
  consent: boolean;
  turnstile_token?: string;
};

export type FormResult =
  { ok: true } | { ok: false; status: number; fieldErrors: Record<string, string>; message?: string };

type ErrorBody = { message?: string; errors?: Record<string, string[]> } | null | undefined;

/** Keeps only the first validation message per field from an error envelope. */
export function mapValidationErrors(body: ErrorBody): Record<string, string> {
  const result: Record<string, string> = {};
  const errors = body?.errors;

  if (!errors) {
    return result;
  }

  for (const [field, messages] of Object.entries(errors)) {
    const [first] = messages;
    if (first !== undefined) {
      result[field] = first;
    }
  }

  return result;
}

async function readJsonBody(response: Response): Promise<ErrorBody> {
  try {
    return (await response.json()) as ErrorBody;
  } catch {
    return null;
  }
}

function apiUrl(path: string): string {
  return `${getPublicEnv().NEXT_PUBLIC_API_URL}/api/v1${path}`;
}

async function postJson(path: string, payload: unknown): Promise<Response> {
  return fetch(apiUrl(path), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(payload),
  });
}

async function toFormResult(response: Response): Promise<FormResult> {
  if (response.ok) {
    return { ok: true };
  }

  const body = await readJsonBody(response);

  return {
    ok: false,
    status: response.status,
    fieldErrors: mapValidationErrors(body),
    message: body?.message,
  };
}

/** `POST /contact`. `201` on success. */
export async function submitContact(payload: ContactPayload): Promise<FormResult> {
  const response = await postJson('/contact', payload);
  return toFormResult(response);
}

/**
 * `POST /newsletter`. Responds `{ data: { subscribed: true } }` on both
 * `201` (first subscription) and `200` (email already subscribed) — either
 * way this resolves to `{ ok: true }`.
 */
export async function subscribeNewsletter(payload: NewsletterPayload): Promise<FormResult> {
  const response = await postJson('/newsletter', payload);
  return toFormResult(response);
}

/**
 * `POST /downloads/{file}/link`. Returns the temporary download URL, or
 * throws `ApiError` (e.g. `404` for a missing/unpublished file).
 */
export async function requestDownloadLink(fileId: number): Promise<{ url: string; expires_at: string }> {
  const response = await fetch(apiUrl(`/downloads/${fileId}/link`), {
    method: 'POST',
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    const body = await readJsonBody(response);
    throw new ApiError(
      response.status,
      body,
      `A API respondeu ${response.status} para /downloads/${fileId}/link.`,
    );
  }

  const json = (await response.json()) as { data: { url: string; expires_at: string } };
  return json.data;
}
