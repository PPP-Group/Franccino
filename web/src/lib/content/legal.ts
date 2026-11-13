import type { Block } from '@/lib/api/types';

const LEADING_HEADING = /^\s*(?:<p>\s*(?:<br\s*\/?>)?\s*<\/p>\s*)*<h[1-3][^>]*>[\s\S]*?<\/h[1-3]>\s*/i;

/**
 * Tira o título que o próprio documento traz no começo (Política de privacidade, Termos e condições): a página já tem o
 * título dela, e os dois apareciam um embaixo do outro (revisão da Franccino, 12/11/2026, itens 26 e 27). Só o primeiro
 * título do primeiro bloco de texto, e só quando nada vem antes dele; o resto do texto fica como está.
 */
export function withoutLeadingTitle(blocks: Block[]): Block[] {
  const [first, ...rest] = blocks;
  if (!first || first.type !== 'rich_text' || !LEADING_HEADING.test(first.data.body)) {
    return blocks;
  }
  const body = first.data.body.replace(LEADING_HEADING, '');
  return body.trim() === '' ? rest : [{ ...first, data: { ...first.data, body } }, ...rest];
}
