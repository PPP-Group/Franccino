'use client';

import { useTranslations } from 'next-intl';
import { Icon } from './Icon';

type QuantityStepperProps = {
  value: number;
  onChange: (value: number) => void;
  label: string;
  min?: number;
  max?: number;
};

export function QuantityStepper({ value, onChange, label, min = 1, max = 99 }: QuantityStepperProps) {
  const t = useTranslations('quote');
  return (
    <div className="stepper" role="group" aria-label={label}>
      <button
        type="button"
        aria-label={t('decrease')}
        disabled={value <= min}
        onClick={() => onChange(Math.max(min, value - 1))}
      >
        <Icon name="minus" />
      </button>
      <output className="num" aria-live="polite">
        {value}
      </output>
      <button
        type="button"
        aria-label={t('increase')}
        disabled={value >= max}
        onClick={() => onChange(Math.min(max, value + 1))}
      >
        <Icon name="plus" />
      </button>
    </div>
  );
}
