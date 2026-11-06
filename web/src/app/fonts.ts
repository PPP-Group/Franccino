import { Jost } from 'next/font/google';

/**
 * Fonte do site inteiro (pedido do Pedro Ivo em 06/11/2026: "fonte do site todo vai ser essa"): Jost, nos títulos e no
 * texto. Usa a SIL Open Font License 1.1, que permite uso em site (o OFL.txt veio no zip enviado). O next/font baixa
 * os arquivos no build e serve pelo próprio site, só com o subconjunto latino. Os tokens em src/styles/tokens.css leem
 * `--font-sans`. A logo FRANCCINO é outra coisa: é o desenho da marca, em vetor (components/layout/Logo.tsx).
 */
// Sem lista de pesos: carrega a versão variável (um arquivo por estilo), com o itálico de verdade para o <em>.
export const jost = Jost({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  variable: '--font-sans',
  display: 'swap',
});

export const fontVariables = jost.variable;
