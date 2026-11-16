'use client';

import { useTranslations } from 'next-intl';
import { useEffect } from 'react';
import { Link } from '@/i18n/navigation';

/**
 * Conteúdo da página "não encontrada" dentro de `/pt` e `/en`. Fica no navegador porque a página 404 não recebe o
 * idioma pelos parâmetros: no servidor, o next-intl o leria dos cabeçalhos da requisição, e uma página estática que
 * chama `notFound()` (peça, coleção, designer, projeto com endereço inexistente) virava dinâmica no meio da resposta e
 * dava erro 500 ("Page changed from static to dynamic at runtime", log do deploy de 16/11/2026). As mensagens chegam
 * pelo `NextIntlClientProvider` do layout.
 */
export function NotFoundBody() {
  const t = useTranslations('errors.notFound');
  const title = t('title');
  // O título da aba, que o servidor não traduz aqui (ver acima).
  useEffect(() => {
    document.title = title;
  }, [title]);
  return (
    <main className="wrap error-page">
      <div className="empty">
        <h1>{t('title')}</h1>
        <p className="lead">{t('description')}</p>
        <div className="empty__actions">
          <Link className="btn" href="/">
            {t('backHome')}
          </Link>
          <Link className="btn btn--ghost" href="/products">
            {t('catalog')}
          </Link>
        </div>
      </div>
    </main>
  );
}
