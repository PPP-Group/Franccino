import { ApiImage } from '@/components/media/ApiImage';
import { Link, type AppHref } from '@/i18n/navigation';
import type { Image } from '@/lib/api/types';

type CoverTileProps = {
  href: AppHref;
  title: string;
  /** Texto do botão quadrado ("Saiba mais", "Ver lançamentos"). */
  cta: string;
  image: Image | null;
  sizes: string;
  priority?: boolean;
  /**
   * Nome e botão sempre à vista, sobre a foto escurecida na base. Usado no bloco que completa uma grade (lançamento,
   * todas as peças): ele não pode passar por mais uma coleção.
   */
  labelled?: boolean;
};

/**
 * Bloco grande com foto, como as coleções do site antigo (ajustes do cliente, 06/10/2026): ao passar o mouse (ou com
 * o foco) a foto aproxima devagar (`.hover-zoom`), escurece e aparecem o nome e o botão. Sem foto, o bloco fica no
 * fundo escuro com o nome à vista.
 */
export function CoverTile({
  href,
  title,
  cta,
  image,
  sizes,
  priority = false,
  labelled = false,
}: CoverTileProps) {
  const classes = ['collection-tile'];
  if (labelled || !image) classes.push('collection-tile--labelled');
  return (
    // Abre como cortina ao entrar na tela (ideia 04), menos os primeiros blocos, que já abrem à vista (foto principal).
    <Link className={classes.join(' ')} href={href} data-reveal={priority ? undefined : 'curtain'}>
      <div className="collection-tile__media hover-zoom">
        {image ? <ApiImage image={image} sizes={sizes} priority={priority} /> : null}
      </div>
      <div className="collection-tile__overlay">
        <h2 className="collection-tile__title">{title}</h2>
        <span className="collection-tile__more" aria-hidden="true">
          {cta}
        </span>
      </div>
    </Link>
  );
}
