/** Mensagens dos navegadores quando um arquivo de script do site não carrega (404 depois de um deploy). */
const CHUNK_ERROR =
  /ChunkLoadError|Loading chunk|Failed to load chunk|dynamically imported module|Importing a module script failed/i;

const KEY = 'franccino:chunk-reload';

export function isChunkLoadError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const { name, message } = error as { name?: string; message?: string };
  return CHUNK_ERROR.test(`${name ?? ''} ${message ?? ''}`);
}

/**
 * Durante um deploy, a página pode vir de uma versão do site e os scripts de outra (09/11/2026): o script falta e a tela
 * de erro aparece. Recarrega a página uma vez (a versão nova chega inteira); na segunda falha seguida, mostra o erro.
 */
export function reloadOnceForChunkError(error: unknown): boolean {
  if (typeof window === 'undefined' || !isChunkLoadError(error)) return false;
  try {
    const last = Number(window.sessionStorage.getItem(KEY) ?? 0);
    if (Date.now() - last < 30_000) return false;
    window.sessionStorage.setItem(KEY, String(Date.now()));
  } catch {
    return false;
  }
  window.location.reload();
  return true;
}
