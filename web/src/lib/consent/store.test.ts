import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  CONSENT_STORAGE_KEY,
  COOKIE_POLICY_VERSION,
  getConsent,
  parseStoredConsent,
  resetConsentStoreForTests,
  setConsent,
  subscribeConsent,
} from './store';

class MemoryStorage {
  readonly map = new Map<string, string>();
  getItem(key: string) {
    return this.map.get(key) ?? null;
  }
  setItem(key: string, value: string) {
    this.map.set(key, value);
  }
}

describe('consent store', () => {
  let storage: MemoryStorage;
  beforeEach(() => {
    resetConsentStoreForTests();
    storage = new MemoryStorage();
    vi.stubGlobal('window', Object.assign(new EventTarget(), { localStorage: storage }));
  });
  afterEach(() => vi.unstubAllGlobals());

  it('starts without a choice', () => {
    expect(getConsent()).toBeNull();
  });

  it('stores the choice with a visitor id, keeps the id and notifies subscribers', () => {
    const listener = vi.fn();
    subscribeConsent(listener);
    const first = setConsent('granted', () => 'id-1');
    const second = setConsent('denied', () => 'id-2');
    expect(first).toBe('id-1');
    expect(second).toBe('id-1');
    expect(getConsent()).toBe('denied');
    expect(JSON.parse(storage.map.get(CONSENT_STORAGE_KEY)!)).toEqual({
      choice: 'denied',
      visitorId: 'id-1',
      version: COOKIE_POLICY_VERSION,
    });
    expect(listener).toHaveBeenCalledTimes(2);
  });

  it('treats invalid text and an older policy version as no choice', () => {
    expect(parseStoredConsent('nope')).toBeNull();
    expect(
      parseStoredConsent(JSON.stringify({ choice: 'maybe', visitorId: 'x', version: COOKIE_POLICY_VERSION })),
    ).toBeNull();
    expect(
      parseStoredConsent(JSON.stringify({ choice: 'granted', visitorId: 'x', version: '2000-01-01' })),
    ).toBeNull();
  });
});
