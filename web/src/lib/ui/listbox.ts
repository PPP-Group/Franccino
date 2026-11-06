/**
 * Lógica pura da lista de opções do `Select` (components/ui/Select.tsx), no padrão "select-only combobox" do
 * WAI-ARIA APG: setas sem dar a volta, Home e End, PageUp e PageDown de 10 em 10, e a busca por digitação.
 */

export const LISTBOX_PAGE = 10;

/** Próximo índice ativo para a tecla, ou `null` quando a tecla não move a seleção. */
export function nextListboxIndex(count: number, current: number, key: string): number | null {
  if (count === 0) {
    return null;
  }
  const last = count - 1;
  const from = current < 0 ? -1 : Math.min(current, last);
  switch (key) {
    case 'ArrowDown':
      return Math.min(from + 1, last);
    case 'ArrowUp':
      return from < 0 ? last : Math.max(from - 1, 0);
    case 'Home':
      return 0;
    case 'End':
      return last;
    case 'PageDown':
      return Math.min(Math.max(from, 0) + LISTBOX_PAGE, last);
    case 'PageUp':
      return Math.max(from - LISTBOX_PAGE, 0);
    default:
      return null;
  }
}

/** Compara sem caixa e sem acento ("sao" acha "São Paulo"). */
function fold(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLocaleLowerCase();
}

/**
 * Busca por digitação: a primeira opção cujo texto começa com `query`, a partir da opção depois da atual (dando a
 * volta). Repetir a mesma letra ("aaa") percorre as opções que começam com ela.
 */
export function typeAheadIndex(labels: readonly string[], query: string, current: number): number | null {
  if (labels.length === 0 || query === '') {
    return null;
  }
  const folded = fold(query);
  const sameLetter = [...folded].every((char) => char === folded[0]);
  const needle = sameLetter && folded.length > 1 ? folded[0] : folded;
  // Uma letra só (ou a mesma repetida) começa na próxima opção; uma palavra continua na atual enquanto ela servir.
  const offset = needle.length === 1 ? 1 : 0;
  const start = current < 0 ? 0 : current + offset;
  for (let step = 0; step < labels.length; step += 1) {
    const index = (start + step) % labels.length;
    if (fold(labels[index]).startsWith(needle)) {
      return index;
    }
  }
  return null;
}

/** Tecla que conta para a busca por digitação: um caractere imprimível, sem Ctrl, Alt nem Meta. */
export function isTypeAheadKey(event: {
  key: string;
  ctrlKey: boolean;
  altKey: boolean;
  metaKey: boolean;
}): boolean {
  return event.key.length === 1 && !event.ctrlKey && !event.altKey && !event.metaKey;
}
