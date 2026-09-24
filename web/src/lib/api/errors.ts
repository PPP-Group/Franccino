/**
 * `ApiError` lives in its own module, separate from `client.ts`, so that
 * browser-only code (e.g. `forms.ts`) can import it without pulling in
 * `client.ts` — which imports `serverEnv` from `@/lib/env` at module scope —
 * into the client bundle's module graph.
 */

/** Thrown for any non-OK API response (4xx/5xx). */
export class ApiError extends Error {
  readonly status: number;
  readonly body: unknown;

  constructor(status: number, body: unknown, message = `A API respondeu ${status}.`) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}
