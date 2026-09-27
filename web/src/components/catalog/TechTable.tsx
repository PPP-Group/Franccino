import { useLocale, useTranslations } from 'next-intl';
import { ApiImage } from '@/components/media/ApiImage';
import { DownloadButton } from '@/components/products/DownloadButton';
import { QuickAddButton } from '@/components/products/QuickAddButton';
import { AreaDot } from '@/components/ui/AreaDot';
import type { Locale } from '@/i18n/config';
import { Link } from '@/i18n/navigation';
import type { TechnicalRow } from '@/lib/catalog/technical';
import { formatDimension } from '@/lib/format/dimensions';

/** Assinatura do DESIGN.md para arquitetos: densa, com rolagem horizontal própria. */
export function TechTable({ rows }: { rows: TechnicalRow[] }) {
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
  return (
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
          {rows.map(({ product, dimension, files }) => (
            <tr key={product.id}>
              <td>
                {product.cover ? <ApiImage image={product.cover} sizes="64px" className="thumb" /> : null}
              </td>
              <th scope="row">
                <Link href={{ pathname: '/products/[slug]', params: { slug: product.slug } }}>
                  <strong>{product.name}</strong>
                </Link>
                <div className="meta">{product.category.name}</div>
              </th>
              <td>
                <AreaDot area={product.area.key} />
                {product.area.brand_name}
              </td>
              <td>{product.designer?.name}</td>
              <td className="num nowrap">
                {dimension ? formatDimension(dimension, locale, dimensionLabels) : t('empty')}
              </td>
              <td>
                {files.length > 0 ? (
                  <div className="file-links">
                    {files.map((file) => (
                      <DownloadButton key={file.id} file={file} variant="link" />
                    ))}
                  </div>
                ) : (
                  t('empty')
                )}
              </td>
              <td>
                <QuickAddButton product={product} variant="table" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
