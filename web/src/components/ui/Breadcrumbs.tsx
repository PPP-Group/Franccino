import { Link, type AppHref } from '@/i18n/navigation';

export type BreadcrumbItem = { label: string; href?: AppHref };

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
