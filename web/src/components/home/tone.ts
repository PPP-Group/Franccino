/**
 * Fundo de cada seção da home (rodada 3, retorno do tech lead de 06/11/2026: "mudar o fundo de uma seção para outra,
 * uma mais clara e outra areia"). A página alterna branco e areia na ordem em que as seções aparecem; as faixas de foto
 * em largura total (Casa e Giardini, Fábrica) não entram na conta.
 */
export type Tone = 'paper' | 'sand';

/** Classes da seção com o fundo do tom (`.section--paper` e `.section--sand` em components.css e home.css). */
export function sectionClass(tone: Tone, extra?: string): string {
  return ['section', `section--${tone}`, extra].filter(Boolean).join(' ');
}

/** Tons alternados para as seções com fundo, a partir do branco (a primeira depois do banner). */
export function alternateTones(count: number): Tone[] {
  return Array.from({ length: count }, (_, index) => (index % 2 === 0 ? 'paper' : 'sand'));
}
