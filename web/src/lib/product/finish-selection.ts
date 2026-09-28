import type { ProductDetail } from '@/lib/api/types';
import type { QuoteFinish } from '@/lib/quote/types';

export type FinishGroup = ProductDetail['finishes'][number];
/** Nome do grupo → id do acabamento escolhido. */
export type FinishSelection = Readonly<Record<string, number>>;

/** A API não tem acabamento "padrão" (conflito C2): só pré-seleciona grupo com uma única opção. */
export function initialSelection(groups: FinishGroup[]): FinishSelection {
  const selection: Record<string, number> = {};
  for (const group of groups) {
    const [only] = group.items;
    if (group.items.length === 1 && only) {
      selection[group.group] = only.id;
    }
  }
  return selection;
}

export function selectFinish(selection: FinishSelection, group: string, id: number): FinishSelection {
  return { ...selection, [group]: id };
}

export function selectedFinishes(groups: FinishGroup[], selection: FinishSelection): QuoteFinish[] {
  const result: QuoteFinish[] = [];
  for (const group of groups) {
    const item = group.items.find((candidate) => candidate.id === selection[group.group]);
    if (item) {
      result.push({ id: item.id, group: group.group, name: item.name, code: item.code });
    }
  }
  return result;
}

export function pendingGroups(groups: FinishGroup[], selection: FinishSelection): string[] {
  return groups
    .filter(
      (group) => group.items.length > 0 && !group.items.some((item) => item.id === selection[group.group]),
    )
    .map((group) => group.group);
}
