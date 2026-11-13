/**
 * Token do cadastro antes do download (revisão da Franccino, 12/11/2026, item 22), guardado no navegador para não
 * pedir os dados a cada arquivo. Sem `localStorage` (aba privada, bloqueado), o cadastro vale só até recarregar.
 */
const KEY = 'franccino:download-lead';
let memory: string | null = null;

export function readLeadToken(): string | null {
  try {
    return window.localStorage.getItem(KEY) ?? memory;
  } catch {
    return memory;
  }
}

export function saveLeadToken(token: string): void {
  memory = token;
  try {
    window.localStorage.setItem(KEY, token);
  } catch {
    // Fica só na memória.
  }
}

export function clearLeadToken(): void {
  memory = null;
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    // Nada a limpar.
  }
}
