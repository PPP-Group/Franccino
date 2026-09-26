import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { HeaderNav } from './HeaderNav';

export function SiteHeader() {
  const t = useTranslations('header');
  return (
    <header className="site-header">
      <div className="wrap site-header__bar">
        <Link className="wordmark" href="/" aria-label={t('homeLabel')}>
          {t('wordmark')}
        </Link>
        <HeaderNav />
      </div>
    </header>
  );
}
