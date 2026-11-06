import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';

/** Decisão da Franccino no PDF de retorno do banco de ideias. */
export type IdeaDecision = 'approved' | 'adjusted';

/** Situação no site: no ar com o conteúdo atual, ou funcionando mas à espera de material da Franccino. */
export type IdeaStatus = 'live' | 'waiting';

type IdeaSectionProps = {
  /** Número da ideia no PDF do banco de ideias, com dois algarismos ("01", "12"). */
  number: string;
  title: string;
  decision: IdeaDecision;
  /** O ajuste pedido pela Franccino, como está no PDF; só nas aprovadas com ajustes. */
  adjustment?: string | null;
  description: string;
  status: IdeaStatus;
  /** O que falta da Franccino para a ideia ficar completa com o conteúdo final; some quando não falta nada. */
  missing?: string | null;
  /** Observação sobre a demonstração (ex.: conteúdo de exemplo). */
  note?: string | null;
  children?: ReactNode;
};

/** Uma ideia aprovada na página de prévia: número, nome, decisão, situação, o que falta e a demonstração ao vivo. */
export function IdeaSection({
  number,
  title,
  decision,
  adjustment,
  description,
  status,
  missing,
  note,
  children,
}: IdeaSectionProps) {
  const t = useTranslations('ideas');
  const id = `ideia-${number}`;
  return (
    <section className="idea" aria-labelledby={id}>
      <div className="wrap idea__head" data-reveal="">
        <p className="label idea__number">{t('number', { number })}</p>
        <h2 id={id}>{title}</h2>
        <ul className="idea__badges">
          <li className={`label idea__decision idea__decision--${decision}`}>{t(`decision.${decision}`)}</li>
          <li className={`label idea__status idea__status--${status}`}>{t(`status.${status}`)}</li>
        </ul>
        {adjustment ? (
          <p className="idea__adjustment">
            <strong>{t('adjustmentLabel')}</strong> {adjustment}
          </p>
        ) : null}
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
