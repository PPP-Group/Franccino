/**
 * Números que "contam" até o valor quando entram na tela (banco de ideias, ideia 12: "em vez de só aparecer 20, ele
 * vai 2, 6... até chegar no 20"). O valor vem do painel como texto livre (bloco "Números" das páginas), então aqui só
 * se separa o número do que vem antes e depois e se remonta cada quadro no mesmo formato. Texto sem número, ou um
 * ano solto ("2000"), não anima.
 */

export type Countable = {
  prefix: string;
  value: number;
  suffix: string;
  decimals: number;
  /** Separador de milhar do texto original ("." em "1.500"), ou vazio. */
  thousands: string;
  /** Separador decimal do texto original ("," em "1,5"), ou vazio. */
  decimal: string;
};

const NUMBER = /^(\D*?)(\d{1,3}(?:([.,\s])\d{3})+|\d+)(?:([.,])(\d+))?(\D*)$/;

export function parseCountable(text: string): Countable | null {
  const match = NUMBER.exec(text.trim());
  if (!match) {
    return null;
  }
  const [, prefix = '', integer = '', thousands = '', decimal = '', fraction = '', suffix = ''] = match;
  // "2000" sozinho é um ano (ano de fundação), não uma contagem.
  if (!thousands && !fraction && /^(19|20)\d{2}$/.test(integer)) {
    return null;
  }
  const digits = thousands ? integer.split(thousands).join('') : integer;
  return {
    prefix,
    value: Number(fraction ? `${digits}.${fraction}` : digits),
    suffix,
    decimals: fraction.length,
    thousands,
    decimal,
  };
}

export function formatCountable(countable: Countable, value: number): string {
  const fixed = value.toFixed(countable.decimals);
  const [integer = '0', fraction] = fixed.split('.');
  const grouped = countable.thousands
    ? integer.replace(/\B(?=(\d{3})+(?!\d))/g, countable.thousands)
    : integer;
  const number = fraction ? `${grouped}${countable.decimal}${fraction}` : grouped;
  return `${countable.prefix}${number}${countable.suffix}`;
}

/** Desaceleração no fim (ease-out cúbico): o número corre no começo e assenta no valor. */
export function easeOutCubic(progress: number): number {
  const clamped = Math.min(Math.max(progress, 0), 1);
  return 1 - (1 - clamped) ** 3;
}

/** Valor mostrado num instante da animação (`progress` de 0 a 1). */
export function countAt(countable: Countable, progress: number): string {
  return formatCountable(countable, countable.value * easeOutCubic(progress));
}
