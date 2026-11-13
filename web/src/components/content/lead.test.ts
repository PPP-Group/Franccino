import { describe, expect, it } from 'vitest';
import { distinctLead, plainText } from './lead';

describe('plainText', () => {
  it('drops tags, decodes common entities and joins spaces', () => {
    expect(plainText('<p>Forma &amp;\n  função</p>')).toBe('forma & função');
  });
});

describe('distinctLead', () => {
  const bio =
    '<p>Traz ao desenho de produto uma leitura precisa.</p><p>Cada peça é pensada como presença.</p>';

  it('hides the summary when the full text already opens with it', () => {
    expect(distinctLead('Traz ao desenho de produto uma leitura precisa.', bio)).toBeNull();
    expect(distinctLead('Traz ao desenho de produto uma leitura precisa…', bio)).toBeNull();
  });

  it('hides the summary when it is a paragraph further down the full text', () => {
    expect(distinctLead('Cada peça é pensada como presença.', bio)).toBeNull();
  });

  it('keeps a summary that says something else', () => {
    expect(distinctLead('Designer italiano.', bio)).toBe('Designer italiano.');
    expect(distinctLead('Designer italiano.', null)).toBe('Designer italiano.');
  });

  it('returns null without a summary', () => {
    expect(distinctLead(null, bio)).toBeNull();
    expect(distinctLead('  ', bio)).toBeNull();
  });
});
