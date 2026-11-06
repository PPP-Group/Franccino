import type { CSSProperties } from 'react';
import { PageHead } from '@/components/layout/PageHead';
import { ApiImage } from '@/components/media/ApiImage';
import type { BreadcrumbItem } from '@/components/ui/Breadcrumbs';
import type { Image } from '@/lib/api/types';
import { aspectRatio, isWideArt } from '@/lib/images/cover';
import { pageBannerSizes } from '@/lib/images/cover-sizes';

type PageBannerProps = {
  image: Image | null;
  title: string;
  lead?: string | null;
  /** Níveis do caminho (breadcrumb) quando o título vai no cabeçalho de texto (sem foto ou com arte larga). */
  trail?: BreadcrumbItem[];
};

/**
 * Arte larga no topo da página (faixa do WordPress, capa da coleção): segue a proporção da imagem, sem recorte nem
 * ampliação (limitada a 72% da tela). Como o banner com foto, fica parada enquanto a página sobe por cima dela
 * (`.page-banner-art` em `styles/pages.css`); a proporção vai em `--art-ratio` para a caixa ter a altura certa antes da
 * imagem chegar.
 */
export function PageCoverArt({ image }: { image: Image }) {
  const ratio = aspectRatio(image);
  const style = ratio
    ? ({ '--art-ratio': String(Math.round(ratio * 1000) / 1000) } as CSSProperties)
    : undefined;
  return (
    <div className={ratio ? 'page-banner-art page-banner-art--fixed' : 'page-banner-art'} style={style}>
      <ApiImage image={image} sizes="100vw" priority />
    </div>
  );
}

/**
 * Banner com foto no topo da página, no estilo da "versão do Marcelo" (ajustes do cliente, 06/10/2026):
 * a foto ocupa a largura toda e o título fica sobre ela. A foto é a capa da página no painel
 * (Páginas > capa). Sem foto, a página abre com o cabeçalho de texto de sempre.
 *
 * Arte larga (faixa do WordPress, ~1920×500, quase sempre com texto na própria arte): o banner segue a proporção
 * da imagem, sem recorte nem ampliação, e o título vai no cabeçalho de texto logo abaixo (revisão de 06/11/2026).
 *
 * Rodada 3: a foto fica parada no topo e a página sobe por cima dela, como no banner da home (só sem movimento
 * reduzido).
 */
export function PageBanner({ image, title, lead = null, trail = [] }: PageBannerProps) {
  if (!image) {
    return (
      <div className="wrap">
        <PageHead title={title} lead={lead} trail={trail} />
      </div>
    );
  }
  if (isWideArt(image)) {
    return (
      <>
        <PageCoverArt image={image} />
        <div className="wrap">
          <PageHead title={title} lead={lead} trail={trail} />
        </div>
      </>
    );
  }
  return (
    <header className="page-banner">
      <ApiImage image={image} sizes={pageBannerSizes(image)} priority className="page-banner__img" />
      <div className="wrap page-banner__copy">
        <h1 className="page-banner__title">{title}</h1>
        {lead ? <p className="page-banner__lead">{lead}</p> : null}
      </div>
    </header>
  );
}
