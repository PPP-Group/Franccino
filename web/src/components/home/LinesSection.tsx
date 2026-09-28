import { useTranslations } from 'next-intl';
import { ApiImage } from '@/components/media/ApiImage';
import { Icon } from '@/components/ui/Icon';
import { Link } from '@/i18n/navigation';
import type { Area } from '@/lib/api/types';
import { areaPath } from '@/lib/catalog/area';

/** `area.description` é texto simples no contrato, então vai como parágrafo e não por `RichText` (R6). */
export function LinesSection({ areas }: { areas: Area[] }) {
  const t = useTranslations('home.lines');
  return (
    <section className="lines" aria-label={t('label')}>
      {areas.map((area) => (
        <Link key={area.key} className="line-panel" href={areaPath(area.key)}>
          {area.cover ? <ApiImage image={area.cover} sizes="(max-width: 51.25rem) 100vw, 50vw" /> : null}
          <div className="line-panel__copy">
            <h2 className="display">{area.brand_name}</h2>
            {area.description ? <p className="lead">{area.description}</p> : null}
            <span className="link-arrow">
              <span>{t('viewPieces')}</span>
              <Icon name="arrow" />
            </span>
          </div>
        </Link>
      ))}
    </section>
  );
}
