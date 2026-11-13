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
  /** Título centralizado, sem metadado ao lado (Coleções, como no site antigo). */
  centered?: boolean;
  /** Texto que continua embaixo da frase de abertura, na mesma coluna (descrição da coleção). */
  children?: ReactNode;
  /**
   * Coluna da direita, alinhada pelo alto ao título (retorno do tech lead de 06/11/2026: nada de metade vazia): os
   * designers da coleção, a peça em destaque. Com ela, o metadado não aparece.
   */
  aside?: ReactNode;
};

export function PageHead({
  title,
  lead = null,
  trail = [],
  meta = null,
  centered = false,
  children = null,
  aside = null,
}: PageHeadProps) {
  const common = useTranslations('common');
  const className = aside
    ? 'catalog-head catalog-head--split'
    : centered
      ? 'catalog-head catalog-head--center'
      : 'catalog-head';
  return (
    <>
      <Breadcrumbs
        label={common('breadcrumb')}
        items={[{ label: common('home'), href: '/' }, ...trail, { label: title }]}
      />
      <div className={className}>
        <div className="catalog-head__copy">
          <h1>{title}</h1>
          {lead ? <p className="lead">{lead}</p> : null}
          {children}
        </div>
        {aside ?? meta}
      </div>
    </>
  );
}
