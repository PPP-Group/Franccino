import { ApiImage } from '@/components/media/ApiImage';
import { Link, type AppHref } from '@/i18n/navigation';
import type { Image } from '@/lib/api/types';

type TileProps = {
  href: AppHref;
  title: string;
  image?: Image | null;
  /** Fatos curtos exibidos em linha (`.meta-inline` põe os separadores). */
  meta?: string[];
  text?: string | null;
  portrait?: boolean;
  priority?: boolean;
  sizes?: string;
  headingLevel?: 'h2' | 'h3';
};

/** Cartão inteiro clicável de coleção, designer ou projeto. */
export function Tile({
  href,
  title,
  image = null,
  meta = [],
  text = null,
  portrait = false,
  priority = false,
  sizes = '(max-width: 35rem) 100vw, (max-width: 56.25rem) 50vw, 33vw',
  headingLevel: Heading = 'h2',
}: TileProps) {
  return (
    <Link className={portrait ? 'tile tile--portrait' : 'tile'} href={href}>
      <div className="tile__media">
        {image ? <ApiImage image={image} sizes={sizes} priority={priority} /> : null}
      </div>
      <div className="tile__copy">
        <Heading className="tile__title">{title}</Heading>
        {meta.length > 0 ? (
          <ul className="meta meta-inline">
            {meta.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        ) : null}
        {text ? <p className="tile__text">{text}</p> : null}
      </div>
    </Link>
  );
}
