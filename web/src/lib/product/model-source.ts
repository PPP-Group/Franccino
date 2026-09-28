/**
 * `@google/model-viewer` guarda o resultado de cada carga por URL, inclusive a falha; uma nova
 * tentativa com a mesma URL reaproveitaria o erro. A partir da segunda tentativa a URL ganha
 * `retry=N`, o que força um novo download (os GLB são mídia pública, sem assinatura).
 */
export function modelSourceForAttempt(src: string, attempt: number): string {
  if (attempt === 0) {
    return src;
  }

  return `${src}${src.includes('?') ? '&' : '?'}retry=${attempt}`;
}
