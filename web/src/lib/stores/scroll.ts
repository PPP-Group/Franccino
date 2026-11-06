/**
 * A loja cabe inteira na tela, abaixo do cabeçalho fixo? Só quando não cabe é que o clique no pino rola a página
 * (rolar até algo que já está à vista desorienta).
 */
export function isFullyVisible(
  rect: { top: number; bottom: number },
  viewportHeight: number,
  headerHeight: number,
): boolean {
  return rect.top >= headerHeight && rect.bottom <= viewportHeight;
}
