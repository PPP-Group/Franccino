import { describe, expect, it } from 'vitest';
import { checkBasicAuth } from './basic-auth';

function encodeCredentials(user: string, password: string): string {
  return Buffer.from(`${user}:${password}`, 'utf8').toString('base64');
}

describe('checkBasicAuth', () => {
  it('accepts a correctly-encoded header', () => {
    const header = `Basic ${encodeCredentials('admin', 'secret')}`;
    expect(checkBasicAuth(header, 'admin', 'secret')).toBe(true);
  });

  it('rejects a wrong password', () => {
    const header = `Basic ${encodeCredentials('admin', 'wrong')}`;
    expect(checkBasicAuth(header, 'admin', 'secret')).toBe(false);
  });

  it('rejects a wrong user', () => {
    const header = `Basic ${encodeCredentials('someone-else', 'secret')}`;
    expect(checkBasicAuth(header, 'admin', 'secret')).toBe(false);
  });

  it('rejects a missing header', () => {
    expect(checkBasicAuth(null, 'admin', 'secret')).toBe(false);
  });

  it('rejects a header with the wrong scheme', () => {
    const header = `Bearer ${encodeCredentials('admin', 'secret')}`;
    expect(checkBasicAuth(header, 'admin', 'secret')).toBe(false);
  });

  it('rejects a header without encoded credentials', () => {
    expect(checkBasicAuth('Basic', 'admin', 'secret')).toBe(false);
  });

  it('rejects an invalid base64 payload without throwing', () => {
    expect(checkBasicAuth('Basic ###not-base64###', 'admin', 'secret')).toBe(false);
  });
});
