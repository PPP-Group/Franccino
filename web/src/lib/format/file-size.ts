import { htmlLang, type Locale } from '@/i18n/config';

const MB = 1024 * 1024;

/** Formats a download's byte size as `"860 KB"` or `"1,2 MB"` (pt) / `"1.2 MB"` (en). */
export function formatFileSize(bytes: number, locale: Locale): string {
  const tag = htmlLang(locale);
  if (bytes < MB) {
    const kb = Math.max(1, Math.round(bytes / 1024));
    return `${new Intl.NumberFormat(tag, { maximumFractionDigits: 0 }).format(kb)} KB`;
  }
  return `${new Intl.NumberFormat(tag, { maximumFractionDigits: 1 }).format(bytes / MB)} MB`;
}
