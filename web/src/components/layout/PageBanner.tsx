import { PageHead } from '@/components/layout/PageHead';
import { ApiImage } from '@/components/media/ApiImage';
import type { Image } from '@/lib/api/types';
import { isWideArt } from '@/lib/images/cover';
import { pageBannerSizes } from '@/lib/images/cover-sizes';

type PageBannerProps = {
  image: Image | null;
  title: string;
  lead?: string | null;
};

/**
 * Banner com foto no topo da página, no estilo da "versão do Marcelo" (ajustes do cliente, 06/10/2026):
 * a foto ocupa a largura toda e o título fica sobre ela. A foto é a capa da página no painel
 * (Páginas > capa). Sem foto, a página abre com o cabeçalho de texto de sempre.
 *
 * Arte larga (faixa do WordPress, ~1920×500, quase sempre com texto na própria arte): o banner segue a proporção
 * da imagem, sem recorte nem ampliação, e o título vai no cabeçalho de texto logo abaixo (revisão de 06/11/2026).
 */
export function PageBanner({ image, title, lead = null }: PageBannerProps) {
  if (!image) {
    return (
      <div className="wrap">
        <PageHead title={title} lead={lead} />
      </div>
    );
  }
  if (isWideArt(image)) {
    return (
      <>
        <div className="page-banner-art">
          <ApiImage image={image} sizes="100vw" priority />
        </div>
        <div className="wrap">
          <PageHead title={title} lead={lead} />
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
