import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';

export type IdeaStatus = 'ready' | 'waiting' | 'live';

type IdeaSectionProps = {
  /** Número da ideia no banco de ideias (ex.: "1", "3 e 14"). */
  number: string;
  title: string;
  description: string;
  status: IdeaStatus;
  /** O que falta da Franccino para a ideia ficar completa com o conteúdo final; some quando não falta nada. */
  missing?: string | null;
  /** Observação sobre a demonstração (ex.: conteúdo de exemplo). */
  note?: string | null;
  children?: ReactNode;
};

/** Uma ideia aprovada na página de prévia: número, nome, situação, o que falta e a demonstração ao vivo. */
export function IdeaSection({
  number,
  title,
  description,
  status,
  missing,
  note,
  children,
}: IdeaSectionProps) {
  const t = useTranslations('ideas');
  const id = `ideia-${number.replace(/\D+/g, '-')}`;
  return (
    <section className="idea" aria-labelledby={id}>
      <div className="wrap idea__head">
        <p className="label idea__number">{t('number', { number })}</p>
        <h2 id={id}>{title}</h2>
        <p className={`label idea__status idea__status--${status}`}>{t(`status.${status}`)}</p>
        <p className="lead idea__description">{description}</p>
        {missing ? (
          <p className="idea__missing">
            <strong>{t('missingLabel')}</strong> {missing}
          </p>
        ) : null}
        {note ? <p className="meta">{note}</p> : null}
      </div>
      {children ? <div className="idea__demo">{children}</div> : null}
    </section>
  );
}
