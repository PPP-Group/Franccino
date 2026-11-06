import { useTranslations } from 'next-intl';
import { MorphImage } from '@/components/media/MorphImage';
import { Link } from '@/i18n/navigation';
import type { ProjectCard } from '@/lib/api/types';
import { morphName, morphTypes } from '@/lib/ui/morph';

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
  const morphLink = project.cover ? { transitionTypes: morphTypes(morph), 'data-morph-link': morph } : {};
  return (
    <article className="project-row">
      <Link
        className="project-row__media hover-zoom"
        href={href}
        {...morphLink}
        tabIndex={-1}
        aria-hidden="true"
        data-reveal={priority ? undefined : 'curtain'}
      >
        {project.cover ? (
          <MorphImage
            name={morph}
            image={project.cover}
            sizes="(max-width: 56.25rem) 100vw, 50vw"
            priority={priority}
          />
        ) : null}
      </Link>
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
