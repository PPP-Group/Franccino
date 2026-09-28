'use client';

import { useLocale, useTranslations } from 'next-intl';
import {
  useId,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type KeyboardEvent,
  type PointerEvent,
  type SVGProps,
} from 'react';
import { Icon } from '@/components/ui/Icon';
import { htmlLang, type Locale } from '@/i18n/config';
import {
  countByProduct,
  findConflicts,
  floorUsage,
  keyboardDelta,
  pieceBox,
  roomSizeFromMeters,
  rotateQuarter,
  snap,
} from '@/lib/planner/geometry';
import {
  addPiece,
  planEntries,
  planToQuoteInputs,
  removePiece,
  setRoom,
  updatePiece,
  type PlanEntry,
} from '@/lib/planner/plan';
import { getPlan, getServerPlan, savePlan, subscribePlan } from '@/lib/planner/plan-store';
import {
  CIRCULATION_WARNING_PERCENT,
  ROOM_MAX_CM,
  ROOM_MIN_CM,
  type PlannerProduct,
  type Room,
} from '@/lib/planner/types';
import { quoteActions } from '@/lib/quote/store';
import { showToast } from '@/lib/ui/toast';
import { PlannerLibrary } from './PlannerLibrary';
import { PlanSvg } from './PlanSvg';

type Drag = { uid: number; offsetX: number; offsetY: number; x: number; y: number };

export function RoomPlanner({ initialLibrary }: { initialLibrary: PlannerProduct[] }) {
  const t = useTranslations('planner');
  const q = useTranslations('quote');
  const locale = useLocale() as Locale;
  const baseId = useId();
  const plan = useSyncExternalStore(subscribePlan, getPlan, getServerPlan);
  const [selected, setSelected] = useState<number | null>(null);
  const [drag, setDrag] = useState<Drag | null>(null);
  const [announcement, setAnnouncement] = useState('');
  const svgRef = useRef<SVGSVGElement | null>(null);
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const tag = htmlLang(locale);
  const cmFormat = useMemo(() => new Intl.NumberFormat(tag, { maximumFractionDigits: 1 }), [tag]);
  const metersFormat = useMemo(
    () => new Intl.NumberFormat(tag, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    [tag],
  );

  // Durante o arraste a posição vive no estado local; o armazenamento só recebe o soltar.
  const entries: PlanEntry[] = planEntries(plan).map((entry) =>
    drag && drag.uid === entry.piece.uid
      ? { ...entry, piece: { ...entry.piece, x: drag.x, y: drag.y } }
      : entry,
  );
  const boxes = entries.map(({ piece, product }) => pieceBox(piece, product));
  const conflicts = findConflicts(plan.room, boxes);
  const usage = floorUsage(plan.room, boxes);
  const counts = countByProduct(plan.pieces);
  const selectedPiece = plan.pieces.find((piece) => piece.uid === selected) ?? null;
  const widthM = metersFormat.format(plan.room.w / 100);
  const depthM = metersFormat.format(plan.room.d / 100);

  function handleAdd(product: PlannerProduct) {
    const next = addPiece(plan, product);
    if (next === plan) {
      setAnnouncement(t('maxPieces'));
      return;
    }
    savePlan(next);
    setSelected(next.pieces[next.pieces.length - 1]?.uid ?? null);
    setAnnouncement(t('added', { name: product.name }));
  }

  function rotate(uid: number) {
    const piece = plan.pieces.find((item) => item.uid === uid);
    if (piece) {
      savePlan(updatePiece(plan, uid, { r: rotateQuarter(piece.r) }));
    }
  }

  function remove(uid: number) {
    savePlan(removePiece(plan, uid));
    setSelected(null);
    setAnnouncement(t('removed'));
    canvasRef.current?.focus();
  }

  function resizeRoom(key: keyof Room, value: string) {
    savePlan(setRoom(plan, { ...plan.room, [key]: roomSizeFromMeters(value, plan.room[key]) }));
  }

  function toPlanPoint(event: PointerEvent<SVGGElement>) {
    const matrix = svgRef.current?.getScreenCTM();
    return matrix ? new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse()) : null;
  }

  function finishDrag(uid: number) {
    if (!drag || drag.uid !== uid) {
      return;
    }
    savePlan(updatePiece(plan, uid, { x: drag.x, y: drag.y }));
    setDrag(null);
  }

  function sendToQuote() {
    if (plan.pieces.length === 0) {
      showToast({ text: t('needPieces') });
      return;
    }
    const note = t('roomNote', { width: widthM, depth: depthM });
    let full = false;
    for (const input of planToQuoteInputs(plan, note)) {
      if (quoteActions.add(input) === 'full') {
        full = true;
      }
    }
    showToast({ text: full ? q('listFull') : t('sent', { count: plan.pieces.length }), quoteLink: true });
  }

  function pieceProps(entry: PlanEntry): SVGProps<SVGGElement> {
    const { piece, product } = entry;
    const uid = piece.uid;
    return {
      tabIndex: 0,
      role: 'button',
      'aria-label': t('pieceLabel', {
        name: product.name,
        width: cmFormat.format(product.width),
        depth: cmFormat.format(product.depth),
      }),
      'aria-describedby': `${baseId}-hint`,
      onFocus: () => setSelected(uid),
      onPointerDown: (event) => {
        const point = toPlanPoint(event);
        if (!point) {
          return;
        }
        event.currentTarget.setPointerCapture(event.pointerId);
        setSelected(uid);
        setDrag({ uid, offsetX: point.x - piece.x, offsetY: point.y - piece.y, x: piece.x, y: piece.y });
      },
      onPointerMove: (event) => {
        if (!drag || drag.uid !== uid) {
          return;
        }
        const point = toPlanPoint(event);
        if (point) {
          setDrag({ ...drag, x: snap(point.x - drag.offsetX), y: snap(point.y - drag.offsetY) });
        }
      },
      onPointerUp: () => finishDrag(uid),
      onPointerCancel: () => finishDrag(uid),
      onKeyDown: (event: KeyboardEvent<SVGGElement>) => {
        const delta = keyboardDelta(event.key, event.shiftKey);
        if (delta) {
          event.preventDefault();
          const x = piece.x + delta[0];
          const y = piece.y + delta[1];
          savePlan(updatePiece(plan, uid, { x, y }));
          setAnnouncement(t('moved', { name: product.name, x: cmFormat.format(x), y: cmFormat.format(y) }));
          return;
        }
        if (event.key === 'r' || event.key === 'R') {
          event.preventDefault();
          rotate(uid);
          return;
        }
        if (event.key === 'Delete' || event.key === 'Backspace') {
          event.preventDefault();
          remove(uid);
        }
      },
    };
  }

  return (
    <div className="planner">
      <aside className="planner__side" aria-label={t('sideLabel')}>
        <fieldset className="room-fieldset">
          <legend className="label">{t('roomSize')}</legend>
          <div className="pair">
            <div className="field">
              <label htmlFor={`${baseId}-w`}>{t('roomWidth')}</label>
              <input
                key={`w-${plan.room.w}`}
                id={`${baseId}-w`}
                type="number"
                inputMode="decimal"
                min={ROOM_MIN_CM / 100}
                max={ROOM_MAX_CM / 100}
                step={0.1}
                defaultValue={(plan.room.w / 100).toFixed(1)}
                onBlur={(event) => resizeRoom('w', event.currentTarget.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') event.currentTarget.blur();
                }}
              />
            </div>
            <div className="field">
              <label htmlFor={`${baseId}-d`}>{t('roomDepth')}</label>
              <input
                key={`d-${plan.room.d}`}
                id={`${baseId}-d`}
                type="number"
                inputMode="decimal"
                min={ROOM_MIN_CM / 100}
                max={ROOM_MAX_CM / 100}
                step={0.1}
                defaultValue={(plan.room.d / 100).toFixed(1)}
                onBlur={(event) => resizeRoom('d', event.currentTarget.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') event.currentTarget.blur();
                }}
              />
            </div>
          </div>
        </fieldset>
        <PlannerLibrary initial={initialLibrary} onAdd={handleAdd} />
      </aside>

      <div className="planner__canvas" ref={canvasRef} tabIndex={-1}>
        <div className="canvas-bar">
          <span id={`${baseId}-hint`}>{t('hint')}</span>
          <span className="canvas-bar__actions">
            <button
              type="button"
              disabled={!selectedPiece}
              onClick={() => selectedPiece && rotate(selectedPiece.uid)}
            >
              <Icon name="rotate" />
              <span>{t('rotate')}</span>
            </button>
            <button
              type="button"
              disabled={!selectedPiece}
              onClick={() => selectedPiece && remove(selectedPiece.uid)}
            >
              <Icon name="trash" />
              <span>{t('remove')}</span>
            </button>
          </span>
        </div>
        <PlanSvg
          svgRef={svgRef}
          room={plan.room}
          pieces={entries}
          selectedUid={selected}
          conflicts={conflicts}
          label={t('canvasLabel', { width: widthM, depth: depthM })}
          widthLabel={t('meters', { value: widthM })}
          depthLabel={t('meters', { value: depthM })}
          pieceText={(entry) => ({
            name: entry.product.name,
            size: t('pieceSize', {
              width: cmFormat.format(entry.product.width),
              depth: cmFormat.format(entry.product.depth),
            }),
          })}
          pieceProps={pieceProps}
        />
        <p className="visually-hidden" role="status" aria-live="polite">
          {announcement}
        </p>
      </div>

      <aside className="planner__side" aria-labelledby={`${baseId}-checks`}>
        <h2 id={`${baseId}-checks`} className="planner__heading">
          {t('checks.title')}
        </h2>
        {plan.pieces.length > 0 ? (
          <ul className="checks">
            {conflicts.size > 0 ? (
              <li className="bad">
                <Icon name="close" />
                <span>{t('checks.conflicts', { count: conflicts.size })}</span>
              </li>
            ) : (
              <li className="good">
                <Icon name="check" />
                <span>{t('checks.ok')}</span>
              </li>
            )}
            <li>
              <Icon name="ruler" />
              <span>
                {usage > CIRCULATION_WARNING_PERCENT
                  ? t('checks.usageTight', { percent: usage })
                  : t('checks.usage', { percent: usage })}
              </span>
            </li>
          </ul>
        ) : null}
        <h2 className="planner__heading">{t('summary.title')}</h2>
        <ul className="summary-list num">
          {counts.length > 0 ? (
            counts.map(({ productId, count }) => (
              <li key={productId}>
                <span>{plan.products[String(productId)]?.name}</span>
                <span>{t('summary.count', { count })}</span>
              </li>
            ))
          ) : (
            <li>
              <span className="meta">{t('summary.empty')}</span>
            </li>
          )}
        </ul>
        <button type="button" className="btn btn--block" onClick={sendToQuote}>
          <Icon name="list" />
          <span>{t('sendToList')}</span>
        </button>
        <p className="meta">{t('sendHint')}</p>
      </aside>
    </div>
  );
}
