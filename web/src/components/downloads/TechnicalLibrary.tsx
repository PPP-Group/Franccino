import { useTranslations } from 'next-intl';
import { DownloadButton } from '@/components/products/DownloadButton';
import { Link } from '@/i18n/navigation';
import type { DownloadFile } from '@/lib/api/types';

/** Blocos que viram botões com o nome do programa (revisão da Franccino, 12/11/2026, item 19). */
export const PROGRAMS = [
  { key: 'sketchup', type: 'block_3d', formats: ['SKP'] },
  { key: 'autocad', type: 'block_2d', formats: ['DWG', 'DXF'] },
  { key: 'revit', type: 'block_3d', formats: ['RFA'] },
] as const;

/** Arquivo de bloco de um dos programas acima (os outros arquivos seguem na lista de downloads). */
export function programOf(file: DownloadFile): (typeof PROGRAMS)[number]['key'] | null {
  const format = file.format.toUpperCase();
  return (
    PROGRAMS.find(
      (program) => program.type === file.type && (program.formats as readonly string[]).includes(format),
    )?.key ?? null
  );
}

/**
 * "Integre ao seu projeto" na página da peça (revisão da Franccino, 12/11/2026, item 19, exemplos 1 e 4): um botão por
 * programa (SketchUp, AutoCAD, Revit) com o bloco da peça, e o caminho para a Área do Profissional. Os blocos chegam
 * pelo painel (Arquivos da peça, tipos "Bloco 3D" e "Bloco 2D"); sem nenhum, fica só o caminho para a área.
 */
export function TechnicalLibrary({ files }: { files: DownloadFile[] }) {
  const t = useTranslations('product.library');
  const blocks = files.filter((file) => programOf(file) !== null);
  return (
    <section className="tech-library block" aria-labelledby="library-title">
      <div className="block__title">
        <h2 id="library-title">{t('title')}</h2>
      </div>
      {blocks.length > 0 ? (
        <div className="tech-library__programs">
          {blocks.map((file) => (
            <DownloadButton
              key={file.id}
              file={file}
              variant="program"
              label={t(`programs.${programOf(file)}`)}
            />
          ))}
        </div>
      ) : (
        <p className="meta">{t('soon')}</p>
      )}
      <Link className="link-arrow" href="/downloads">
        <span>{t('professionals')}</span>
      </Link>
    </section>
  );
}
