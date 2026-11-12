import { useTranslations } from 'next-intl';
import { MorphImage } from '@/components/media/MorphImage';
import { Icon } from '@/components/ui/Icon';
import { Link } from '@/i18n/navigation';
import { morphName, morphTypes } from '@/lib/ui/morph';
import type { ProjectCard } from '@/lib/api/types';
import { aspectRatio, coverSizes } from '@/lib/images/cover';
import { sectionClass, type Tone } from './tone';

/** Altura do mosaico no computador, igual a `--mosaic-h` em `styles/home.css` (o `sizes` é calculado com ela). */
const MOSAIC_HEIGHT = 'clamp(560px, 82vh, 860px)';

/** Quantos projetos o mosaico mostra: grupos de três (uma foto grande e duas menores); com menos, os que houver. */
export function mosaicCount(available: number): number {
  if (available >= 6) return 6;
  if (available >= 3) return 3;
  return available;
}

function tileSizes(project: ProjectCard, large: boolean, count: number): string {
  const ratio = aspectRatio(project.cover);
  if (count < 3) {
    const width = count === 1 ? '94vw' : '47vw';
    return `(max-width: 56.25rem) 94vw, ${coverSizes(ratio, { width, height: MOSAIC_HEIGHT })}`;
  }
  const desktop = large
    ? coverSizes(ratio, { width: '55vw', height: MOSAIC_HEIGHT })
    : coverSizes(ratio, { width: '39vw', height: `calc(${MOSAIC_HEIGHT} / 2)` });
  return `(max-width: 56.25rem) 94vw, ${desktop}`;
}

/**
 * Projetos em mosaico (rodada 3, retorno de 06/11/2026: imagens grandes de ambientes, como o site antigo). Uma foto
 * grande e duas menores; no segundo grupo, a grande troca de lado. Título do projeto sobre a foto, com o cliente e o
 * local embaixo; o hover aproxima a foto. Só projetos com capa (nada inventado); sem nenhum, a seção some (page.tsx).
 */
export function ProjectsSection({ projects, tone }: { projects: ProjectCard[]; tone: Tone }) {
  const t = useTranslations('home.projects');
  const withCover = projects.filter((project) => project.cover);
  const shown = withCover.slice(0, mosaicCount(withCover.length));
  const groups =
    shown.length >= 3 ? [shown.slice(0, 3), shown.slice(3, 6)].filter((g) => g.length === 3) : [shown];
  return (
    <section className={sectionClass(tone)} aria-labelledby="projects-title">
      <div className="wrap">
        <div className="section-head" data-reveal="">
          <div>
            <h2 id="projects-title">{t('title')}</h2>
            <p className="lead">{t('lead')}</p>
          </div>
          <Link className="link-arrow" href="/projects">
            <span>{t('all')}</span>
            <Icon name="arrow" />
          </Link>
        </div>
        <div className="mosaics">
          {groups.map((group, groupIndex) => (
            <ul
              key={groupIndex}
              className={['mosaic', `mosaic--${group.length}`, groupIndex % 2 === 1 ? 'mosaic--flip' : '']
                .filter(Boolean)
                .join(' ')}
              data-reveal="stagger"
            >
              {group.map((project, index) => {
                const meta = [project.client_name, project.location].filter(Boolean).join(' · ');
                return (
                  <li key={project.id} className="mosaic__item">
                    <Link
                      className="mosaic__link hover-zoom"
                      href={{ pathname: '/projects/[slug]', params: { slug: project.slug } }}
                      transitionTypes={
                        project.cover ? morphTypes(morphName('project', project.slug)) : undefined
                      }
                      data-morph-link={project.cover ? morphName('project', project.slug) : undefined}
                    >
                      {project.cover ? (
                        <MorphImage
                          name={morphName('project', project.slug)}
                          image={project.cover}
                          sizes={tileSizes(project, index === 0, group.length)}
                        />
                      ) : null}
                      <div className="mosaic__copy" data-reveal="">
                        <h3 className="mosaic__title">{project.title}</h3>
                        {meta ? <p className="mosaic__meta">{meta}</p> : null}
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          ))}
        </div>
      </div>
    </section>
  );
}
