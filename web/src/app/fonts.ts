import { Archivo } from 'next/font/google';

/**
 * Fonte provisória (stand-in) até o manual de marca (PRODUCT.md). Para trocar,
 * substitua esta chamada (ou use next/font/local) mantendo `variable: '--font-brand'`:
 * os tokens em src/styles/tokens.css só leem essa variável.
 */
export const archivo = Archivo({
  subsets: ['latin'],
  axes: ['wdth'],
  variable: '--font-brand',
  display: 'swap',
});
