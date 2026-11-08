import type { ViewTransitionClass } from 'react';
import type { Image } from '@/lib/api/types';

/**
 * Foto que cresce do card até a página que ele abre, e volta encolhendo (banco de ideias, ideia 10; retorno de
 * 06/11/2026). Regras deste módulo, usadas por `MorphImage` e pelo controle da navegação (`PageTransition`):
 *
 * - Só a navegação marcada com o tipo do par (`morphType`) anima: o clique num link de origem (`transitionTypes` no `Link`),
 *   a volta pelo navegador, o caminho (breadcrumb) ou o logo para a página de onde a peça foi aberta. Entre duas
 *   listagens nada se mexe, mesmo que a mesma peça apareça nas duas.
 * - O nome identifica o par: `product-<slug>`, `feature-<slug>` (a peça em destaque da home), `collection-<slug>`,
 *   `project-<slug>`, `area-<key>`, `designer-<slug>` (o retrato abre a página do designer, retorno de 07/11/2026). A foto grande da página de destino adota o nome da origem clicada.
 * - Para a foto de destino não sair em branco no meio do movimento, a primeira pintura usa uma versão da foto que já
 *   foi baixada nesta visita; a versão do tamanho certo entra logo depois do movimento.
 */

/**
 * Tipo da transição "abrir esta peça" e "voltar dela" (React `addTransitionType`). Leva o nome do par: só a foto
 * clicada se mexe, mesmo que outras peças da página de origem também apareçam na página aberta (numa esteira).
 */
export function morphType(name: string): string {
  return `morph:${name}`;
}

/** Para o `transitionTypes` do link de origem. */
export function morphTypes(name: string): string[] {
  return [morphType(name)];
}

export type MorphKind = 'product' | 'feature' | 'collection' | 'project' | 'area' | 'designer';

/** Como a foto se encaixa no quadro durante o movimento: produto em fundo branco (inteiro) ou foto recortada. */
export type MorphFit = 'contain' | 'cover';

export function morphName(kind: MorphKind, slug: string): string {
  return `${kind}-${slug}`;
}

/** `share` do `<ViewTransition>`: anima o par só na navegação marcada com o nome dele; nas outras, nenhum nome. */
export function morphShare(fit: MorphFit, name: string): ViewTransitionClass {
  return { [morphType(name)]: fit === 'contain' ? 'morph-contain' : 'morph-cover', default: 'none' };
}

/**
 * A maior versão da foto que já foi baixada (`isLoaded`), ou `null`. Uma versão já baixada aparece na hora (o
 * navegador guarda as fotos da visita); o tamanho exato do quadro chega depois.
 */
export function pickLoadedSource(image: Image, isLoaded: (url: string) => boolean): string | null {
  const candidates = [...image.srcset].sort((a, b) => b.width - a.width).map((entry) => entry.url);
  if (!candidates.includes(image.src)) {
    candidates.push(image.src);
  }
  return candidates.find((url) => isLoaded(url)) ?? null;
}

/** Ligação entre duas entradas do histórico: a página `to` foi aberta pela origem `name` da página `from`. */
export type MorphEdge = { from: string; fromHref: string; name: string };

/**
 * Nome do par quando o salto no histórico (`fromKey` → `toKey`) desfaz ou refaz uma abertura de peça; senão `null`.
 * `edges` liga cada entrada aberta por uma origem à entrada de onde ela foi aberta.
 */
export function traversalMorphName(
  edges: ReadonlyMap<string, MorphEdge>,
  fromKey: string,
  toKey: string,
): string | null {
  const back = edges.get(fromKey);
  if (back && back.from === toKey) {
    return back.name;
  }
  const forward = edges.get(toKey);
  if (forward && forward.from === fromKey) {
    return forward.name;
  }
  return null;
}

/** Mesmo endereço, sem o `#`: o breadcrumb que leva de volta à página de onde a peça foi aberta. */
export function sameDocumentHref(a: string, b: string): boolean {
  try {
    const left = new URL(a);
    const right = new URL(b);
    return left.origin === right.origin && left.pathname === right.pathname && left.search === right.search;
  } catch {
    return false;
  }
}

/* ---------- estado da navegação em curso (só no navegador) ---------- */

/** Origem clicada (ou destino da volta): nome do par, caminho da página que vai abrir e a foto já pintada. */
export type PendingMorph = { name: string; path: string; src: string | null; at: number };

const PENDING_TTL_MS = 10_000;
let pending: PendingMorph | null = null;
const loaded = new Set<string>();

export function setPendingMorph(next: Omit<PendingMorph, 'at'> | null): void {
  pending = next ? { ...next, at: Date.now() } : null;
}

/** A navegação em curso, se ela abre (ou volta para) `path`. Nunca durante a hidratação: só depois de um clique. */
export function pendingMorphFor(path: string): PendingMorph | null {
  if (!pending || pending.path !== path || Date.now() - pending.at > PENDING_TTL_MS) {
    return null;
  }
  return pending;
}

export function markImageLoaded(url: string): void {
  if (url) {
    loaded.add(url);
  }
}

export function isImageLoaded(url: string): boolean {
  return loaded.has(url);
}
