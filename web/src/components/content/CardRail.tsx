import type { CSSProperties } from 'react';
import { ApiImage } from '@/components/media/ApiImage';
import { Rail } from '@/components/ui/Rail';
import { Link, type AppHref } from '@/i18n/navigation';
import type { Image } from '@/lib/api/types';
import { fixedBoxCoverSizes, type CoverSlot } from '@/lib/images/cover-sizes';

export type RailCard = {
  id: number;
  href: AppHref;
  title: string;
  image: Image | null;
  /** Fatos curtos abaixo do nome (tipo, local), já traduzidos. */
  meta?: string[];
};

type Variant = 'wide' | 'portrait';

/**
 * Proporção e largura do card de cada variante. Precisam ser iguais a `.card-rail--*` em `styles/pages.css`:
 * `wide` (coleções, projetos) em 16:9 com clamp(300px, 34vw, 520px); `portrait` (designers) em 4:5 com
 * clamp(220px, 20vw, 300px).
 */
const VARIANTS: Record<Variant, { ratio: number; slots: CoverSlot[] }> = {
  wide: { ratio: 16 / 9, slots: [{ media: '(max-width: 56.25rem)', width: '300px' }, { width: '34vw' }] },
  portrait: { ratio: 4 / 5, slots: [{ media: '(max-width: 69rem)', width: '220px' }, { width: '20vw' }] },
};

/**
 * Faixa de continuidade no fim das páginas ("Outras coleções", "Outros projetos", "Outros designers"): fotos grandes
 * com o nome embaixo, que rolam de lado com as setas do `Rail`. Uma faixa nunca termina com buraco, qualquer que seja
 * o número de itens.
 */
export function CardRail({
  label,
  items,
  variant = 'wide',
}: {
  label: string;
  items: RailCard[];
  variant?: Variant;
}) {
  if (items.length === 0) {
    return null;
  }
  const { ratio, slots } = VARIANTS[variant];
  // Com um ou dois cards largos, a faixa ficaria curta, com meia linha vazia: eles dividem a linha inteira.
  const split = variant === 'wide' && items.length <= 2;
  const cardSlots = split
    ? [{ media: '(max-width: 35rem)', width: '100vw' }, { width: items.length === 1 ? '100vw' : '50vw' }]
    : slots;
  const list = (
    <ul
      className={split ? 'card-rail__split' : undefined}
      style={split ? ({ '--split-cols': items.length } as CSSProperties) : undefined}
    >
      {items.map((item) => (
        <li key={item.id}>
          <Link className="card-rail__card" href={item.href}>
            <div className="card-rail__media hover-zoom">
              {item.image ? (
                <ApiImage image={item.image} sizes={fixedBoxCoverSizes(item.image, ratio, cardSlots)} />
              ) : null}
            </div>
            <h3 className="card-rail__title">{item.title}</h3>
            {item.meta && item.meta.length > 0 ? (
              <ul className="meta meta-inline">
                {item.meta.map((fact) => (
                  <li key={fact}>{fact}</li>
                ))}
              </ul>
            ) : null}
          </Link>
        </li>
      ))}
    </ul>
  );
  if (split) {
    return <div className={`card-rail card-rail--${variant}`}>{list}</div>;
  }
  return (
    <Rail label={label} className={`card-rail card-rail--${variant}`}>
      {list}
    </Rail>
  );
}
