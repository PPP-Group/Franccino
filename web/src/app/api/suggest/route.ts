/**
 * Sugestões da busca do cabeçalho: `GET /api/suggest?locale=pt&q=cadeira` devolve `{ data: Suggestion[] }`. O proxy
 * não passa por `/api`, então a senha do staging é conferida aqui, como no resto do site.
 */

import { serverEnv } from '@/lib/env';
import { findSuggestions } from '@/lib/search/server';
import { checkBasicAuth } from '@/lib/security/basic-auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request): Promise<Response> {
  const env = serverEnv();
  if (env.SITE_ENV === 'staging') {
    const { STAGING_BASIC_AUTH_USER: user, STAGING_BASIC_AUTH_PASSWORD: password } = env;
    const authorized =
      user !== undefined &&
      password !== undefined &&
      checkBasicAuth(request.headers.get('authorization'), user, password);
    if (!authorized) {
      // O mesmo realm do proxy: o navegador reenvia a senha que já tem guardada.
      return new Response(null, {
        status: 401,
        headers: { 'WWW-Authenticate': 'Basic realm="Franccino staging"' },
      });
    }
  }
  const params = new URL(request.url).searchParams;
  const data = await findSuggestions(params.get('locale') ?? '', params.get('q') ?? '');
  return Response.json(
    { data },
    { headers: { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow' } },
  );
}
