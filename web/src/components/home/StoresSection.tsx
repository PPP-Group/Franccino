import { useTranslations } from 'next-intl';
import { StoreFinder } from '@/components/stores/StoreFinder';
import { BrandIcon } from '@/components/ui/BrandIcon';
import { Icon } from '@/components/ui/Icon';
import { Link } from '@/i18n/navigation';
import type { Store } from '@/lib/api/types';
import { whatsappUrl } from '@/lib/contact-links';
import { sectionClass, type Tone } from './tone';

type StoresSectionProps = { stores: Store[]; states: string[]; whatsapp: string | null; tone: Tone };

export function StoresSection({ stores, states, whatsapp, tone }: StoresSectionProps) {
  const t = useTranslations('home.stores');
  const common = useTranslations('common');
  const consultant = whatsappUrl(whatsapp);
  return (
    <section className={sectionClass(tone)} aria-labelledby="stores-title">
      <div className="wrap" data-reveal="">
        <StoreFinder stores={stores} states={states}>
          <h2 id="stores-title">{t('title')}</h2>
          <p className="lead">{t('lead')}</p>
          {consultant ? (
            <a className="btn btn--ghost" href={consultant} target="_blank" rel="noopener noreferrer">
              <BrandIcon name="whatsapp" />
              <span>{t('consultant')}</span>
              <span className="visually-hidden">{common('opensInNewWindow')}</span>
            </a>
          ) : null}
          <Link className="link-arrow" href="/stores">
            <span>{t('all')}</span>
            <Icon name="arrow" />
          </Link>
        </StoreFinder>
      </div>
    </section>
  );
}
