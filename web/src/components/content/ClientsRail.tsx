import { useTranslations } from 'next-intl';
import type { CSSProperties } from 'react';
import { ApiImage } from '@/components/media/ApiImage';
import type { Client } from '@/lib/api/types';
import { logoBox } from '@/lib/ui/logo-box';

/**
 * Faixa "Alguns de nossos clientes" no fim de Projetos e Corporativo, em fundo areia na largura toda. Retorno de
 * 09/11/2026: as logos passam sozinhas em loop contínuo (a lista vai duas vezes e a faixa anda metade do caminho, sem
 * emenda), todas com o mesmo peso visual (`logoBox`) e em preto e branco; a cor volta no hover. Para quem pediu menos
 * movimento, a faixa fica parada e rola com o dedo (motion.css e pages.css).
 */
export function ClientsRail({ clients }: { clients: Client[] }) {
  const t = useTranslations('corporate');
  const common = useTranslations('common');
  if (clients.length === 0) {
    return null;
  }
  const items = (copy: number) =>
    clients.map((client) => {
      const box = client.logo ? logoBox(client.logo.width, client.logo.height) : null;
      const mark =
        client.logo && box ? (
          <span
            className="clients__logo"
            style={{ '--logo-w': `${box.width}px`, '--logo-h': `${box.height}px` } as CSSProperties}
          >
            <ApiImage image={{ ...client.logo, alt: copy === 0 ? client.name : '' }} sizes="240px" />
          </span>
        ) : (
          <span className="clients__name">{client.name}</span>
        );
      return (
        <li
          key={`${copy}-${client.id}`}
          className="clients__item"
          aria-hidden={copy === 0 ? undefined : true}
        >
          {client.url ? (
            <a
              href={client.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={client.name}
              tabIndex={copy === 0 ? undefined : -1}
            >
              {mark}
              <span className="visually-hidden">{common('opensInNewWindow')}</span>
            </a>
          ) : (
            mark
          )}
        </li>
      );
    });
  // Poucas logos não enchem a largura da tela: a lista se repete até passar dela, e o par de cópias anda em loop.
  const repeat = Math.max(1, Math.ceil(10 / clients.length));
  const group = (copy: number) => Array.from({ length: repeat }, (_, index) => items(copy * repeat + index));
  return (
    <section className="clients band band--sand" aria-labelledby="clients-title">
      <div className="wrap" data-reveal>
        <h2 id="clients-title" className="section-title">
          {t('clients')}
        </h2>
      </div>
      <div className="clients__marquee">
        <div
          className="clients__track"
          style={{ '--clients-count': clients.length * repeat } as CSSProperties}
        >
          <ul className="clients__list">{group(0)}</ul>
          <ul className="clients__list" aria-hidden="true">
            {group(1)}
          </ul>
        </div>
      </div>
    </section>
  );
}
