import { useTranslations } from 'next-intl';
import { ScenePoints } from '@/components/home/SceneViewer';
import { MorphImage } from '@/components/media/MorphImage';
import { Link } from '@/i18n/navigation';
import type { ProjectCard } from '@/lib/api/types';
import { morphName, morphTypes } from '@/lib/ui/morph';

/** Proporção da foto na faixa (`.project-row__media`, 3:2 em pages.css): os pontos acompanham o recorte. */
const PROJECT_ROW_RATIO = 3 / 2;

type ProjectRowProps = {
  project: ProjectCard;
  /** Fatos curtos do projeto (tipo, local, ano), já traduzidos. */
  meta?: string[];
  priority?: boolean;
};

/**
 * Projeto em faixa, como no site antigo (ajustes do cliente, 06/10/2026): foto de um lado e texto do outro,
 * com "Saiba mais" quadrado. A troca de lado a cada projeto fica no CSS (`.project-rows`). Rodada 3: o hover é o zoom
 * da foto (`.hover-zoom`), sem sublinhado no título. Ao entrar na tela, a foto abre como cortina e o texto sobe (ideia
 * 04); a primeira faixa (`priority`) já abre à vista.
 */
export function ProjectRow({ project, meta = [], priority = false }: ProjectRowProps) {
  const common = useTranslations('common');
  const href = { pathname: '/projects/[slug]', params: { slug: project.slug } } as const;
  // A foto cresce até a capa da página do projeto (ideia 10), por qualquer um dos três links.
  const morph = morphName('project', project.slug);
  // Com um ambiente ligado ao projeto, a faixa mostra a foto dele, com os pontos por cima.
  const scene = project.scene && project.scene.hotspots.length > 0 ? project.scene : null;
  const image = scene ? scene.image : project.cover;
  const morphLink = image ? { transitionTypes: morphTypes(morph), 'data-morph-link': morph } : {};
  return (
    <article className="project-row">
      <div className="project-row__figure" data-reveal={priority ? undefined : ''}>
        <Link
          className="project-row__media hover-zoom"
          href={href}
          {...morphLink}
          tabIndex={-1}
          aria-hidden="true"
        >
          {image ? (
            <MorphImage
              name={morph}
              image={image}
              sizes="(max-width: 56.25rem) 100vw, 50vw"
              priority={priority}
            />
          ) : null}
        </Link>
        {/* Foto com pontos (Ambiente ligado ao projeto no painel): cada ponto abre a peça; o resto da foto, o projeto. */}
        {scene ? <ScenePoints scene={scene} frameRatio={PROJECT_ROW_RATIO} /> : null}
      </div>
      <div className="project-row__copy" data-reveal="">
        <h2 className="project-row__title">
          <Link href={href} {...morphLink}>
            {project.title}
          </Link>
        </h2>
        {meta.length > 0 ? (
          <ul className="meta meta-inline">
            {meta.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        ) : null}
        {project.summary ? <p className="project-row__text">{project.summary}</p> : null}
        <Link
          className="btn btn--ghost project-row__more"
          href={href}
          {...morphLink}
          aria-label={`${common('learnMore')}: ${project.title}`}
        >
          {common('learnMore')}
        </Link>
      </div>
    </article>
  );
}
