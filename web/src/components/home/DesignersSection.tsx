import { useTranslations } from 'next-intl';
import { ApiImage } from '@/components/media/ApiImage';
import { Icon } from '@/components/ui/Icon';
import { Link } from '@/i18n/navigation';
import type { DesignerCard } from '@/lib/api/types';

const SHOWN = 4;

export function DesignersSection({ designers }: { designers: DesignerCard[] }) {
  const t = useTranslations('home.designers');
  return (
    <section className="section" aria-labelledby="designers-title">
      <div className="wrap">
        <div className="section-head">
          <div>
            <h2 id="designers-title">{t('title')}</h2>
            <p className="lead">{t('lead')}</p>
          </div>
          <Link className="link-arrow" href="/designers">
            <span>{t('all')}</span>
            <Icon name="arrow" />
          </Link>
        </div>
        <div className="designers">
          {designers.slice(0, SHOWN).map((designer) => (
            <Link
              key={designer.id}
              className="designer"
              href={{ pathname: '/designers/[slug]', params: { slug: designer.slug } }}
            >
              <div className="designer__photo">
                {designer.portrait ? (
                  <ApiImage image={designer.portrait} sizes="(max-width: 56.25rem) 50vw, 25vw" />
                ) : null}
              </div>
              <h3>{designer.name}</h3>
              {designer.short_bio ? <p className="meta">{designer.short_bio}</p> : null}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
