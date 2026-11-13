'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useId, useRef, useState, type KeyboardEvent } from 'react';
import type { Locale } from '@/i18n/config';
import type { Dimension } from '@/lib/api/types';
import { formatCentimeters } from '@/lib/format/dimensions';
import { computeDrawing } from '@/lib/product/dimension-drawing';
import { nextRovingIndex } from '@/lib/ui/roving';
import { Icon } from '@/components/ui/Icon';
import { DimensionDrawing } from './DimensionDrawing';

type FactKey = 'width' | 'depth' | 'height' | 'diameter' | 'seatHeight';
type Fact = { key: FactKey; value: number; max: number | null };

/** Seta de cada medida (revisão da Franccino, 12/11/2026, item 20): ↔ largura, ↗ profundidade, ↕ altura. */
const FACT_ICON = {
  width: 'measure-width',
  depth: 'measure-depth',
  height: 'measure-height',
  seatHeight: 'measure-height',
  diameter: 'measure-width',
} as const;

function hasValue(dimension: Dimension): boolean {
  return [dimension.width, dimension.depth, dimension.height, dimension.diameter, dimension.seat_height].some(
    (value) => value !== null,
  );
}

function factsOf(dimension: Dimension): Fact[] {
  const round = dimension.diameter !== null && dimension.width === null;
  // Medida flexível: o "até" só conta quando é maior que a medida (ex.: largura de 1000 a 1500).
  const upTo = (min: number | null, max: number | null | undefined) =>
    min !== null && max !== null && max !== undefined && max > min ? max : null;
  const candidates: { key: FactKey; value: number | null; max: number | null }[] = round
    ? [
        { key: 'diameter', value: dimension.diameter, max: upTo(dimension.diameter, dimension.diameter_max) },
        { key: 'height', value: dimension.height, max: upTo(dimension.height, dimension.height_max) },
        { key: 'seatHeight', value: dimension.seat_height, max: null },
      ]
    : [
        { key: 'width', value: dimension.width, max: upTo(dimension.width, dimension.width_max) },
        { key: 'depth', value: dimension.depth, max: upTo(dimension.depth, dimension.depth_max) },
        { key: 'height', value: dimension.height, max: upTo(dimension.height, dimension.height_max) },
        { key: 'seatHeight', value: dimension.seat_height, max: null },
      ];
  return candidates.filter((fact): fact is Fact => fact.value !== null);
}

export function DimensionsBlock({ dimensions }: { dimensions: Dimension[] }) {
  const t = useTranslations('product.dimensions');
  const locale = useLocale() as Locale;
  const baseId = useId();
  const [active, setActive] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const usable = dimensions.filter(hasValue);
  if (usable.length === 0) {
    return null;
  }
  const current = usable[Math.min(active, usable.length - 1)]!;
  const cm = (mm: number) => formatCentimeters(mm, locale);
  const facts = factsOf(current);
  const geometry = computeDrawing(current);
  const summary = facts
    .map((fact) =>
      t(`inline.${fact.key}`, {
        value: fact.max !== null ? t('range', { min: cm(fact.value), max: cm(fact.max) }) : cm(fact.value),
      }),
    )
    .join(', ');
  const tabbed = usable.length > 1;

  function handleTabKey(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (
      event.key !== 'ArrowLeft' &&
      event.key !== 'ArrowRight' &&
      event.key !== 'Home' &&
      event.key !== 'End'
    ) {
      return;
    }
    const next = nextRovingIndex(usable.length, index, event.key);
    if (next === null) {
      return;
    }
    event.preventDefault();
    setActive(next);
    tabRefs.current[next]?.focus();
  }

  return (
    <section className="block" aria-labelledby={`${baseId}-title`}>
      <div className="block__title">
        <h2 id={`${baseId}-title`}>{t('title')}</h2>
      </div>
      {tabbed ? (
        <div className="tabs" role="tablist" aria-label={t('variants')}>
          {usable.map((dimension, index) => (
            <button
              key={`${index}-${dimension.label ?? ''}`}
              ref={(element) => {
                tabRefs.current[index] = element;
              }}
              id={`${baseId}-tab-${index}`}
              type="button"
              role="tab"
              aria-selected={index === active}
              aria-controls={`${baseId}-panel`}
              tabIndex={index === active ? 0 : -1}
              onClick={() => setActive(index)}
              onKeyDown={(event) => handleTabKey(event, index)}
            >
              {dimension.label ?? t('variant', { number: index + 1 })}
            </button>
          ))}
        </div>
      ) : null}
      <div
        className="dims"
        id={`${baseId}-panel`}
        role={tabbed ? 'tabpanel' : undefined}
        aria-labelledby={tabbed ? `${baseId}-tab-${active}` : undefined}
      >
        {geometry ? (
          <DimensionDrawing
            geometry={geometry}
            labels={{
              title: t('drawing', { facts: summary }),
              front: t('front'),
              side: t('side'),
              width: geometry.round
                ? t('diameterValue', { value: cm(geometry.widthMm) })
                : cm(geometry.widthMm),
              depth: geometry.depthMm !== null ? cm(geometry.depthMm) : null,
              height: cm(geometry.heightMm),
              seat: geometry.seatMm !== null ? cm(geometry.seatMm) : null,
            }}
          />
        ) : null}
        <dl className="num dims__facts">
          {facts.map((fact) => (
            <div key={fact.key}>
              <dt>
                <Icon name={FACT_ICON[fact.key]} className="dims__arrow" />
                {t(`facts.${fact.key}`)}
              </dt>
              <dd>
                {fact.max !== null ? t('range', { min: cm(fact.value), max: cm(fact.max) }) : cm(fact.value)}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
