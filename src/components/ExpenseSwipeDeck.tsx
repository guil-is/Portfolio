"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type RefObject,
} from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Clock,
  Info,
  RotateCcw,
  X,
} from "lucide-react";
import {
  BUSINESS_CATEGORIES,
  CATEGORY_LABELS,
  type Category,
  type DecidedVerdict,
} from "@/lib/expenses/types";
import { formatEur, sameMerchant, similarPending, type Item } from "@/lib/expenses/triage";

/**
 * The "tinder" half of /for/expenses. One card at a time: drag right for
 * business, left for personal, up (or tap the card) for the details
 * view, down for "later". Keyboard mirrors the gestures — arrows, U to
 * undo. Deciding a card applies to every other pending payment from the
 * same merchant unless you switch that off on the card's back.
 */

export type DecideOptions = {
  applyToSimilar: boolean;
  category: Category;
  note?: string;
};

type Props = {
  /** Undecided cards, top of the deck first. */
  queue: Item[];
  /** Every item, so a card can show its siblings. */
  items: Item[];
  done: number;
  total: number;
  streak: number;
  businessSoFar: number;
  canUndo: boolean;
  onDecide: (item: Item, verdict: DecidedVerdict, opts: DecideOptions) => void;
  onLater: (item: Item) => void;
  onUndo: () => void;
};

const THRESHOLD = 110;
const EXIT_MS = 320;

type Exit = "left" | "right" | "down" | null;

export function ExpenseSwipeDeck({
  queue,
  items,
  done,
  total,
  streak,
  businessSoFar,
  canUndo,
  onDecide,
  onLater,
  onUndo,
}: Props) {
  const top = queue[0];
  const topId = top?.tx.id ?? "";
  // Exit / flip state is tagged with the card it belongs to, so a new
  // card at the top starts clean without an effect resetting anything.
  const [exitState, setExitState] = useState<{ id: string; exit: Exit }>({ id: "", exit: null });
  const [flipState, setFlipState] = useState<{ id: string; flipped: boolean }>({ id: "", flipped: false });
  const exit: Exit = exitState.id === topId ? exitState.exit : null;
  const flipped = flipState.id === topId ? flipState.flipped : false;
  const setExit = useCallback((e: Exit) => setExitState({ id: topId, exit: e }), [topId]);
  const toggleFlip = useCallback(
    () => setFlipState((s) => ({ id: topId, flipped: s.id === topId ? !s.flipped : true })),
    [topId],
  );
  const unflip = useCallback(() => setFlipState({ id: topId, flipped: false }), [topId]);
  const exitTimer = useRef<number | null>(null);
  const optsRef = useRef<DecideOptions>({
    applyToSimilar: true,
    category: "other",
  });

  useEffect(() => {
    return () => {
      if (exitTimer.current) window.clearTimeout(exitTimer.current);
    };
  }, [topId]);

  const commit = useCallback(
    (direction: Exclude<Exit, null>) => {
      if (!top || exit) return;
      if (direction === "down" && queue.length < 2) return;
      setExit(direction);
      exitTimer.current = window.setTimeout(() => {
        if (direction === "down") onLater(top);
        else {
          const verdict: DecidedVerdict = direction === "right" ? "business" : "personal";
          onDecide(top, verdict, { ...optsRef.current });
        }
      }, EXIT_MS);
    },
    [top, exit, queue.length, onDecide, onLater, setExit],
  );

  const decideOther = useCallback(
    (verdict: DecidedVerdict) => {
      if (!top || exit) return;
      setExit("down");
      exitTimer.current = window.setTimeout(() => {
        onDecide(top, verdict, { ...optsRef.current });
      }, EXIT_MS);
    },
    [top, exit, onDecide, setExit],
  );

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) {
        // Typing a note: arrows edit text. Escape hands control back.
        if (e.key === "Escape") {
          target.blur();
          unflip();
        }
        return;
      }
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      switch (e.key) {
        case "ArrowRight":
          e.preventDefault();
          commit("right");
          break;
        case "ArrowLeft":
          e.preventDefault();
          commit("left");
          break;
        case "ArrowUp":
        case "i":
          e.preventDefault();
          toggleFlip();
          break;
        case "ArrowDown":
        case "l":
          e.preventDefault();
          commit("down");
          break;
        case "u":
        case "Backspace":
          e.preventDefault();
          if (canUndo) onUndo();
          break;
        case "Escape":
          unflip();
          break;
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [commit, canUndo, onUndo, toggleFlip, unflip]);

  const progress = total === 0 ? 0 : done / total;

  return (
    <section className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
          <p className="font-caption text-[11px] font-medium uppercase tracking-[2px] text-muted">
            {done} of {total} sorted · {queue.length} to go
          </p>
          <div className="flex items-center gap-3">
            {streak >= 3 ? (
              <span className="inline-flex items-center rounded-[6px] border border-accent/40 bg-accent/10 px-2 py-[2px] font-caption text-[10px] font-semibold uppercase tracking-[1px] text-accent">
                Streak {streak}
              </span>
            ) : null}
            <p className="font-caption text-[11px] font-medium uppercase tracking-[2px] text-muted">
              Business so far €{formatEur(businessSoFar)}
            </p>
          </div>
        </div>
        <div className="h-[3px] w-full overflow-hidden rounded-full bg-rule">
          <div
            className="h-full rounded-full bg-accent transition-[width] duration-500 ease-out"
            style={{ width: `${Math.round(progress * 100)}%` }}
          />
        </div>
      </div>

      <div className="relative mx-auto h-[540px] w-full max-w-[420px] select-none">
        {queue
          .slice(0, 3)
          .map((item, i) => (
            <Card
              key={item.tx.id}
              item={item}
              depth={i}
              items={items}
              exit={i === 0 ? exit : null}
              flipped={i === 0 && flipped}
              onFlip={toggleFlip}
              onCommit={commit}
              onDecideOther={decideOther}
              optsRef={optsRef}
            />
          ))
          .reverse()}
      </div>

      <div className="flex items-center justify-center gap-3 md:gap-4">
        <RoundButton
          label="Undo (U)"
          onClick={onUndo}
          disabled={!canUndo}
          size="sm"
        >
          <RotateCcw className="h-4 w-4" strokeWidth={2} />
        </RoundButton>
        <RoundButton
          label="Personal (←)"
          onClick={() => commit("left")}
          tone="no"
          disabled={!top || !!exit}
        >
          <X className="h-6 w-6" strokeWidth={2.25} />
        </RoundButton>
        <RoundButton
          label="More info (↑)"
          onClick={toggleFlip}
          disabled={!top}
          size="sm"
          active={flipped}
        >
          <Info className="h-4 w-4" strokeWidth={2} />
        </RoundButton>
        <RoundButton
          label="Business (→)"
          onClick={() => commit("right")}
          tone="yes"
          disabled={!top || !!exit}
        >
          <Check className="h-6 w-6" strokeWidth={2.5} />
        </RoundButton>
        <RoundButton
          label="Later (↓)"
          onClick={() => commit("down")}
          disabled={!top || !!exit || queue.length < 2}
          size="sm"
        >
          <Clock className="h-4 w-4" strokeWidth={2} />
        </RoundButton>
      </div>
      <p className="text-center font-caption text-[10px] font-medium uppercase tracking-[1.5px] text-faint">
        <span className="inline-flex items-center gap-1"><ArrowLeft className="h-3 w-3" /> personal</span>
        <span className="mx-3">·</span>
        <span className="inline-flex items-center gap-1">business <ArrowRight className="h-3 w-3" /></span>
        <span className="mx-3">·</span>
        <span>↑ info · ↓ later · U undo</span>
      </p>
    </section>
  );
}

function RoundButton({
  children,
  label,
  onClick,
  disabled,
  tone,
  size = "lg",
  active,
}: {
  children: ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  tone?: "yes" | "no";
  size?: "sm" | "lg";
  active?: boolean;
}) {
  const dims = size === "lg" ? "h-16 w-16" : "h-12 w-12";
  const color =
    tone === "yes"
      ? "border-accent text-accent hover:bg-accent hover:text-bg"
      : tone === "no"
        ? "border-[#d14343] text-[#d14343] hover:bg-[#d14343] hover:text-white"
        : active
          ? "border-ink bg-ink text-bg"
          : "border-rule text-muted hover:border-ink hover:text-ink";
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex ${dims} items-center justify-center rounded-full border bg-bg transition-colors disabled:cursor-not-allowed disabled:opacity-30 ${color}`}
    >
      {children}
    </button>
  );
}

type CardProps = {
  item: Item;
  depth: number;
  items: Item[];
  exit: Exit;
  flipped: boolean;
  onFlip: () => void;
  onCommit: (direction: Exclude<Exit, null>) => void;
  onDecideOther: (verdict: DecidedVerdict) => void;
  optsRef: RefObject<DecideOptions>;
};

function Card({
  item,
  depth,
  items,
  exit,
  flipped,
  onFlip,
  onCommit,
  onDecideOther,
  optsRef,
}: CardProps) {
  const [drag, setDrag] = useState<{ dx: number; dy: number; active: boolean }>({
    dx: 0,
    dy: 0,
    active: false,
  });
  // Pointer maths live in a ref: pointermove updates are batched, so the
  // pointerup handler can't trust the drag state it closed over.
  const start = useRef<{ x: number; y: number; moved: boolean; dx: number; dy: number } | null>(null);
  const [applyToSimilar, setApplyToSimilar] = useState(true);
  const [category, setCategory] = useState<Category>(item.auto.category);
  const [note, setNote] = useState("");

  useEffect(() => {
    if (depth !== 0) return;
    optsRef.current = {
      applyToSimilar,
      category: BUSINESS_CATEGORIES.includes(category) ? category : "other",
      note: note || undefined,
    };
  }, [applyToSimilar, category, note, depth, optsRef]);

  const similar = similarPending(items, item);
  const siblings = sameMerchant(items, item);

  function onPointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    if (depth !== 0 || exit || flipped) return;
    const target = e.target as HTMLElement;
    if (/^(BUTTON|INPUT|SELECT|TEXTAREA|A|LABEL)$/.test(target.tagName)) return;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    start.current = { x: e.clientX, y: e.clientY, moved: false, dx: 0, dy: 0 };
    setDrag({ dx: 0, dy: 0, active: true });
  }

  function onPointerMove(e: ReactPointerEvent<HTMLDivElement>) {
    if (!start.current) return;
    const dx = e.clientX - start.current.x;
    const dy = e.clientY - start.current.y;
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) start.current.moved = true;
    start.current.dx = dx;
    start.current.dy = dy;
    setDrag({ dx, dy, active: true });
  }

  function onPointerUp() {
    if (!start.current) return;
    const { dx, dy, moved } = start.current;
    start.current = null;
    setDrag({ dx: 0, dy: 0, active: false });
    if (dx > THRESHOLD) onCommit("right");
    else if (dx < -THRESHOLD) onCommit("left");
    else if (dy < -THRESHOLD) onFlip();
    else if (dy > THRESHOLD) onCommit("down");
    else if (!moved) onFlip();
  }

  let transform = "";
  let transition = "transform 320ms cubic-bezier(0.22, 1, 0.36, 1), opacity 320ms";
  let opacity = 1;
  if (depth > 0) {
    transform = `translateY(${depth * 14}px) scale(${1 - depth * 0.04})`;
  } else if (exit === "right") {
    transform = "translate(120vw, -40px) rotate(18deg)";
    opacity = 0;
  } else if (exit === "left") {
    transform = "translate(-120vw, -40px) rotate(-18deg)";
    opacity = 0;
  } else if (exit === "down") {
    transform = "translateY(80vh) scale(0.9)";
    opacity = 0;
  } else if (drag.active) {
    transform = `translate(${drag.dx}px, ${drag.dy}px) rotate(${drag.dx / 18}deg)`;
    transition = "none";
  }

  const yesOpacity = Math.min(1, Math.max(0, drag.dx) / THRESHOLD);
  const noOpacity = Math.min(1, Math.max(0, -drag.dx) / THRESHOLD);

  return (
    <div
      className="absolute inset-0"
      data-depth={depth}
      style={{ transform, transition, opacity, zIndex: 10 - depth, touchAction: "none" }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <div
        className={`relative flex h-full w-full flex-col overflow-hidden rounded-[24px] border border-rule bg-bg ${
          depth === 0 ? "cursor-grab active:cursor-grabbing" : ""
        }`}
        style={{ boxShadow: "var(--shadow-card)" }}
      >
        {depth === 0 ? (
          <>
            <Stamp side="left" label="Business" opacity={yesOpacity} />
            <Stamp side="right" label="Personal" opacity={noOpacity} />
          </>
        ) : null}

        {flipped && depth === 0 ? (
          <CardBack
            item={item}
            siblings={siblings}
            similarCount={similar.length}
            applyToSimilar={applyToSimilar}
            setApplyToSimilar={setApplyToSimilar}
            category={category}
            setCategory={setCategory}
            note={note}
            setNote={setNote}
            onDecideOther={onDecideOther}
            onFlip={onFlip}
          />
        ) : (
          <CardFront item={item} similarCount={similar.length} siblingsCount={siblings.length} />
        )}
      </div>
    </div>
  );
}

function CardFront({
  item,
  similarCount,
  siblingsCount,
}: {
  item: Item;
  similarCount: number;
  siblingsCount: number;
}) {
  const { tx, auto } = item;
  return (
    <div className="flex h-full flex-col justify-between p-7">
      <div className="flex items-center justify-between gap-4">
        <p className="font-caption text-[11px] font-medium uppercase tracking-[2px] text-muted">
          {prettyDate(tx.date)}
        </p>
        <span className="inline-flex items-center rounded-[6px] border border-rule-soft bg-card/50 px-2 py-[2px] font-caption text-[10px] font-semibold uppercase tracking-[1px] text-muted">
          {kindLabel(tx.kind, tx.type)}
        </span>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="font-display text-[1.75rem] font-bold leading-[1.1] text-ink md:text-[2rem]">
          {tx.partner}
        </h2>
        <p className="font-display text-[3rem] font-bold leading-none text-ink">
          €{formatEur(Math.abs(tx.amount))}
        </p>
        {tx.originalAmount !== undefined ? (
          <p className="font-caption text-[11px] font-medium uppercase tracking-[1.5px] text-muted">
            {Math.abs(tx.originalAmount).toFixed(2)} {tx.originalCurrency}
          </p>
        ) : null}
        {tx.reference ? (
          <p className="line-clamp-3 text-[0.9rem] leading-[1.5rem] text-muted">
            {tx.reference}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-2 rounded-[14px] bg-card/60 px-4 py-3">
        <p className="font-caption text-[10px] font-semibold uppercase tracking-[1.5px] text-muted">
          Why I&apos;m asking
        </p>
        <p className="text-[0.9rem] leading-[1.45rem] text-body">{auto.reason}</p>
        <p className="text-[0.8rem] leading-[1.3rem] text-muted">
          Suggested: {CATEGORY_LABELS[auto.category]}
          {similarCount > 0
            ? ` · your answer applies to ${similarCount} more from this merchant`
            : siblingsCount > 0
              ? ` · ${siblingsCount} other payment${siblingsCount === 1 ? "" : "s"} to this merchant already sorted`
              : ""}
        </p>
      </div>
    </div>
  );
}

function CardBack({
  item,
  siblings,
  similarCount,
  applyToSimilar,
  setApplyToSimilar,
  category,
  setCategory,
  note,
  setNote,
  onDecideOther,
  onFlip,
}: {
  item: Item;
  siblings: Item[];
  similarCount: number;
  applyToSimilar: boolean;
  setApplyToSimilar: (v: boolean) => void;
  category: Category;
  setCategory: (c: Category) => void;
  note: string;
  setNote: (s: string) => void;
  onDecideOther: (verdict: DecidedVerdict) => void;
  onFlip: () => void;
}) {
  const { tx } = item;
  const decidedSiblings = siblings.filter((s) => s.decision);
  return (
    <div className="flex h-full flex-col gap-4 overflow-y-auto p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="font-caption text-[11px] font-medium uppercase tracking-[2px] text-muted">
            {prettyDate(tx.date)} · €{formatEur(Math.abs(tx.amount))}
          </p>
          <h3 className="mt-1 truncate font-display text-[1.25rem] font-bold leading-tight text-ink">
            {tx.partner}
          </h3>
        </div>
        <button
          type="button"
          onClick={onFlip}
          className="shrink-0 font-caption text-[10px] font-semibold uppercase tracking-[1px] text-muted hover:text-ink"
        >
          Back
        </button>
      </div>

      <label className="flex flex-col gap-1.5">
        <span className="font-caption text-[10px] font-semibold uppercase tracking-[1.5px] text-muted">
          Category if business
        </span>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as Category)}
          className="w-full rounded-[10px] border border-rule bg-bg px-3 py-2 text-[0.9rem] text-ink focus:border-ink focus:outline-none"
        >
          {BUSINESS_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {CATEGORY_LABELS[c]}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="font-caption text-[10px] font-semibold uppercase tracking-[1.5px] text-muted">
          Note for the sheet
        </span>
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="e.g. client dinner with Justice"
          className="w-full rounded-[10px] border border-rule bg-bg px-3 py-2 text-[0.9rem] text-ink placeholder:text-faint focus:border-ink focus:outline-none"
        />
      </label>

      <label className="flex items-center justify-between gap-3 rounded-[10px] border border-rule px-3 py-2">
        <span className="text-[0.85rem] leading-[1.3rem] text-body">
          Apply to {similarCount} more from this merchant and remember it
        </span>
        <input
          type="checkbox"
          checked={applyToSimilar}
          onChange={(e) => setApplyToSimilar(e.target.checked)}
          className="h-4 w-4 accent-[var(--color-accent)]"
        />
      </label>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onDecideOther("tax")}
          className="flex-1 rounded-[10px] border border-rule px-3 py-2 font-caption text-[10px] font-semibold uppercase tracking-[1px] text-muted transition-colors hover:border-ink hover:text-ink"
        >
          Tax-relevant, not an expense
        </button>
        <button
          type="button"
          onClick={() => onDecideOther("skip")}
          className="flex-1 rounded-[10px] border border-rule px-3 py-2 font-caption text-[10px] font-semibold uppercase tracking-[1px] text-muted transition-colors hover:border-ink hover:text-ink"
        >
          Skip (internal)
        </button>
      </div>

      <div className="flex flex-col gap-1.5">
        <p className="font-caption text-[10px] font-semibold uppercase tracking-[1.5px] text-muted">
          As exported
        </p>
        <dl className="grid grid-cols-[minmax(0,1fr)_minmax(0,2fr)] gap-x-3 gap-y-1 text-[0.8rem] leading-[1.25rem]">
          {Object.entries(tx.raw).map(([k, v]) => (
            <div key={k} className="contents">
              <dt className="truncate text-muted">{k}</dt>
              <dd className="break-words text-body">{v}</dd>
            </div>
          ))}
        </dl>
      </div>

      {decidedSiblings.length > 0 || siblings.length > 0 ? (
        <div className="flex flex-col gap-1.5">
          <p className="font-caption text-[10px] font-semibold uppercase tracking-[1.5px] text-muted">
            Same merchant · {siblings.length} other{siblings.length === 1 ? "" : "s"} · €
            {formatEur(siblings.reduce((s, i) => s + Math.abs(i.tx.amount), 0))}
          </p>
          <ul className="flex flex-col gap-0.5 text-[0.8rem] leading-[1.25rem] text-muted">
            {siblings.slice(0, 6).map((s) => (
              <li key={s.tx.id} className="flex justify-between gap-3">
                <span>{prettyDate(s.tx.date)}</span>
                <span>€{formatEur(Math.abs(s.tx.amount))}</span>
                <span className="text-faint">{s.decision ? s.decision.verdict : "pending"}</span>
              </li>
            ))}
            {siblings.length > 6 ? <li className="text-faint">…and {siblings.length - 6} more</li> : null}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function Stamp({ side, label, opacity }: { side: "left" | "right"; label: string; opacity: number }) {
  const yes = side === "left";
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute top-7 z-20 rounded-[8px] border-[3px] px-3 py-1 font-caption text-[14px] font-bold uppercase tracking-[3px] ${
        yes
          ? "left-6 -rotate-12 border-accent text-accent"
          : "right-6 rotate-12 border-[#d14343] text-[#d14343]"
      }`}
      style={{ opacity }}
    >
      {label}
    </div>
  );
}

export function prettyDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function kindLabel(kind: Item["tx"]["kind"], type: string): string {
  switch (kind) {
    case "card":
      return "Card";
    case "transfer":
      return "Transfer";
    case "debit":
      return "Direct debit";
    case "atm":
      return "Cash";
    case "fee":
      return "Fee";
    case "internal":
      return "Internal";
    default:
      return type || "Payment";
  }
}
