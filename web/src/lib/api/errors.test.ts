import { describe, expect, it } from 'vitest';
import { ApiError, isValidationError } from './errors';

describe('isValidationError', () => {
  it('is true for a 422 ApiError', () => {
    expect(isValidationError(new ApiError(422, { message: 'invalid' }))).toBe(true);
  });

  it('is false for a non-422 ApiError', () => {
    expect(isValidationError(new ApiError(500, null))).toBe(false);
    expect(isValidationError(new ApiError(404, null))).toBe(false);
  });

  it('is false for a non-ApiError value', () => {
    expect(isValidationError(new Error('boom'))).toBe(false);
    expect(isValidationError('boom')).toBe(false);
    expect(isValidationError(null)).toBe(false);
  });
});
