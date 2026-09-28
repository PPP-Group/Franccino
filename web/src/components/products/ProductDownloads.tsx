import { useTranslations } from 'next-intl';
import type { DownloadFile } from '@/lib/api/types';
import { DownloadButton } from './DownloadButton';

export function ProductDownloads({ files }: { files: DownloadFile[] }) {
  const t = useTranslations('product.downloads');
  if (files.length === 0) {
    return null;
  }
  return (
    <section className="block" aria-labelledby="downloads-title">
      <div className="block__title">
        <h2 id="downloads-title">{t('title')}</h2>
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
