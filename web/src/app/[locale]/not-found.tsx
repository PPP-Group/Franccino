import type { Metadata } from 'next';
import { NotFoundBody } from '@/components/content/NotFoundBody';

// Sem título traduzido aqui: ler o idioma no servidor tornaria dinâmica a página estática que chamou `notFound()`
// (ver `NotFoundBody`). O título fica o padrão do layout, e a página não é indexada.
export const metadata: Metadata = { robots: { index: false } };

export default function LocaleNotFound() {
  return <NotFoundBody />;
}
