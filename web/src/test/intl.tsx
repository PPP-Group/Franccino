import { NextIntlClientProvider } from 'next-intl';
import type { ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import en from '../../messages/en.json';
import pt from '../../messages/pt.json';

/** Renderiza para HTML estático com as mensagens reais do idioma (testes de componente sem DOM). */
export function renderWithIntl(ui: ReactElement, locale: 'pt' | 'en' = 'pt'): string {
  return renderToStaticMarkup(
    <NextIntlClientProvider locale={locale} messages={locale === 'pt' ? pt : en} timeZone="America/Sao_Paulo">
      {ui}
    </NextIntlClientProvider>,
  );
}
