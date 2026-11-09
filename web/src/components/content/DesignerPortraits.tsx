import { Link } from '@/i18n/navigation';
import type { DesignerCard, DesignerRef } from '@/lib/api/types';
import { MorphImage } from '@/components/media/MorphImage';
import { morphName, morphTypes } from '@/lib/ui/morph';

/** Até três designers, retratos lado a lado; mais que isso, lista com retrato pequeno (sem buraco na grade). */
const GRID_MAX = 3;

/**
 * Largura máxima de cada retrato: um designer sozinho ocupava a coluna inteira, e a foto ficava mais alta que o texto
 * da coleção ao lado, deixando um vão em branco (retorno de 09/11/2026).
 */
const PORTRAIT_MAX = 168;

/**
 * Designers de uma coleção, ao lado do texto dela (rodada 3): retrato quadrado em preto e branco e o nome, cada um
 * levando à página do designer. O retrato vem da lista de designers (`DesignerCard`), casada pelo slug: a coleção só
 * traz a referência. Sem retrato, fica o quadro de fundo.
 */
export function DesignerPortraits({
  title,
  designers,
  portraits,
}: {
  title: string;
  designers: DesignerRef[];
  portraits: DesignerCard[];
}) {
  if (designers.length === 0) {
    return null;
  }
  const bySlug = new Map(portraits.map((designer) => [designer.slug, designer]));
  const asGrid = designers.length <= GRID_MAX;
  return (
    <aside className="designer-portraits" aria-labelledby="designer-portraits-title">
      <h2 id="designer-portraits-title" className="label">
        {title}
      </h2>
      <ul
        className={asGrid ? 'designer-portraits__grid' : 'designer-portraits__list'}
        style={
          asGrid
            ? { gridTemplateColumns: `repeat(${designers.length}, minmax(0, ${PORTRAIT_MAX}px))` }
            : undefined
        }
        data-reveal="stagger"
      >
        {designers.map((designer) => {
          const card = bySlug.get(designer.slug);
          return (
            <li key={designer.id}>
              <Link
                className="designer-portraits__item"
                href={{ pathname: '/designers/[slug]', params: { slug: designer.slug } }}
                transitionTypes={
                  card?.portrait ? morphTypes(morphName('designer', designer.slug)) : undefined
                }
                data-morph-link={card?.portrait ? morphName('designer', designer.slug) : undefined}
              >
                <div className="designer-portraits__photo hover-zoom">
                  {card?.portrait ? (
                    <MorphImage
                      name={morphName('designer', designer.slug)}
                      image={card.portrait}
                      sizes={asGrid ? `${PORTRAIT_MAX}px` : '96px'}
                    />
                  ) : null}
                </div>
                <span className="designer-portraits__name">{designer.name}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
