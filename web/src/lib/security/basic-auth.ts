import { timingSafeEqual } from 'node:crypto';

const BASIC_SCHEME = 'Basic';

function safeEqual(a: string, b: string): boolean {
  const bufferA = Buffer.from(a, 'utf8');
  const bufferB = Buffer.from(b, 'utf8');

  if (bufferA.length !== bufferB.length) {
    return false;
  }

  return timingSafeEqual(bufferA, bufferB);
}

/**
 * Checks an `Authorization` header against the expected HTTP Basic
 * credentials, using a constant-time comparison to avoid leaking the
 * password length or contents through response timing.
 */
export function checkBasicAuth(header: string | null, user: string, password: string): boolean {
  if (!header) {
    return false;
  }

  const [scheme, encoded] = header.split(' ');

  if (scheme !== BASIC_SCHEME || !encoded) {
    return false;
  }

  const decoded = Buffer.from(encoded, 'base64').toString('utf8');

  return safeEqual(decoded, `${user}:${password}`);
}
