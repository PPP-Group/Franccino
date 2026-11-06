/**
 * Frase de abertura sem repetição (revisão de 06/11/2026): no conteúdo importado do WordPress, o resumo do designer
 * e do projeto costuma ser o primeiro parágrafo do texto completo. Mostrar os dois deixava o mesmo parágrafo duas
 * vezes na tela. Lógica pura, sem React.
 */

const ENTITIES: Record<string, string> = {
  '&amp;': '&',
  '&nbsp;': ' ',
  '&quot;': '"',
  '&#39;': "'",
  '&lt;': '<',
  '&gt;': '>',
};

/** Texto comparável: sem tags, entidades comuns decodificadas, espaços juntos, minúsculas. */
export function plainText(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&(amp|nbsp|quot|#39|lt|gt);/g, (entity) => ENTITIES[entity] ?? entity)
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

/**
 * O resumo a mostrar como frase de abertura, ou `null` quando o texto completo já começa com ele (aí o texto
 * completo basta).
 */
export function distinctLead(
  lead: string | null | undefined,
  html: string | null | undefined,
): string | null {
  if (!lead || lead.trim() === '') {
    return null;
  }
  if (!html) {
    return lead;
  }
  // Compara só o começo: o resumo às vezes termina com reticências ou sem o ponto final do parágrafo.
  const start = plainText(lead).replace(/[.…\s]+$/, '');
  return start !== '' && plainText(html).startsWith(start) ? null : lead;
}
