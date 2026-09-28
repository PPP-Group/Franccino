import { useTranslations } from 'next-intl';
import { StoreFinder } from '@/components/stores/StoreFinder';
import { Icon } from '@/components/ui/Icon';
import type { Store } from '@/lib/api/types';
import { whatsappUrl } from '@/lib/contact-links';

type StoresSectionProps = { stores: Store[]; states: string[]; whatsapp: string | null };

export function StoresSection({ stores, states, whatsapp }: StoresSectionProps) {
  const t = useTranslations('home.stores');
  const common = useTranslations('common');
  const consultant = whatsappUrl(whatsapp);
  return (
    <section className="section section--paper" aria-labelledby="stores-title">
      <div className="wrap">
        <StoreFinder stores={stores} states={states}>
          <h2 id="stores-title">{t('title')}</h2>
          <p className="lead">{t('lead')}</p>
          {consultant ? (
            <a className="btn btn--ghost" href={consultant} target="_blank" rel="noopener noreferrer">
              <Icon name="chat" />
              <span>{t('consultant')}</span>
              <span className="visually-hidden">{common('opensInNewWindow')}</span>
            </a>
          ) : null}
        </StoreFinder>
      </div>
    </section>
  );
}
