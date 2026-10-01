import { useTranslations } from 'next-intl';
import { DownloadButton } from '@/components/products/DownloadButton';
import type { DownloadFile } from '@/lib/api/types';

/**
 * Files for download of a product, designer or launch (PPP-109). Each button asks the API for a temporary
 * link; hidden when there is nothing published.
 */
export function FileDownloads({
  files,
  title,
  headingId = 'downloads-title',
  className = 'block',
}: {
  files: DownloadFile[];
  title: string;
  headingId?: string;
  className?: string;
}) {
  const t = useTranslations('product.downloads');
  if (files.length === 0) {
    return null;
  }
  return (
    <section className={className} aria-labelledby={headingId}>
      <div className="block__title">
        <h2 id={headingId}>{title}</h2>
        <span className="meta">{t('secureLink')}</span>
      </div>
      <div className="downloads">
        {files.map((file) => (
          <DownloadButton key={file.id} file={file} />
        ))}
      </div>
    </section>
  );
}
