/**
 * Receives the browser's CSP violation reports (`report-uri` in `src/lib/security/csp.ts`) and writes them to the
 * server log, so staging shows what the policy would block before `CSP_ENFORCE=true` (`docs/runbook-deploy.md`).
 * Outside the basic auth of staging (the proxy skips `/api`); bodies over 8 KB are ignored.
 */

import { summarizeReport } from '@/lib/security/csp-report';

const MAX_BODY = 8_192;

export async function POST(request: Request): Promise<Response> {
  const text = await request.text();
  if (text.length > 0 && text.length <= MAX_BODY) {
    try {
      const summary = summarizeReport(JSON.parse(text));
      if (summary) {
        console.warn(`[csp] ${summary}`);
      }
    } catch {
      // Not JSON: nothing to log.
    }
  }
  return new Response(null, { status: 204 });
}
