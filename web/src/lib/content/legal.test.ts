import { describe, expect, it } from 'vitest';
import type { Block } from '@/lib/api/types';
import { withoutLeadingTitle } from './legal';

const text = (body: string): Block => ({ type: 'rich_text', data: { body } });

describe('withoutLeadingTitle', () => {
  it('drops the heading the document repeats at the top', () => {
    const blocks = [text('<h2>Termos e condições de uso</h2><p>Sejam bem-vindos.</p>'), text('<p>Mais</p>')];
    expect(withoutLeadingTitle(blocks)).toEqual([text('<p>Sejam bem-vindos.</p>'), text('<p>Mais</p>')]);
  });

  it('ignores empty paragraphs before the heading and removes a block left empty', () => {
    expect(withoutLeadingTitle([text('<p></p><h1>Política</h1>'), text('<p>Texto</p>')])).toEqual([
      text('<p>Texto</p>'),
    ]);
  });

  it('keeps everything when the text starts with a paragraph or another block', () => {
    const paragraph = [text('<p>Belo Horizonte</p><h2>Identificação</h2>')];
    expect(withoutLeadingTitle(paragraph)).toBe(paragraph);
    expect(withoutLeadingTitle([])).toEqual([]);
  });
});
