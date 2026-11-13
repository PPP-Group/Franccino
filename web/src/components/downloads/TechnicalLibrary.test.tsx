import { describe, expect, it } from 'vitest';
import type { DownloadFile } from '@/lib/api/types';
import { renderWithIntl } from '@/test/intl';
import { blocksByProgram, TechnicalLibrary, versionLabel } from './TechnicalLibrary';

const file = (id: number, type: DownloadFile['type'], format: string, title: string): DownloadFile => ({
  id,
  type,
  format,
  title,
  size: 1024,
});

describe('TechnicalLibrary', () => {
  it('groups the blocks by program, in the program order', () => {
    const groups = blocksByProgram([
      file(1, 'block_2d', 'DWG', 'Bloco 2D'),
      file(2, 'block_3d', 'SKP', 'Bloco 3D – canto'),
      file(3, 'technical_sheet', 'PDF', 'Ficha técnica'),
      file(4, 'block_3d', 'SKP', 'Bloco 3D – chaise'),
    ]);
    expect(groups.map((group) => [group.program, group.files.map((item) => item.id)])).toEqual([
      ['sketchup', [2, 4]],
      ['autocad', [1]],
    ]);
  });

  it('names each version when a program has more than one block', () => {
    const html = renderWithIntl(
      <TechnicalLibrary
        productName="Sofá Noa"
        files={[
          file(1, 'block_2d', 'DWG', 'Bloco 2D'),
          file(2, 'block_3d', 'SKP', 'Bloco 3D – canto'),
          file(4, 'block_3d', 'SKP', 'Bloco 3D – chaise'),
        ]}
      />,
    );
    expect(html).toContain('>AutoCAD<');
    expect(html).toContain('tech-library__program');
    expect(html).toContain('>canto<');
    expect(html).toContain('>chaise<');
  });

  it('keeps only the version in the button label', () => {
    expect(versionLabel('Bloco 3D (SketchUp) – canto com chaise')).toBe('canto com chaise');
    expect(versionLabel('Bloco 2D (AutoCAD)')).toBe('Bloco 2D (AutoCAD)');
  });
});
