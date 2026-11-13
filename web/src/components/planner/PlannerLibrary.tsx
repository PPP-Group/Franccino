'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useId, useRef, useState, useTransition } from 'react';
import { Icon } from '@/components/ui/Icon';
import { MorphImage } from '@/components/media/MorphImage';
import { htmlLang, type Locale } from '@/i18n/config';
import { Link } from '@/i18n/navigation';
import { searchPlannerPieces } from '@/lib/planner/actions';
import { parsePlannerQuery } from '@/lib/planner/query';
import type { PlannerLibraryItem, PlannerProduct } from '@/lib/planner/types';
import { snapshotAsImage } from '@/lib/quote/snapshot';
import { morphName, morphTypes } from '@/lib/ui/morph';

const DEBOUNCE_MS = 300;

export function PlannerLibrary({
  initial,
  onAdd,
}: {
  initial: PlannerProduct[];
  onAdd: (product: PlannerProduct) => void;
}) {
  const t = useTranslations('planner.library');
  const locale = useLocale() as Locale;
  const baseId = useId();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PlannerLibraryItem[] | null>(null);
  const [pending, startTransition] = useTransition();
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const ticket = useRef(0);
  const numberFormat = new Intl.NumberFormat(htmlLang(locale), { maximumFractionDigits: 1 });

  useEffect(() => () => clearTimeout(timer.current), []);

  function handleChange(value: string) {
    setQuery(value);
    clearTimeout(timer.current);
    if (!parsePlannerQuery(value)) {
      ticket.current += 1;
      setResults(null);
      return;
    }
    timer.current = setTimeout(() => {
      const current = ++ticket.current;
      startTransition(async () => {
        const found = await searchPlannerPieces(locale, value);
        startTransition(() => {
          if (current === ticket.current) {
            setResults(found);
          }
        });
      });
    }, DEBOUNCE_MS);
  }

  const list: PlannerLibraryItem[] = results ?? initial;
  const status = pending ? t('searching') : results !== null && results.length === 0 ? t('noResults') : '';

  return (
    <details className="library" open>
      <summary>{t('title')}</summary>
      <div className="field">
        <label htmlFor={`${baseId}-find`}>{t('search')}</label>
        <input
          id={`${baseId}-find`}
          type="search"
          value={query}
          autoComplete="off"
          placeholder={t('placeholder')}
          onChange={(event) => handleChange(event.target.value)}
        />
      </div>
      <p className="meta" role="status">
        {status}
      </p>
      <ul className="piece-list">
        {list.map((product) => {
          // A foto e o nome abrem a página da peça, para ver antes de pôr na planta; a foto cresce até ela (ideia 10,
          // retorno de 09/11/2026). O "+" continua pondo a peça na planta.
          const morph = morphName('piece', `planner-${product.slug}`);
          const href = { pathname: '/products/[slug]', params: { slug: product.slug } } as const;
          return (
            <li key={product.id} className="piece-option">
              {product.image ? (
                <Link
                  className="piece-option__media"
                  href={href}
                  transitionTypes={morphTypes(morph)}
                  data-morph-link={morph}
                  tabIndex={-1}
                  aria-hidden="true"
                >
                  <MorphImage
                    name={morph}
                    image={snapshotAsImage(product.image)}
                    sizes="56px"
                    fit="contain"
                  />
                </Link>
              ) : (
                <span className="piece-option__blank" aria-hidden="true" />
              )}
              <div>
                <Link
                  className="piece-option__name"
                  href={href}
                  transitionTypes={product.image ? morphTypes(morph) : undefined}
                  data-morph-link={product.image ? morph : undefined}
                >
                  {product.name}
                </Link>
                <div className="meta num">
                  {'unsized' in product
                    ? t('unsized')
                    : product.shape === 'round'
                      ? t('sizeRound', { diameter: numberFormat.format(product.width) })
                      : t('sizeRect', {
                          width: numberFormat.format(product.width),
                          depth: numberFormat.format(product.depth),
                        })}
                </div>
              </div>
              {'unsized' in product ? null : (
                <button
                  type="button"
                  aria-label={t('add', { name: product.name })}
                  onClick={() => onAdd(product)}
                >
                  <Icon name="plus" />
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </details>
  );
}
