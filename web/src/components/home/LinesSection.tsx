import { useTranslations } from 'next-intl';
import { MorphImage } from '@/components/media/MorphImage';
import { Icon } from '@/components/ui/Icon';
import { Link } from '@/i18n/navigation';
import type { Area, Image } from '@/lib/api/types';
import { areaPath } from '@/lib/catalog/area';
import { aspectRatio, coverSizes } from '@/lib/images/cover';
import { morphName, morphTypes } from '@/lib/ui/morph';

/** Altura dos painéis, igual a `--line-h` em `styles/home.css` (no celular, `svh` vira `vh` no `sizes`). */
const LINE_HEIGHT = 'clamp(520px, 86vh, 920px)';
const LINE_HEIGHT_MOBILE = 'clamp(420px, 62vh, 640px)';

/** A capa é recortada (`cover`) num painel alto: o `sizes` conta a largura em que ela é realmente desenhada. */
function panelSizes(cover: Image): string {
  const ratio = aspectRatio(cover);
  const mobile = coverSizes(ratio, { width: '100vw', height: LINE_HEIGHT_MOBILE });
  const desktop = coverSizes(ratio, { width: '50vw', height: LINE_HEIGHT });
  return `(max-width: 51.25rem) ${mobile}, ${desktop}`;
}

/**
 * Casa e Giardini lado a lado, em tela cheia. Hover: a foto aproxima devagar dentro do painel (`.hover-zoom`).
 * `area.description` é texto simples no contrato, então vai como parágrafo e não por `RichText` (R6).
 */
export function LinesSection({ areas }: { areas: Area[] }) {
  const t = useTranslations('home.lines');
  return (
    <section className="lines" aria-label={t('label')} data-reveal="curtain-stagger">
      {areas.map((area) => (
        <Link
          key={area.key}
          className="line-panel hover-zoom"
          href={areaPath(area.key)}
          data-parallax=""
          transitionTypes={area.cover ? morphTypes(morphName('area', area.key)) : undefined}
          data-morph-link={area.cover ? morphName('area', area.key) : undefined}
        >
          {area.cover ? (
            <MorphImage
              name={morphName('area', area.key)}
              image={area.cover}
              sizes={panelSizes(area.cover)}
              parallax
            />
          ) : null}
          <div className="line-panel__copy" data-parallax-layer="front" data-reveal="">
            <h2 className="line-panel__title">{area.brand_name}</h2>
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
