'use client';

import { useTranslations } from 'next-intl';
import { useId, useRef, useState, type KeyboardEvent } from 'react';
import { ApiImage } from '@/components/media/ApiImage';
import type { FinishGroup, FinishSelection } from '@/lib/product/finish-selection';
import { nextRovingIndex } from '@/lib/ui/roving';

type FinishSelectorProps = {
  /** Não vazio (o chamador só renderiza quando há acabamentos). */
  groups: FinishGroup[];
  selection: FinishSelection;
  onSelect: (group: string, id: number) => void;
  note: string | null;
};

export function FinishSelector({ groups, selection, onSelect, note }: FinishSelectorProps) {
  const t = useTranslations('product.finishes');
  const baseId = useId();
  const [activeIndex, setActiveIndex] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const swatchRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const group = groups[activeIndex] ?? groups[0]!;
  const selectedId = selection[group.group];
  const selectedItem = group.items.find((item) => item.id === selectedId) ?? null;
  const focusIndex = Math.max(
    0,
    group.items.findIndex((item) => item.id === selectedId),
  );
  const tabbed = groups.length > 1;

  function handleTabKey(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (
      event.key !== 'ArrowLeft' &&
      event.key !== 'ArrowRight' &&
      event.key !== 'Home' &&
      event.key !== 'End'
    ) {
      return;
    }
    const next = nextRovingIndex(groups.length, index, event.key);
    if (next === null) {
      return;
    }
    event.preventDefault();
    setActiveIndex(next);
    tabRefs.current[next]?.focus();
  }

  function handleSwatchKey(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const next = nextRovingIndex(group.items.length, index, event.key);
    const item = next === null ? undefined : group.items[next];
    if (next === null || !item) {
      return;
    }
    event.preventDefault();
    onSelect(group.group, item.id);
    swatchRefs.current[next]?.focus();
  }

  return (
    <section className="block" aria-labelledby={`${baseId}-title`}>
      <div className="block__title">
        <h2 id={`${baseId}-title`}>{t('title')}</h2>
        {tabbed ? (
          <div className="tabs" role="tablist" aria-label={t('groups')}>
            {groups.map((item, index) => (
              <button
                key={item.group}
                ref={(element) => {
                  tabRefs.current[index] = element;
                }}
                id={`${baseId}-tab-${index}`}
                type="button"
                role="tab"
                aria-selected={index === activeIndex}
                aria-controls={`${baseId}-panel`}
                tabIndex={index === activeIndex ? 0 : -1}
                onClick={() => setActiveIndex(index)}
                onKeyDown={(event) => handleTabKey(event, index)}
              >
                {item.group}
              </button>
            ))}
          </div>
        ) : null}
      </div>
      <div
        id={`${baseId}-panel`}
        role={tabbed ? 'tabpanel' : undefined}
        aria-labelledby={tabbed ? `${baseId}-tab-${activeIndex}` : undefined}
      >
        <div className="swatches" role="radiogroup" aria-label={t('groupLabel', { group: group.group })}>
          {group.items.map((item, index) => (
            <button
              key={item.id}
              ref={(element) => {
                swatchRefs.current[index] = element;
              }}
              type="button"
              role="radio"
              className="swatch"
              aria-checked={item.id === selectedId}
              aria-label={item.code ? t('swatchLabel', { name: item.name, code: item.code }) : item.name}
              tabIndex={index === focusIndex ? 0 : -1}
              onClick={() => onSelect(group.group, item.id)}
              onKeyDown={(event) => handleSwatchKey(event, index)}
            >
              {item.swatch ? (
                <ApiImage image={item.swatch} sizes="46px" />
              ) : (
                <span className="swatch__fallback" aria-hidden="true">
                  {item.code ?? item.name.slice(0, 2)}
                </span>
              )}
            </button>
          ))}
        </div>
        <p className="swatch-name" aria-live="polite">
          {selectedItem ? (
            <>
              <strong>{selectedItem.name}</strong>
              {selectedItem.code ? (
                <span className="meta">{t('code', { code: selectedItem.code })}</span>
              ) : null}
            </>
          ) : (
            <span className="meta">{t('choose', { group: group.group })}</span>
          )}
        </p>
      </div>
      {note ? <p className="meta">{note}</p> : null}
    </section>
  );
}
