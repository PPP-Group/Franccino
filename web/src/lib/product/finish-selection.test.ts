import { describe, expect, it } from 'vitest';
import { productDetail } from '@/test/fixtures';
import { initialSelection, pendingGroups, selectedFinishes, selectFinish } from './finish-selection';

const groups = productDetail().finishes;

describe('finish selection', () => {
  it('preselects only groups with a single option (no fake "standard" finish)', () => {
    expect(initialSelection(groups)).toEqual({ Tecido: 201 });
  });

  it('selects and lists finishes in group order', () => {
    const selection = selectFinish(initialSelection(groups), 'Madeira', 102);
    expect(selectedFinishes(groups, selection)).toEqual([
      { id: 102, group: 'Madeira', name: 'Freijó', code: 'MD-02' },
      { id: 201, group: 'Tecido', name: 'Linho cru', code: 'TC-110' },
    ]);
  });

  it('ignores ids that do not belong to the group', () => {
    expect(selectedFinishes(groups, { Madeira: 999 })).toEqual([]);
  });

  it('lists the groups still to be chosen', () => {
    expect(pendingGroups(groups, { Tecido: 201 })).toEqual(['Madeira']);
    expect(pendingGroups(groups, { Tecido: 201, Madeira: 101 })).toEqual([]);
  });
});
