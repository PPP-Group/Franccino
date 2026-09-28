'use client';

import { useTranslations } from 'next-intl';
import { useRef, useState } from 'react';
import { ContactForm } from '@/components/forms/ContactForm';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Icon } from '@/components/ui/Icon';
import { QuantityStepper } from '@/components/ui/QuantityStepper';
import { SnapshotImage } from '@/components/ui/SnapshotImage';
import { htmlLang } from '@/i18n/config';
import { Link } from '@/i18n/navigation';
import { whatsappUrl } from '@/lib/contact-links';
import { useQuoteItems } from '@/lib/quote/hooks';
import { quoteItemKey, totalQuantity } from '@/lib/quote/list';
import { buildQuoteMessage, buildWhatsAppText, formatFinishes, toContactItems } from '@/lib/quote/message';
import { quoteActions } from '@/lib/quote/store';
import type { QuoteItem } from '@/lib/quote/types';
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
        <SnapshotImage image={item.image} />
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

export function QuoteListView({ whatsapp }: { whatsapp: string | null }) {
  const t = useTranslations('quote');
  const common = useTranslations('common');
  const isClient = useIsClient();
  const items = useQuoteItems();
  const [sent, setSent] = useState(false);
  const titleRef = useRef<HTMLHeadingElement | null>(null);

  if (!isClient) {
    return (
      <div className="wrap quote-page" aria-busy="true">
        <p className="meta">{common('loading')}</p>
      </div>
    );
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

  const pending = t('pendingFinish');
  const whatsappHref = whatsappUrl(whatsapp, buildWhatsAppText(items, t('whatsappIntro'), pending));

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
          <h2 id="quote-form-title">{t('form.title')}</h2>
          <ContactForm
            type="quote"
            items={toContactItems(items)}
            composeMessage={(typed) => buildQuoteMessage(items, typed, t('messageHeading'), pending)}
            messageRequired={false}
            messageLabel={t('form.notes')}
            messagePlaceholder={t('form.notesPlaceholder')}
            submitLabel={t('form.submit')}
            onSuccess={() => {
              quoteActions.clear();
              setSent(true);
            }}
          />
          {whatsappHref ? (
            <a
              className="btn btn--ghost btn--block"
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Icon name="chat" />
              <span>{t('form.whatsapp')}</span>
              <span className="visually-hidden">{common('opensInNewWindow')}</span>
            </a>
          ) : null}
        </section>
      </div>
    </div>
  );
}
