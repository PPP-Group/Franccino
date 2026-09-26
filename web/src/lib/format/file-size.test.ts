import { describe, expect, it } from 'vitest';
import { formatFileSize } from './file-size';

describe('formatFileSize', () => {
  it('uses KB below one megabyte and MB with one decimal above', () => {
    expect(formatFileSize(880_640, 'pt')).toBe('860 KB');
    expect(formatFileSize(1_258_291, 'pt')).toBe('1,2 MB');
    expect(formatFileSize(1_258_291, 'en')).toBe('1.2 MB');
    expect(formatFileSize(500, 'en')).toBe('1 KB');
  });
});
