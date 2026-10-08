import { Cormorant_Garamond, EB_Garamond } from 'next/font/google';

/**
 * Fontes do site, pedido da Franccino em 06/10/2026: Cormorant Garamond nos títulos e EB Garamond no texto.
 * As duas usam a SIL Open Font License 1.1, que permite uso em site (o OFL.txt veio no zip enviado pelo cliente).
 * O next/font baixa os arquivos no build e serve pelo próprio site, só com o subconjunto latino.
 * Os tokens em src/styles/tokens.css leem `--font-serif-text` e `--font-serif-display`.
 */
export const ebGaramond = EB_Garamond({
  subsets: ['latin'],
  variable: '--font-serif-text',
  display: 'swap',
});

export const cormorantGaramond = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-serif-display',
  display: 'swap',
});

export const fontVariables = `${ebGaramond.variable} ${cormorantGaramond.variable}`;
