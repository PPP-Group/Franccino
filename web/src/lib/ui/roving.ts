/**
 * Próximo índice num grupo com foco itinerante (roving tabindex): setas cíclicas, Home e End.
 * Implementado uma única vez para ser reaproveitado por qualquer grupo de foco itinerante
 * (abas e amostras de acabamento aqui; a planta de medidas da Task 8 reaproveita esta função).
 */
export function nextRovingIndex(count: number, current: number, key: string): number | null {
  if (count === 0) {
    return null;
  }
  switch (key) {
    case 'ArrowRight':
    case 'ArrowDown':
      return (current + 1) % count;
    case 'ArrowLeft':
    case 'ArrowUp':
      return (current - 1 + count) % count;
    case 'Home':
      return 0;
    case 'End':
      return count - 1;
    default:
      return null;
  }
}
