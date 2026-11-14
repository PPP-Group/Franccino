import { Link, type AppHref } from '@/i18n/navigation';

export type BreadcrumbItem = { label: string; href?: AppHref };

/**
 * Caminho da página. Na página da peça, a categoria e a área levam a foto até o primeiro lugar da lista (`LeadSource`,
 * controle da navegação), e o caminho até a página de onde a peça foi aberta vira um "voltar".
 */
export function Breadcrumbs({ label, items }: { label: string; items: BreadcrumbItem[] }) {
  return (
    <nav className="crumbs" aria-label={label}>
      <ol className="crumbs__list">
        {items.map((item, index) => {
          const last = index === items.length - 1;
          return (
            <li key={`${index}-${item.label}`}>
              {item.href && !last ? (
                <Link href={item.href}>{item.label}</Link>
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
