import { afterEach, describe, expect, it } from 'vitest';
import { clearLeadToken, readLeadToken, saveLeadToken } from './lead-token';

describe('lead token', () => {
  afterEach(() => clearLeadToken());

  it('keeps the token in memory when the browser storage is missing', () => {
    expect(readLeadToken()).toBeNull();
    saveLeadToken('abc');
    expect(readLeadToken()).toBe('abc');
    clearLeadToken();
    expect(readLeadToken()).toBeNull();
  });
});
