import { describe, expect, it } from 'vitest';
import { image } from '@/test/fixtures';
import { renderWithIntl } from '@/test/intl';
import { FinishSelector } from './FinishSelector';

const groups = [
  {
    group: 'Tecidos',
    items: [
      { id: 1, name: 'Linho cru', code: 'T01', swatch: image({ id: 7 }) },
      { id: 2, name: 'Bouclé', code: null, swatch: null },
    ],
  },
];

describe('FinishSelector', () => {
  it('offers the chosen finish in detail when it has a photo', () => {
    const html = renderWithIntl(
      <FinishSelector groups={groups} selection={{ Tecidos: 1 }} onSelect={() => {}} note={null} />,
    );
    expect(html).toContain('Ver em detalhe');
    expect(html).toContain('finish-zoom__open-link');
  });

  it('has nothing to open without a choice or without a photo', () => {
    const none = renderWithIntl(
      <FinishSelector groups={groups} selection={{}} onSelect={() => {}} note={null} />,
    );
    const noPhoto = renderWithIntl(
      <FinishSelector groups={groups} selection={{ Tecidos: 2 }} onSelect={() => {}} note={null} />,
    );
    expect(none).not.toContain('Ver em detalhe');
    expect(noPhoto).not.toContain('Ver em detalhe');
  });
});
