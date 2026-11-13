'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useRef, useState } from 'react';
import { ContactForm } from '@/components/forms/ContactForm';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Icon } from '@/components/ui/Icon';
import { QuantityStepper } from '@/components/ui/QuantityStepper';
import { MorphImage } from '@/components/media/MorphImage';
import { htmlLang, type Locale } from '@/i18n/config';
import { getPathname, Link } from '@/i18n/navigation';
import { createSharedList } from '@/lib/api/forms';
import { whatsappUrl } from '@/lib/contact-links';
import { useQuoteItems } from '@/lib/quote/hooks';
import { quoteItemKey, totalQuantity } from '@/lib/quote/list';
import { formatFinishes, toContactItems } from '@/lib/quote/message';
import { snapshotAsImage } from '@/lib/quote/snapshot';
import { quoteActions } from '@/lib/quote/store';
import type { QuoteItem } from '@/lib/quote/types';
import { morphName, morphTypes } from '@/lib/ui/morph';
import { showToast } from '@/lib/ui/toast';
import { useIsClient } from '@/lib/ui/use-is-client';

function QuoteItemRow({ item, onRemoved }: { item: QuoteItem; onRemoved: () => void }) {
  const t = useTranslations('quote');
  const key = quoteItemKey(item);

  function remove() {
    const removed = quoteActions.remove(key);
    if (removed) {
      showToast({ text: t('removed', { name: removed.name }) });
      onRemoved();
    }
  }

  return (
    <li className="quote-item">
      {item.image ? (
        // A miniatura cresce até a foto da peça e volta (ideia 10, retorno de 09/11/2026: "todo lugar").
        <Link
          className="quote-item__media"
          href={{ pathname: '/products/[slug]', params: { slug: item.slug } }}
          locale={item.locale}
          transitionTypes={morphTypes(morphName('piece', item.slug))}
          data-morph-link={morphName('piece', item.slug)}
          tabIndex={-1}
          aria-hidden="true"
        >
          <MorphImage
            name={morphName('piece', item.slug)}
            image={snapshotAsImage(item.image)}
            sizes="140px"
            fit="contain"
          />
        </Link>
      ) : (
        <span className="quote-item__blank" aria-hidden="true" />
      )}
      <div className="quote-item__copy">
        <h2 className="quote-item__name">
          {/* O item guarda o idioma em que entrou na lista: o link e o nome seguem esse idioma. */}
          <Link
            href={{ pathname: '/products/[slug]', params: { slug: item.slug } }}
            locale={item.locale}
            lang={htmlLang(item.locale)}
            transitionTypes={item.image ? morphTypes(morphName('piece', item.slug)) : undefined}
            data-morph-link={item.image ? morphName('piece', item.slug) : undefined}
          >
            {item.name}
          </Link>
        </h2>
        <p className="meta">{formatFinishes(item.finishes, t('pendingFinish'))}</p>
        {item.note ? <p className="meta">{item.note}</p> : null}
      </div>
      <div className="quote-item__actions">
        <QuantityStepper
          value={item.quantity}
          onChange={(quantity) => quoteActions.setQuantity(key, quantity)}
          label={t('quantityOf', { name: item.name })}
        />
        <button className="remove" type="button" onClick={remove}>
          <Icon name="trash" />
          <span>{t('remove')}</span>
        </button>
      </div>
    </li>
  );
}

const SKELETON_ROWS = [0, 1, 2];

/**
 * Antes de ler a lista salva no navegador: blocos no lugar do título e das linhas, com a faixa de carregamento por
 * cima (microinteração 12f, motion.css), em vez de um "Carregando…" escrito. O texto fica para o leitor de tela.
 */
function QuoteListSkeleton({ label }: { label: string }) {
  return (
    <div className="wrap quote-page" aria-busy="true">
      <p className="visually-hidden" role="status">
        {label}
      </p>
      <div className="quote-skeleton" aria-hidden="true">
        <span className="skeleton quote-skeleton__title" />
        <span className="skeleton quote-skeleton__lead" />
        <ul className="quote-items">
          {SKELETON_ROWS.map((row) => (
            <li key={row} className="quote-item">
              <span className="skeleton quote-skeleton__thumb" />
              <span className="quote-skeleton__lines">
                <span className="skeleton" />
                <span className="skeleton" />
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/**
 * Envio da lista por link (retorno de 12/11/2026): em vez de uma linha por peça no WhatsApp, a lista é guardada na API
 * e vai um link curto para ela, com as fotos. O link é criado no clique e reaproveitado enquanto a lista não muda.
 */
function useShareLink(items: QuoteItem[], locale: Locale) {
  const cache = useRef<{ key: string; url: string } | null>(null);
  return async (): Promise<string> => {
    const key = JSON.stringify(toContactItems(items));
    if (cache.current?.key === key) return cache.current.url;
    const { code } = await createSharedList(toContactItems(items), locale);
    const path = getPathname({ href: { pathname: '/shared-list/[code]', params: { code } }, locale });
    const url = `${window.location.origin}${path}`;
    cache.current = { key, url };
    return url;
  };
}

export function QuoteListView({ whatsapp }: { whatsapp: string | null }) {
  const t = useTranslations('quote');
  const common = useTranslations('common');
  const isClient = useIsClient();
  const items = useQuoteItems();
  const [sent, setSent] = useState(false);
  const [sharing, setSharing] = useState(false);
  const titleRef = useRef<HTMLHeadingElement | null>(null);
  const locale = useLocale() as Locale;
  const shareLink = useShareLink(items, locale);

  if (!isClient) {
    return <QuoteListSkeleton label={common('loading')} />;
  }

  if (sent) {
    return (
      <div className="wrap quote-page">
        <div className="empty" role="status">
          <h1>{t('sent.title')}</h1>
          <p className="lead">{t('sent.body')}</p>
          <div className="empty__actions">
            <Link className="btn" href="/products">
              {t('empty.catalog')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="wrap quote-page">
        <div className="empty">
          <h1>{t('empty.title')}</h1>
          <p className="lead">{t('empty.body')}</p>
          <div className="empty__actions">
            <Link className="btn" href="/products">
              {t('empty.catalog')}
            </Link>
            <Link className="btn btn--ghost" href="/room-planner">
              {t('empty.planner')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const pieceCount = totalQuantity(items);
  const canWhatsapp = whatsappUrl(whatsapp, '') !== null;

  async function sendWhatsapp() {
    // A janela abre já no clique (o navegador bloqueia janela aberta depois de uma espera); o endereço chega em seguida.
    const target = window.open('', '_blank');
    setSharing(true);
    try {
      const url = await shareLink();
      const href = whatsappUrl(whatsapp, t('whatsappShare', { count: pieceCount, url }));
      if (href && target) target.location.href = href;
      else if (href) window.location.href = href;
    } catch {
      target?.close();
      showToast({ text: t('shareFailed') });
    } finally {
      setSharing(false);
    }
  }

  async function copyLink() {
    setSharing(true);
    try {
      const url = await shareLink();
      await navigator.clipboard.writeText(url);
      showToast({ text: t('linkCopied') });
    } catch {
      showToast({ text: t('shareFailed') });
    } finally {
      setSharing(false);
    }
  }

  return (
    <div className="wrap">
      <Breadcrumbs
        label={common('breadcrumb')}
        items={[{ label: common('home'), href: '/' }, { label: t('title') }]}
      />
      <div className="catalog-head catalog-head--tight">
        <div className="catalog-head__copy">
          <h1 ref={titleRef} tabIndex={-1}>
            {t('title')}
          </h1>
          <p className="lead">{t('intro')}</p>
        </div>
        <p className="meta num">{t('pieces', { count: totalQuantity(items) })}</p>
      </div>
      <div className="quote">
        <ul className="quote-items">
          {items.map((item) => (
            <QuoteItemRow key={quoteItemKey(item)} item={item} onRemoved={() => titleRef.current?.focus()} />
          ))}
        </ul>
        <section className="quote-form" aria-labelledby="quote-form-title">
          <h2 id="quote-form-title" className="form-title">
            {t('form.title')}
          </h2>
          <ContactForm
            type="quote"
            items={toContactItems(items)}
            // A lista vai como link no e-mail da equipe (a API guarda a lista com o pedido): a mensagem leva só as
            // observações digitadas, ou o resumo quando não há nenhuma.
            composeMessage={(typed) => typed.trim() || t('messageSummary', { count: pieceCount })}
            messageRequired={false}
            messageLabel={t('form.notes')}
            messagePlaceholder={t('form.notesPlaceholder')}
            submitLabel={t('form.submit')}
            onSuccess={() => {
              quoteActions.clear();
              setSent(true);
            }}
          />
          {canWhatsapp ? (
            <button
              type="button"
              className="btn btn--ghost btn--block"
              onClick={sendWhatsapp}
              disabled={sharing}
              aria-busy={sharing}
            >
              <Icon name="chat" />
              <span>{t('form.whatsapp')}</span>
              <span className="visually-hidden">{common('opensInNewWindow')}</span>
            </button>
          ) : null}
          <button
            type="button"
            className="btn btn--ghost btn--block"
            onClick={copyLink}
            disabled={sharing}
            aria-busy={sharing}
          >
            <Icon name="link" />
            <span>{t('copyLink')}</span>
          </button>
        </section>
      </div>
    </div>
  );
}
