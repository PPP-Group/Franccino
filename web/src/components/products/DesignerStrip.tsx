import { useTranslations } from 'next-intl';
import { ApiImage } from '@/components/media/ApiImage';
import { Icon } from '@/components/ui/Icon';
import { Link } from '@/i18n/navigation';
import type { DesignerDetail } from '@/lib/api/types';

export function DesignerStrip({ designer }: { designer: DesignerDetail }) {
  const t = useTranslations('product.designer');
  return (
    <section className="section section--paper section--tight" aria-labelledby="designer-title">
      <div className="wrap">
        <div className={designer.portrait ? 'designer-strip' : 'designer-strip designer-strip--text'}>
          {designer.portrait ? <ApiImage image={designer.portrait} sizes="160px" /> : null}
          <div className="designer-strip__copy">
            <h2 id="designer-title">{designer.name}</h2>
            {designer.short_bio ? <p className="lead">{designer.short_bio}</p> : null}
            <div>
              <Link
                className="link-arrow"
                href={{ pathname: '/designers/[slug]', params: { slug: designer.slug } }}
              >
                <span>{t('piecesBy', { name: designer.name })}</span>
                <Icon name="arrow" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
