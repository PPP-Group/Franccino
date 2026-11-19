'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useId, useRef, useState } from 'react';
import { BrandIcon } from '@/components/ui/BrandIcon';
import { Icon } from '@/components/ui/Icon';
import { whatsappUrl } from '@/lib/contact-links';
import type { WhatsappCity } from '@/lib/contact/whatsapp-cities';

/**
 * Botão de WhatsApp em todas as páginas (revisão da Franccino, 18/11/2026): abre uma conversa curta, "Em que cidade
 * você está?", e leva ao WhatsApp da loja daquela cidade (com mais de uma loja, a pessoa escolhe). "Outra cidade" vai
 * para o WhatsApp de orçamentos da Franccino. A mensagem já vem escrita, com o nome da loja.
 */
export function WhatsappButton({ cities, fallback }: { cities: WhatsappCity[]; fallback: string | null }) {
  const t = useTranslations('whatsapp');
  const common = useTranslations('common');
  const [open, setOpen] = useState(false);
  const [chosen, setChosen] = useState<WhatsappCity | null>(null);
  const panelId = useId();
  const toggle = useRef<HTMLButtonElement | null>(null);
  const panel = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return undefined;
    panel.current?.querySelector<HTMLElement>('button, a')?.focus();
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false);
        toggle.current?.focus();
      }
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, chosen]);

  if (cities.length === 0 && !fallback) {
    return null;
  }

  const central = whatsappUrl(fallback, t('messageCentral'));
  const linkFor = (number: string, name: string) =>
    whatsappUrl(number, t('messageStore', { store: name })) ?? '#';

  return (
    <div className={open ? 'wa is-open' : 'wa'}>
      {open ? (
        <div ref={panel} id={panelId} className="wa__panel" role="dialog" aria-label={t('title')}>
          <div className="wa__head">
            <p className="wa__title">{t('title')}</p>
            <button
              type="button"
              className="wa__close"
              aria-label={common('close')}
              onClick={() => {
                setOpen(false);
                toggle.current?.focus();
              }}
            >
              <Icon name="close" />
            </button>
          </div>
          <p className="wa__bubble">{chosen ? t('whichStore', { city: chosen.city }) : t('whichCity')}</p>
          {chosen ? (
            <ul className="wa__options">
              {chosen.stores.map((store) => (
                <li key={store.id}>
                  <a href={linkFor(store.number, store.name)} target="_blank" rel="noopener noreferrer">
                    {store.name}
                    <span className="visually-hidden">{common('opensInNewWindow')}</span>
                  </a>
                </li>
              ))}
              <li>
                <button type="button" className="wa__back" onClick={() => setChosen(null)}>
                  {t('otherCity')}
                </button>
              </li>
            </ul>
          ) : (
            <ul className="wa__options">
              {cities.map((city) =>
                city.stores.length === 1 ? (
                  <li key={city.key}>
                    <a
                      href={linkFor(city.stores[0].number, city.stores[0].name)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {t('city', { city: city.city, state: city.state })}
                      <span className="visually-hidden">{common('opensInNewWindow')}</span>
                    </a>
                  </li>
                ) : (
                  <li key={city.key}>
                    <button type="button" onClick={() => setChosen(city)}>
                      {t('city', { city: city.city, state: city.state })}
                    </button>
                  </li>
                ),
              )}
              {central ? (
                <li>
                  <a href={central} target="_blank" rel="noopener noreferrer">
                    {t('elsewhere')}
                    <span className="visually-hidden">{common('opensInNewWindow')}</span>
                  </a>
                </li>
              ) : null}
            </ul>
          )}
        </div>
      ) : null}
      <button
        ref={toggle}
        type="button"
        className="wa__toggle"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        aria-label={open ? t('close') : t('open')}
        onClick={() => {
          setOpen((value) => !value);
          setChosen(null);
        }}
      >
        <BrandIcon name="whatsapp" size={26} />
      </button>
    </div>
  );
}
