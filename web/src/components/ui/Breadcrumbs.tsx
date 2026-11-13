import { Link, type AppHref } from '@/i18n/navigation';
import { morphTypes } from '@/lib/ui/morph';

export type BreadcrumbItem = { label: string; href?: AppHref };

/**
 * Caminho da página. `morph` (nome do movimento da foto, `lib/ui/morph.ts`): na página da peça, voltar pela categoria,
 * pela área ou pelo início faz a foto encolher até o card da peça na listagem (retorno de 07/11/2026), quando o card
 * está lá.
 */
export function Breadcrumbs({
  label,
  items,
  morph,
}: {
  label: string;
  items: BreadcrumbItem[];
  morph?: string;
}) {
  return (
    <nav className="crumbs" aria-label={label}>
      <ol className="crumbs__list">
        {items.map((item, index) => {
          const last = index === items.length - 1;
          return (
            <li key={`${index}-${item.label}`}>
              {item.href && !last ? (
                <Link
                  href={item.href}
                  transitionTypes={morph ? morphTypes(morph) : undefined}
                  data-morph-link={morph}
                >
                  {item.label}
                </Link>
              ) : (
                <span aria-current={last ? 'page' : undefined}>{item.label}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
