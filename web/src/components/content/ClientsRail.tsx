import { useTranslations } from 'next-intl';
import { ApiImage } from '@/components/media/ApiImage';
import { Rail } from '@/components/ui/Rail';
import type { Client } from '@/lib/api/types';

/** Faixa "Alguns de nossos clientes" no fim de Projetos e Corporativo, em carrossel como no site antigo. */
export function ClientsRail({ clients }: { clients: Client[] }) {
  const t = useTranslations('corporate');
  const common = useTranslations('common');
  if (clients.length === 0) {
    return null;
  }
  return (
    <section className="clients" aria-labelledby="clients-title">
      <h2 id="clients-title" className="section-title clients__title">
        {t('clients')}
      </h2>
      <Rail label={t('clients')}>
        <ul className="clients__list">
          {clients.map((client) => {
            const mark = client.logo ? (
              <ApiImage image={client.logo} sizes="200px" />
            ) : (
              <span className="clients__name">{client.name}</span>
            );
            return (
              <li key={client.id} className="clients__item">
                {client.url ? (
                  <a href={client.url} target="_blank" rel="noopener noreferrer" aria-label={client.name}>
                    {mark}
                    <span className="visually-hidden">{common('opensInNewWindow')}</span>
                  </a>
                ) : (
                  mark
                )}
              </li>
            );
          })}
        </ul>
      </Rail>
    </section>
  );
}
