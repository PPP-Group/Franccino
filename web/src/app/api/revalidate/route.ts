/**
 * On-demand cache revalidation, called by the API after content changes (see
 * `docs/api.md`, "Revalidação do front"). Requires the shared secret in the
 * `x-revalidate-secret` header and a body of `{ tags: CacheTag[] }`.
 */

import { revalidateTag } from 'next/cache';
import { z } from 'zod';
import { serverEnv } from '@/lib/env';
import { safeEqual } from '@/lib/security/basic-auth';
import type { CacheTag } from '@/lib/api/types';

/** Every tag in the contract (`docs/api.md`, "Revalidação do front"). */
const CACHE_TAGS = [
  'home',
  'areas',
  'categories',
  'products',
  'lines',
  'designers',
  'collections',
  'launches',
  'projects',
  'clients',
  'stores',
  'finishes',
  'banners',
  'scenes',
  'pages',
  'settings',
  'redirects',
] as const satisfies readonly CacheTag[];

const bodySchema = z.object({
  tags: z.array(z.enum(CACHE_TAGS)).min(1),
});

export async function POST(request: Request): Promise<Response> {
  const { REVALIDATE_SECRET } = serverEnv();
  const providedSecret = request.headers.get('x-revalidate-secret');

  if (!REVALIDATE_SECRET || !providedSecret || !safeEqual(providedSecret, REVALIDATE_SECRET)) {
    return Response.json({ message: 'Não autorizado.' }, { status: 401 });
  }

  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);

  if (!parsed.success) {
    return Response.json({ message: 'Corpo inválido.' }, { status: 400 });
  }

  const { tags } = parsed.data;
  // Expira na hora (retorno de 13/11/2026: o 3D enviado pela importação não aparecia). Com 'max', a 1ª visita depois
  // da mudança ainda recebia a página antiga e só a seguinte via a nova. O aviso vem da API (fora de uma Server Action),
  // o caso em que a documentação do Next pede `{ expire: 0 }`.
  for (const tag of tags) {
    revalidateTag(tag, { expire: 0 });
  }

  return Response.json({ revalidated: true, tags });
}
