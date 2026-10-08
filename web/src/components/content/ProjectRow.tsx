import { useTranslations } from 'next-intl';
import { ApiImage } from '@/components/media/ApiImage';
import { Link } from '@/i18n/navigation';
import type { ProjectCard } from '@/lib/api/types';

type ProjectRowProps = {
  project: ProjectCard;
  /** Fatos curtos do projeto (tipo, local, ano), já traduzidos. */
  meta?: string[];
  priority?: boolean;
};

/**
 * Projeto em faixa, como no site antigo (ajustes do cliente, 06/10/2026): foto de um lado e texto do outro,
 * com "Saiba mais". A troca de lado a cada projeto fica no CSS (`.project-rows`).
 */
export function ProjectRow({ project, meta = [], priority = false }: ProjectRowProps) {
  const common = useTranslations('common');
  const href = { pathname: '/projects/[slug]', params: { slug: project.slug } } as const;
  return (
    <article className="project-row">
      <Link className="project-row__media" href={href} tabIndex={-1} aria-hidden="true">
        <ApiImage image={project.cover} sizes="(max-width: 56.25rem) 100vw, 50vw" priority={priority} />
      </Link>
      <div className="project-row__copy">
        <h2 className="project-row__title">
          <Link href={href}>{project.title}</Link>
        </h2>
        {meta.length > 0 ? (
          <ul className="meta meta-inline">
            {meta.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        ) : null}
        {project.summary ? <p className="project-row__text">{project.summary}</p> : null}
        <Link className="pill-link" href={href} aria-label={`${common('learnMore')}: ${project.title}`}>
          {common('learnMore')}
        </Link>
      </div>
    </article>
  );
}
