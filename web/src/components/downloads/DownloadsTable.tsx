import { useTranslations } from 'next-intl';
import { ApiImage } from '@/components/media/ApiImage';
import { DownloadButton } from '@/components/products/DownloadButton';
import { AreaDot } from '@/components/ui/AreaDot';
import { Link } from '@/i18n/navigation';
import type { DownloadFile, ProductCard } from '@/lib/api/types';

export type DownloadRow = ProductCard & { files: DownloadFile[] };

export function DownloadsTable({ rows }: { rows: DownloadRow[] }) {
  const t = useTranslations('downloads.table');
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
            <th scope="col">{t('files')}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td>{row.cover ? <ApiImage image={row.cover} sizes="64px" className="thumb" /> : null}</td>
              <th scope="row">
                <Link href={{ pathname: '/products/[slug]', params: { slug: row.slug } }}>
                  <strong>{row.name}</strong>
                </Link>
                <div className="meta">{row.category.name}</div>
              </th>
              <td>
                <AreaDot area={row.area.key} />
                {row.area.brand_name}
              </td>
              <td>
                <div className="file-links">
                  {row.files.map((file) => (
                    <DownloadButton key={file.id} file={file} variant="link" />
                  ))}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
