'use client';

import { useCallback, useEffect, useId, useRef, useState, type KeyboardEvent, type MouseEvent } from 'react';
import { RowPeek } from '@/components/catalog/RowPeek';
import type { Image } from '@/lib/api/types';
import { isTypeAheadKey, nextListboxIndex, typeAheadIndex } from '@/lib/ui/listbox';
import { Icon } from './Icon';

/**
 * `image`: foto que flutua ao lado do ponteiro quando o mouse passa pela opção (o retrato do designer no filtro, como as
 * fotos da tabela técnica; retorno de 09/11/2026).
 */
export type SelectOption = {
  value: string;
  label: string;
  image?: Image | null;
  /** Opção sem resultado com os outros filtros (contagem 0): continua escolhível, mas apagada. */
  muted?: boolean;
};

export type SelectProps = {
  /** Id do botão: o `<label htmlFor>` do campo aponta para ele. */
  id: string;
  /** Nome do campo no formulário (vai num `<input type="hidden">`, como faria o `<select>`). */
  name: string;
  options: readonly SelectOption[];
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  className?: string;
  /** Id do `<label>` visível: dá nome à lista aberta (o botão já tem o nome pelo `htmlFor`). */
  labelId?: string;
  'aria-invalid'?: boolean;
  'aria-describedby'?: string;
  /** Foto da opção em preto e branco (retratos dos designers, como nas páginas deles). */
  imageTone?: 'mono';
};

const TYPE_AHEAD_RESET_MS = 500;
/** Altura de cada opção e o teto da lista (forms.css: 44 px e min(20rem, 60vh)), para decidir se abre para cima. */
const OPTION_HEIGHT = 44;
const LIST_MAX_REM = 20;

/** Abre para cima quando não cabe embaixo e em cima há mais espaço (campo perto do fim da tela). */
function placementFor(button: HTMLElement | null, count: number): 'bottom' | 'top' {
  if (!button) {
    return 'bottom';
  }
  const rect = button.getBoundingClientRect();
  const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
  const needed = Math.min(count * OPTION_HEIGHT + 8, LIST_MAX_REM * rem, window.innerHeight * 0.6);
  const below = window.innerHeight - rect.bottom;
  return below < needed && rect.top > below ? 'top' : 'bottom';
}

/**
 * Lista de opções no desenho do site, no lugar do `<select>` nativo (pedido do tech lead, 06/11/2026: nada com a
 * cara do navegador). Padrão "select-only combobox" do WAI-ARIA APG: o foco fica no botão, a opção ativa vai em
 * `aria-activedescendant`; setas, Home, End, PageUp, PageDown, Enter, Espaço, Esc, Tab e busca por digitação.
 * Dentro de um `<form>`, envia o valor por um campo escondido com o mesmo `name` e volta ao valor inicial no reset.
 * A lista fica no HTML desde o servidor (escondida), o que deixa a abertura animar (motion.css, "Lista de opções").
 */
export function Select({
  id,
  name,
  options,
  defaultValue,
  onValueChange,
  className,
  labelId,
  'aria-invalid': ariaInvalid,
  'aria-describedby': ariaDescribedBy,
  imageTone,
}: SelectProps) {
  const listId = useId();
  const initial = defaultValue ?? options[0]?.value ?? '';
  const [value, setValue] = useState(initial);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [placement, setPlacement] = useState<'bottom' | 'top'>('bottom');
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const typed = useRef({ text: '', timer: 0 as ReturnType<typeof setTimeout> | 0 });

  const selectedIndex = options.findIndex((option) => option.value === value);
  const selected = selectedIndex >= 0 ? options[selectedIndex] : options[0];
  const optionId = (index: number) => `${listId}-option-${index}`;

  const openList = useCallback(
    (index: number) => {
      setActive(index >= 0 ? index : Math.max(selectedIndex, 0));
      setPlacement(placementFor(buttonRef.current, options.length));
      setOpen(true);
    },
    [selectedIndex, options.length],
  );

  const commit = useCallback(
    (index: number) => {
      const option = options[index];
      setOpen(false);
      if (!option || option.value === value) {
        return;
      }
      setValue(option.value);
      onValueChange?.(option.value);
    },
    [options, value, onValueChange],
  );

  // Clique ou toque fora fecha sem trocar o valor.
  useEffect(() => {
    if (!open) {
      return;
    }
    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open]);

  // A opção ativa fica sempre à vista dentro da lista que rola (só a lista rola, a página fica onde está).
  useEffect(() => {
    const list = listRef.current;
    const element = list?.children[active];
    if (!open || !list || !(element instanceof HTMLElement)) {
      return;
    }
    if (element.offsetTop < list.scrollTop) {
      list.scrollTop = element.offsetTop;
    } else if (element.offsetTop + element.offsetHeight > list.scrollTop + list.clientHeight) {
      list.scrollTop = element.offsetTop + element.offsetHeight - list.clientHeight;
    }
  }, [open, active]);

  // `form.reset()` volta o campo escondido ao valor inicial; a lista acompanha.
  useEffect(() => {
    const form = rootRef.current?.closest('form');
    if (!form) {
      return;
    }
    const onReset = () => {
      setValue(initial);
      setOpen(false);
    };
    form.addEventListener('reset', onReset);
    return () => form.removeEventListener('reset', onReset);
  }, [initial]);

  useEffect(() => {
    const state = typed.current;
    return () => {
      if (state.timer) {
        clearTimeout(state.timer);
      }
    };
  }, []);

  function typeAhead(char: string): number | null {
    const state = typed.current;
    if (state.timer) {
      clearTimeout(state.timer);
    }
    state.text += char;
    state.timer = setTimeout(() => {
      state.text = '';
      state.timer = 0;
    }, TYPE_AHEAD_RESET_MS);
    const from = open ? active : selectedIndex;
    return typeAheadIndex(
      options.map((option) => option.label),
      state.text,
      from,
    );
  }

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    const { key } = event;

    if (!open) {
      if (key === 'ArrowDown' || key === 'ArrowUp' || key === 'Enter' || key === ' ') {
        event.preventDefault();
        openList(selectedIndex);
        return;
      }
      if (key === 'Home' || key === 'End') {
        event.preventDefault();
        openList(key === 'Home' ? 0 : options.length - 1);
        return;
      }
      if (isTypeAheadKey(event)) {
        const found = typeAhead(key);
        if (found !== null) {
          openList(found);
        }
      }
      return;
    }

    if (key === 'Escape') {
      event.preventDefault();
      setOpen(false);
      return;
    }
    if (
      key === 'Enter' ||
      (key === ' ' && typed.current.text === '') ||
      (key === 'ArrowUp' && event.altKey)
    ) {
      event.preventDefault();
      commit(active);
      return;
    }
    if (key === 'Tab') {
      commit(active);
      return;
    }
    const next = nextListboxIndex(options.length, active, key);
    if (next !== null) {
      event.preventDefault();
      setActive(next);
      return;
    }
    if (isTypeAheadKey(event)) {
      event.preventDefault();
      const found = typeAhead(key);
      if (found !== null) {
        setActive(found);
      }
    }
  }

  function onOptionClick(index: number) {
    commit(index);
    buttonRef.current?.focus();
  }

  const peeks = options.flatMap((option, index) =>
    option.image ? [{ id: index, images: [option.image] }] : [],
  );

  // O clique na lista não tira o foco do botão (o botão continua dono do teclado e do leitor de tela).
  function keepFocus(event: MouseEvent) {
    event.preventDefault();
  }

  return (
    <div
      ref={rootRef}
      className={className ? `select ${className}` : 'select'}
      data-open={open || undefined}
      data-placement={placement}
    >
      <input type="hidden" name={name} value={value} />
      <button
        ref={buttonRef}
        id={id}
        type="button"
        role="combobox"
        className="select__button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-activedescendant={open && active >= 0 ? optionId(active) : undefined}
        aria-invalid={ariaInvalid}
        aria-describedby={ariaDescribedBy}
        onClick={() => (open ? setOpen(false) : openList(selectedIndex))}
        onKeyDown={onKeyDown}
        onBlur={() => setOpen(false)}
      >
        <span className="select__value">{selected?.label}</span>
        <Icon name="chevron" className="select__chevron" />
      </button>
      <ul
        ref={listRef}
        id={listId}
        role="listbox"
        className="select__list"
        aria-labelledby={labelId}
        tabIndex={-1}
        hidden={!open}
        onMouseDown={keepFocus}
      >
        {options.map((option, index) => (
          <li
            key={option.value}
            id={optionId(index)}
            data-row-id={option.image ? index : undefined}
            role="option"
            className={option.muted ? 'select__option is-muted' : 'select__option'}
            data-value={option.value}
            aria-selected={index === selectedIndex}
            data-active={(open && index === active) || undefined}
            onClick={() => onOptionClick(index)}
            onMouseMove={() => (index !== active ? setActive(index) : undefined)}
          >
            <span>{option.label}</span>
            {index === selectedIndex ? <Icon name="check" className="select__check" /> : null}
          </li>
        ))}
      </ul>
      {peeks.length > 0 ? (
        <RowPeek
          items={peeks}
          container=".select__list"
          className={imageTone === 'mono' ? 'row-peek--top row-peek--mono' : 'row-peek--top'}
          beside
          natural
        />
      ) : null}
    </div>
  );
}
