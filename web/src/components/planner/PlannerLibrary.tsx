'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useId, useRef, useState, useTransition } from 'react';
import { Icon } from '@/components/ui/Icon';
import { SnapshotImage } from '@/components/ui/SnapshotImage';
import { searchPlannerPieces } from '@/lib/planner/actions';
import { parsePlannerQuery } from '@/lib/planner/query';
import type { PlannerProduct } from '@/lib/planner/types';

const DEBOUNCE_MS = 300;

export function PlannerLibrary({
  initial,
  onAdd,
}: {
  initial: PlannerProduct[];
  onAdd: (product: PlannerProduct) => void;
}) {
  const t = useTranslations('planner.library');
  const locale = useLocale();
  const baseId = useId();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PlannerProduct[] | null>(null);
  const [pending, startTransition] = useTransition();
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const ticket = useRef(0);
  const numberFormat = new Intl.NumberFormat(locale === 'pt' ? 'pt-BR' : 'en', { maximumFractionDigits: 1 });

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

  const list = results ?? initial;
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
        {list.map((product) => (
          <li key={product.id} className="piece-option">
            {product.image ? (
              <SnapshotImage image={product.image} />
            ) : (
              <span className="piece-option__blank" aria-hidden="true" />
            )}
            <div>
              <div className="piece-option__name">{product.name}</div>
              <div className="meta num">
                {product.shape === 'round'
                  ? t('sizeRound', { diameter: numberFormat.format(product.width) })
                  : t('sizeRect', {
                      width: numberFormat.format(product.width),
                      depth: numberFormat.format(product.depth),
                    })}
              </div>
            </div>
            <button
              type="button"
              aria-label={t('add', { name: product.name })}
              onClick={() => onAdd(product)}
            >
              <Icon name="plus" />
            </button>
          </li>
        ))}
      </ul>
    </details>
  );
}
