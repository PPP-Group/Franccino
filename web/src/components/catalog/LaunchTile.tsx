import { ApiImage } from '@/components/media/ApiImage';
import { PLATE_SIZES } from '@/components/products/ProductPlate';
import { Link } from '@/i18n/navigation';
import type { LaunchCard } from '@/lib/api/types';

export function LaunchTile({ launch }: { launch: LaunchCard }) {
  return (
    <article className="plate">
      <Link className="plate__link" href={{ pathname: '/launches/[slug]', params: { slug: launch.slug } }}>
        <div
          className={launch.cover ? 'plate__media plate__media--cover' : 'plate__media plate__media--empty'}
        >
          {launch.cover ? <ApiImage image={launch.cover} sizes={PLATE_SIZES} /> : null}
        </div>
        <div className="plate__body">
          <h2 className="plate__name">{launch.title}</h2>
          {launch.year ? <p className="meta num">{launch.year}</p> : null}
          {launch.summary ? <p className="meta">{launch.summary}</p> : null}
        </div>
      </Link>
    </article>
  );
}
