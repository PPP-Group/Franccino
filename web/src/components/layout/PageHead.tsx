import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';
import { Breadcrumbs, type BreadcrumbItem } from '@/components/ui/Breadcrumbs';

type PageHeadProps = {
  title: string;
  lead?: string | null;
  /** Níveis entre o início e a página atual (a página atual entra sozinha, sem link). */
  trail?: BreadcrumbItem[];
  /** Metadado à direita do título (ex.: contagem em `.meta.num`). */
  meta?: ReactNode;
};

export function PageHead({ title, lead = null, trail = [], meta = null }: PageHeadProps) {
  const common = useTranslations('common');
  return (
    <>
      <Breadcrumbs
        label={common('breadcrumb')}
        items={[{ label: common('home'), href: '/' }, ...trail, { label: title }]}
      />
      <div className="catalog-head">
        <div className="catalog-head__copy">
          <h1>{title}</h1>
          {lead ? <p className="lead">{lead}</p> : null}
        </div>
        {meta}
      </div>
    </>
  );
}
