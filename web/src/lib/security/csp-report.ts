type Report = Record<string, unknown>;

/** One line per CSP violation report (both the `report-uri` and the Reporting API formats), or null. */
export function summarizeReport(body: unknown): string | null {
  const report = (body as { 'csp-report'?: Report } | null)?.['csp-report'] ?? (body as Report | null);
  if (!report || typeof report !== 'object') {
    return null;
  }
  const pick = (...keys: string[]) =>
    keys.map((key) => report[key]).find((value) => typeof value === 'string');
  return [
    pick('violated-directive', 'effective-directive', 'effectiveDirective'),
    pick('blocked-uri', 'blockedURL'),
    pick('document-uri', 'documentURL'),
  ]
    .filter(Boolean)
    .join(' | ');
}
