import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { useQuoteCount, useQuoteItems } from './hooks';

function Probe() {
  return `${useQuoteItems().length}/${useQuoteCount()}`;
}

describe('hooks da lista de orçamento', () => {
  it('rendem a lista vazia no servidor, sem ler o navegador', () => {
    expect(renderToString(createElement(Probe))).toBe('0/0');
  });
});
