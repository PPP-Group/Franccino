import { useLocale, useTranslations } from 'next-intl';
import { PlanSvg } from '@/components/planner/PlanSvg';
import { Icon } from '@/components/ui/Icon';
import { htmlLang, type Locale } from '@/i18n/config';
import { Link } from '@/i18n/navigation';
import { DEFAULT_ROOM } from '@/lib/planner/types';

/** Planta vazia de exemplo (conflito C17): mostra a ferramenta sem inventar composição. */
export function PlannerTeaser() {
  const t = useTranslations('home.teaser');
  const planner = useTranslations('planner');
  const locale = useLocale() as Locale;
  const meters = new Intl.NumberFormat(htmlLang(locale), { minimumFractionDigits: 2 });
  const width = meters.format(DEFAULT_ROOM.w / 100);
  const depth = meters.format(DEFAULT_ROOM.d / 100);
  return (
    <section className="section section--paper" aria-labelledby="teaser-title">
      <div className="wrap teaser">
        <div className="teaser__copy">
          <h2 id="teaser-title" className="display display--section">
            {t('title')}
          </h2>
          <p className="lead">{t('body')}</p>
          <div>
            <Link className="btn" href="/room-planner">
              <Icon name="ruler" />
              <span>{t('cta')}</span>
            </Link>
          </div>
        </div>
        <div className="teaser__plan">
          <PlanSvg
            room={DEFAULT_ROOM}
            pieces={[]}
            label={planner('planLabel', { width, depth })}
            widthLabel={planner('meters', { value: width })}
            depthLabel={planner('meters', { value: depth })}
          />
        </div>
      </div>
    </section>
  );
}
