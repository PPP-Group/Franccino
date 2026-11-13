'use client';

import { useLocale, useTranslations } from 'next-intl';
import { type FormEvent, useEffect, useId, useRef, useState } from 'react';
import { Link } from '@/i18n/navigation';
import { registerDownloadLead } from '@/lib/api/forms';

type Errors = Record<string, string>;

/**
 * Cadastro antes do download (revisão da Franccino, 12/11/2026, item 22, referência Boca do Lobo): perfil, nome,
 * sobrenome e e-mail (interesse e telefone opcionais). Aparece no primeiro arquivo; depois o navegador lembra.
 */
export function DownloadLeadDialog({
  onDone,
  onClose,
}: {
  onDone: (token: string) => void;
  onClose: () => void;
}) {
  const t = useTranslations('downloads.lead');
  const form = useTranslations('contactForm');
  const locale = useLocale();
  const id = useId();
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [sending, setSending] = useState(false);
  const [failed, setFailed] = useState(false);

  // Abre como janela modal ao montar. Sem `close()` na limpeza: no modo estrito o efeito roda duas vezes e o evento
  // `close` desmontaria a janela recém-aberta; ao sair da página, o elemento some da camada do topo sozinho.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setSending(true);
    setFailed(false);
    let result: Awaited<ReturnType<typeof registerDownloadLead>>;
    try {
      result = await registerDownloadLead({
        profile: data.get('profile') === 'client' ? 'client' : 'professional',
        first_name: String(data.get('first_name') ?? '').trim(),
        last_name: String(data.get('last_name') ?? '').trim(),
        email: String(data.get('email') ?? '').trim(),
        interest: String(data.get('interest') ?? '').trim() || undefined,
        phone: String(data.get('phone') ?? '').trim() || undefined,
        locale,
        consent: data.get('consent') === 'on',
      });
    } catch {
      // Sem rede: avisa e deixa tentar de novo.
      setSending(false);
      setFailed(true);
      return;
    }
    setSending(false);
    if (result.ok) {
      onDone(result.token);
      return;
    }
    setErrors(result.fieldErrors);
    setFailed(Object.keys(result.fieldErrors).length === 0);
  }

  const field = (name: string, type = 'text', required = true, autoComplete?: string) => (
    <div className="field">
      <label htmlFor={`${id}-${name}`}>
        {t(`fields.${name}`)}
        {required ? (
          <span className="req" aria-hidden="true">
            {form('requiredMark')}
          </span>
        ) : null}
      </label>
      <input
        id={`${id}-${name}`}
        name={name}
        type={type}
        required={required}
        autoComplete={autoComplete}
        aria-invalid={errors[name] ? true : undefined}
      />
      {errors[name] ? <p className="error">{errors[name]}</p> : null}
    </div>
  );

  return (
    <dialog ref={dialogRef} className="lead-dialog" aria-labelledby={`${id}-title`} onClose={onClose}>
      <form className="lead-dialog__form" onSubmit={handleSubmit} noValidate>
        <h2 id={`${id}-title`}>{t('title')}</h2>
        <p className="meta">{t('intro')}</p>
        <fieldset className="lead-dialog__profile">
          <legend>{t('profile')}</legend>
          <label>
            <input type="radio" name="profile" value="professional" defaultChecked />
            <span>{t('professional')}</span>
          </label>
          <label>
            <input type="radio" name="profile" value="client" />
            <span>{t('client')}</span>
          </label>
        </fieldset>
        <div className="lead-dialog__row">
          {field('first_name', 'text', true, 'given-name')}
          {field('last_name', 'text', true, 'family-name')}
        </div>
        {field('email', 'email', true, 'email')}
        {field('interest', 'text', false)}
        {field('phone', 'tel', false, 'tel')}
        <label className="lead-dialog__consent">
          <input type="checkbox" name="consent" required />
          <span>{t.rich('consent', { privacy: (chunks) => <Link href="/privacy">{chunks}</Link> })}</span>
        </label>
        {errors.consent ? <p className="error">{errors.consent}</p> : null}
        {failed ? <p className="error">{t('failed')}</p> : null}
        <div className="lead-dialog__actions">
          <button type="submit" className="btn" disabled={sending} aria-busy={sending}>
            {sending ? t('sending') : t('submit')}
          </button>
          <button type="button" className="btn btn--ghost" onClick={() => dialogRef.current?.close()}>
            {t('cancel')}
          </button>
        </div>
      </form>
    </dialog>
  );
}
