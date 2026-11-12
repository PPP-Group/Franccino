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

/** O nome da versão no botão: o título sem o começo "Bloco 3D (SketchUp) – ", que o nome do programa em cima já diz. */
export function versionLabel(title: string): string {
  const [, ...rest] = title.split(' – ');
  return rest.length > 0 ? rest.join(' – ') : title;
}

type ProgramKey = (typeof PROGRAMS)[number]['key'];

/** Os blocos por programa, na ordem de `PROGRAMS` e, dentro de cada um, na ordem do painel. */
export function blocksByProgram(files: DownloadFile[]): { program: ProgramKey; files: DownloadFile[] }[] {
  return PROGRAMS.map((program) => ({
    program: program.key,
    files: files.filter((file) => programOf(file) === program.key),
  })).filter((group) => group.files.length > 0);
}

/**
 * "Integre ao seu projeto" na página da peça (revisão da Franccino, 12/11/2026, item 19, exemplos 1 e 4): um botão por
 * programa (SketchUp, AutoCAD, Revit) com o bloco da peça, e o caminho para a Área do Profissional. Os blocos chegam
 * pelo painel (Arquivos da peça, tipos "Bloco 3D" e "Bloco 2D"); sem nenhum, fica só o caminho para a área. Programa
 * com mais de um bloco (as versões do Sofá Noa, os tampos da mesa) ganha o nome do programa em cima e um botão por
 * versão, com o título do arquivo.
 */
export function TechnicalLibrary({ files }: { files: DownloadFile[] }) {
  const t = useTranslations('product.library');
  const groups = blocksByProgram(files);
  const single = groups.filter((group) => group.files.length === 1);
  const several = groups.filter((group) => group.files.length > 1);
  return (
    <section className="tech-library block" aria-labelledby="library-title">
      <div className="block__title">
        <h2 id="library-title">{t('title')}</h2>
      </div>
      {groups.length > 0 ? (
        <>
          {single.length > 0 ? (
            <div className="tech-library__programs">
              {single.map(({ program, files: [file] }) => (
                <DownloadButton
                  key={file.id}
                  file={file}
                  variant="program"
                  label={t(`programs.${program}`)}
                />
              ))}
            </div>
          ) : null}
          {several.map(({ program, files: versions }) => (
            <div key={program} className="tech-library__group">
              <h3 className="tech-library__program">{t(`programs.${program}`)}</h3>
              <div className="tech-library__programs">
                {versions.map((file) => (
                  <DownloadButton
                    key={file.id}
                    file={file}
                    variant="program"
                    label={versionLabel(file.title)}
                  />
                ))}
              </div>
            </div>
          ))}
        </>
      ) : (
        <p className="meta">{t('soon')}</p>
      )}
      <Link className="link-arrow" href="/downloads">
        <span>{t('professionals')}</span>
      </Link>
    </section>
  );
}
