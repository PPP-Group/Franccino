import { PageHead } from '@/components/layout/PageHead';
import { ApiImage } from '@/components/media/ApiImage';
import type { Image } from '@/lib/api/types';

type PageBannerProps = {
  image: Image | null;
  title: string;
  lead?: string | null;
};

/**
 * Banner com foto no topo da página, no estilo da "versão do Marcelo" (ajustes do cliente, 06/10/2026):
 * a foto ocupa a largura toda e o título fica sobre ela. A foto é a capa da página no painel
 * (Páginas > capa). Sem foto, a página abre com o cabeçalho de texto de sempre.
 */
export function PageBanner({ image, title, lead = null }: PageBannerProps) {
  if (!image) {
    return (
      <div className="wrap">
        <PageHead title={title} lead={lead} />
      </div>
    );
  }
  return (
    <header className="page-banner">
      <ApiImage image={image} sizes="100vw" priority className="page-banner__img" />
      <div className="wrap page-banner__copy">
        <h1 className="page-banner__title">{title}</h1>
        {lead ? <p className="page-banner__lead">{lead}</p> : null}
      </div>
    </header>
  );
}
