import { useLocale, useTranslations } from 'next-intl';
import { MorphImage } from '@/components/media/MorphImage';
import { DownloadButton } from '@/components/products/DownloadButton';
import { productMorphName } from '@/components/products/ProductPlate';
import { QuickAddButton } from '@/components/products/QuickAddButton';
import { AreaDot } from '@/components/ui/AreaDot';
import type { Locale } from '@/i18n/config';
import { Link } from '@/i18n/navigation';
import { withDimensionsFirst, type TechnicalRow } from '@/lib/catalog/technical';
import { morphTypes } from '@/lib/ui/morph';
import { formatDimension } from '@/lib/format/dimensions';
import { RowLinks } from './RowLinks';
import { RowPeek } from './RowPeek';
import type { DownloadFile } from '@/lib/api/types';

/** Arquivos agrupados por formato, na ordem em que o primeiro de cada formato aparece. */
function filesByFormat(files: DownloadFile[]): [string, DownloadFile[]][] {
  const groups = new Map<string, DownloadFile[]>();
  for (const file of files) {
    groups.set(file.format, [...(groups.get(file.format) ?? []), file]);
  }
  return [...groups.entries()];
}

/**
 * Assinatura do DESIGN.md para arquitetos: densa, com rolagem horizontal própria. No desktop, passar o mouse numa linha
 * mostra as fotos da peça ao lado do ponteiro (`RowPeek`), para comparar sem abrir cada página. Clicar em qualquer
 * lugar da linha abre a peça (`RowLinks`); categoria, linha e designer são links próprios.
 */
export function TechTable({ rows: unsorted }: { rows: TechnicalRow[] }) {
  const rows = withDimensionsFirst(unsorted);
  const t = useTranslations('catalog.table');
  const tDimensions = useTranslations('dimensions');
  const locale = useLocale() as Locale;
  const dimensionLabels = {
    width: tDimensions('width'),
    depth: tDimensions('depth'),
    height: tDimensions('height'),
    seatHeight: tDimensions('seatHeight'),
    diameter: tDimensions('diameter'),
  };
  const peeks = rows
    .filter((row) => row.preview && row.preview.length > 0)
    .map((row) => ({ id: row.product.id, images: row.preview ?? [] }));
  const withPeek = new Set(peeks.map((item) => item.id));
  return (
    <div className="tech-table-wrap">
      <div className="table-scroll" role="region" aria-label={t('label')} tabIndex={0}>
        <table className="tech-table">
          <caption className="visually-hidden">{t('caption')}</caption>
          <thead>
            <tr>
              <th scope="col">
                <span className="visually-hidden">{t('image')}</span>
              </th>
              <th scope="col">{t('piece')}</th>
              <th scope="col">{t('area')}</th>
              <th scope="col">{t('designer')}</th>
              <th scope="col">{t('dimensions')}</th>
              <th scope="col">{t('files')}</th>
              <th scope="col">
                <span className="visually-hidden">{t('list')}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ product, dimension, files }) => {
              const productHref = {
                pathname: '/products/[slug]' as const,
                params: { slug: product.slug },
              };
              const areaPath = product.area.key === 'outdoor' ? '/outdoor' : '/indoor';
              return (
                <tr
                  key={product.id}
                  className="is-linked"
                  data-row-id={withPeek.has(product.id) ? product.id : undefined}
                >
                  <td>
                    {product.cover ? (
                      <Link
                        href={productHref}
                        tabIndex={-1}
                        aria-hidden="true"
                        transitionTypes={morphTypes(productMorphName(product.slug))}
                        data-morph-link={productMorphName(product.slug)}
                      >
                        <MorphImage
                          name={productMorphName(product.slug)}
                          image={product.cover}
                          sizes="64px"
                          fit="contain"
                          className="thumb"
                        />
                      </Link>
                    ) : null}
                  </td>
                  <th scope="row">
                    <Link
                      href={productHref}
                      data-row-link=""
                      transitionTypes={product.cover ? morphTypes(productMorphName(product.slug)) : undefined}
                      data-morph-link={product.cover ? productMorphName(product.slug) : undefined}
                    >
                      <strong>{product.name}</strong>
                    </Link>
                    <div className="meta">
                      <Link
                        className="tech-table__sublink"
                        href={
                          product.area.key === 'outdoor'
                            ? { pathname: '/outdoor/[category]', params: { category: product.category.slug } }
                            : { pathname: '/indoor/[category]', params: { category: product.category.slug } }
                        }
                      >
                        {product.category.name}
                      </Link>
                    </div>
                  </th>
                  <td>
                    <Link className="tech-table__sublink" href={areaPath}>
                      <AreaDot area={product.area.key} />
                      {product.area.brand_name}
                    </Link>
                  </td>
                  <td>
                    {product.designer ? (
                      <Link
                        className="tech-table__sublink"
                        href={{ pathname: '/designers/[slug]', params: { slug: product.designer.slug } }}
                      >
                        {product.designer.name}
                      </Link>
                    ) : null}
                  </td>
                  <td className="num nowrap">
                    {dimension ? formatDimension(dimension, locale, dimensionLabels) : t('empty')}
                  </td>
                  <td>
                    {files.length > 0 ? (
                      <div className="file-links">
                        {/*
                          Um link por formato (revisão de 13/11/2026: o Sofá Noa mostrava "SKP" 15 vezes). Com várias
                          versões no mesmo formato, o link leva à seção "Integre ao seu projeto" da peça, que dá o nome
                          de cada versão.
                        */}
                        {filesByFormat(files).map(([format, group]) =>
                          group.length === 1 ? (
                            <DownloadButton key={group[0].id} file={group[0]} variant="link" />
                          ) : (
                            <Link
                              key={format}
                              className="file-links__many"
                              href={{
                                pathname: '/products/[slug]',
                                params: { slug: product.slug },
                                hash: 'library-title',
                              }}
                            >
                              {t('filesMany', { format, count: group.length })}
                            </Link>
                          ),
                        )}
                      </div>
                    ) : (
                      t('empty')
                    )}
                  </td>
                  <td>
                    <QuickAddButton product={product} variant="table" />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <RowLinks />
      {peeks.length > 0 ? <RowPeek items={peeks} /> : null}
    </div>
  );
}
