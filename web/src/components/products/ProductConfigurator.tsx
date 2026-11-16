'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useId, useRef, useState, type MouseEvent, type ReactNode } from 'react';
import { BrandIcon } from '@/components/ui/BrandIcon';
import { Icon } from '@/components/ui/Icon';
import { QuantityStepper } from '@/components/ui/QuantityStepper';
import type { Locale } from '@/i18n/config';
import { Link } from '@/i18n/navigation';
import type { ProductCard, ProductDetail } from '@/lib/api/types';
import { whatsappUrl } from '@/lib/contact-links';
import {
  initialSelection,
  pendingGroups,
  selectedFinishes,
  selectFinish,
  type FinishSelection,
} from '@/lib/product/finish-selection';
import { useQuoteCount, useQuoteItems } from '@/lib/quote/hooks';
import { quoteItemKey } from '@/lib/quote/list';
import { formatFinishes } from '@/lib/quote/message';
import { toQuoteSnapshot } from '@/lib/quote/snapshot';
import { quoteActions } from '@/lib/quote/store';
import { flyToQuote } from '@/lib/ui/fly-to-quote';
import { FinishSelector } from './FinishSelector';

export type ConfiguratorProduct = ProductCard & Pick<ProductDetail, 'finishes'>;

type ProductConfiguratorProps = {
  product: ConfiguratorProduct;
  whatsapp: string | null;
  finishesNote: string | null;
  /** Conteúdo entre acabamentos e orçamento (medidas, na página de produto). */
  children?: ReactNode;
  /** Formulário "Pedir orçamento só desta peça": abre embaixo da linha de ações, pelo botão dela. */
  quoteForm?: ReactNode;
};

type Feedback = { kind: 'added' | 'full'; text: string };

type AddState = 'add' | 'added' | 'update';

const ADD_LABEL = { add: 'addToList', added: 'addedToList', update: 'updateList' } as const;

export function ProductConfigurator({
  product,
  whatsapp,
  finishesNote,
  children,
  quoteForm,
}: ProductConfiguratorProps) {
  const t = useTranslations('product');
  const q = useTranslations('quote');
  const common = useTranslations('common');
  const locale = useLocale() as Locale;
  const count = useQuoteCount();
  const [selection, setSelection] = useState<FinishSelection>(() => initialSelection(product.finishes));
  const [quantity, setQuantity] = useState(1);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [quoteOpen, setQuoteOpen] = useState(false);
  const quoteId = useId();
  const items = useQuoteItems();
  const finishes = selectedFinishes(product.finishes, selection);
  // A peça com estes acabamentos já na lista (retorno de 16/11/2026): o botão fica verde em "Adicionada à lista"
  // enquanto a quantidade escolhida é a da lista; mudou a quantidade, ele volta a preto e o clique só atualiza a lista.
  const key = quoteItemKey({ productId: product.id, finishes });
  const inList = items.find((item) => quoteItemKey(item) === key) ?? null;
  const state: AddState = !inList ? 'add' : inList.quantity === quantity ? 'added' : 'update';
  // Ao abrir a página (ou trocar o acabamento) com a peça já na lista, a quantidade começa na da lista.
  const synced = useRef<string | null>(null);
  useEffect(() => {
    if (inList && synced.current !== key) {
      synced.current = key;
      setQuantity(inList.quantity);
    }
  }, [inList, key]);

  const pending = pendingGroups(product.finishes, selection);
  const summary = formatFinishes(finishes, q('pendingFinish'));
  const whatsappHref = whatsappUrl(
    whatsapp,
    t('whatsappText', { quantity, name: product.name, finishes: summary }),
  );

  function handleAdd(event: MouseEvent<HTMLButtonElement>) {
    if (state === 'added') return;
    if (state === 'update') {
      quoteActions.setQuantity(key, quantity);
    } else {
      const status = quoteActions.add({ ...toQuoteSnapshot(product, locale, finishes), quantity });
      if (status === 'full') {
        setFeedback({ kind: 'full', text: q('listFull') });
        return;
      }
    }
    synced.current = key;
    // A foto do palco da peça voa até a lista no cabeçalho; rolada para fora da tela, o voo sai do botão.
    flyToQuote(document.querySelector<HTMLImageElement>('.gallery__stage img'), event.currentTarget);
    setFeedback({ kind: 'added', text: t('added', { quantity, name: product.name, finishes: summary }) });
  }

  return (
    <>
      {product.finishes.length > 0 ? (
        <FinishSelector
          groups={product.finishes}
          selection={selection}
          onSelect={(group, id) => setSelection((current) => selectFinish(current, group, id))}
          note={finishesNote}
        />
      ) : (
        // Peça sem acabamentos cadastrados: a nota dela (quando há) e o caminho para a página Acabamentos (retorno de
        // 13/11/2026: a página só se achava pelo endereço).
        <section className="block" aria-labelledby={`${quoteId}-finishes`}>
          <div className="block__title">
            <h2 id={`${quoteId}-finishes`}>{t('finishes.title')}</h2>
          </div>
          <p className="meta">{finishesNote ?? t('finishes.swatchBook')}</p>
          <Link className="link-arrow" href="/finishes">
            <span>{t('finishes.seeAll')}</span>
          </Link>
        </section>
      )}

      {children}

      {/*
        Orçamento em dois níveis (retorno de 06/11/2026): a ação principal (quantidade e "Adicionar à lista de
        orçamento", os dois com 48 px) e, separada por um fio, a linha das outras formas de pedir, com o mesmo espaço
        entre elas e um divisor. O botão principal fica verde com o visto e "Adicionada à lista" enquanto a peça está na
        lista com a quantidade escolhida; o ícone e o contador da lista no cabeçalho pulsam uma vez (microinteração 12d,
        motion.css).
      */}
      <section className="buy block" aria-label={t('buyLabel')}>
        {pending.length > 0 ? (
          <p className="meta">{t('pendingHint', { groups: pending.join(', ') })}</p>
        ) : null}
        <div className="buy__row">
          <QuantityStepper value={quantity} onChange={setQuantity} label={t('quantity')} />
          <button
            type="button"
            className={state === 'added' ? 'btn buy__add is-added' : 'btn buy__add'}
            aria-disabled={state === 'added' ? true : undefined}
            onClick={handleAdd}
          >
            <span className="buy__add-icon add-icon" key={state === 'added' ? 'check' : 'list'}>
              <Icon name={state === 'added' ? 'check' : 'list'} />
            </span>
            <span>{t(ADD_LABEL[state])}</span>
          </button>
        </div>
        <p className={feedback?.kind === 'full' ? 'feedback feedback--alert' : 'feedback'} role="status">
          {feedback ? <span>{feedback.text}</span> : null}
          {feedback?.kind === 'added' ? (
            <Link href="/quote-list">{q('viewListCount', { count })}</Link>
          ) : null}
        </p>
        <ul className="buy__links" aria-label={t('moreWays')}>
          {whatsappHref ? (
            <li>
              <a className="buy__link" href={whatsappHref} target="_blank" rel="noopener noreferrer">
                <BrandIcon name="whatsapp" size={18} />
                <span>{t('whatsapp')}</span>
                <span className="visually-hidden">{common('opensInNewWindow')}</span>
              </a>
            </li>
          ) : null}
          <li>
            <Link className="buy__link" href="/stores">
              <Icon name="pin" />
              <span>{t('whereToBuy')}</span>
            </Link>
          </li>
          {quoteForm ? (
            <li>
              <button
                type="button"
                className="buy__link"
                aria-expanded={quoteOpen}
                aria-controls={quoteId}
                onClick={() => setQuoteOpen((open) => !open)}
              >
                <Icon name={quoteOpen ? 'minus' : 'plus'} />
                <span>{t('quoteOnlyThis')}</span>
              </button>
            </li>
          ) : null}
        </ul>
        {quoteForm ? (
          <div id={quoteId} className="buy__quote" hidden={!quoteOpen}>
            {quoteForm}
          </div>
        ) : null}
      </section>
    </>
  );
}
