"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import Image from "next/image";
import Link from "next/link";
import { LayoutList, Search, Table2, X } from "lucide-react";
import type { SanityResource } from "@/lib/queries";
import {
  RESOURCE_CATEGORIES,
  isResourceCategory,
  resourceDomain,
} from "@/lib/resources";

type Props = {
  resources: SanityResource[];
};

// ---- View preference (list vs. compact table), remembered per browser ----

type View = "table" | "list";
const VIEW_KEY = "resources-view";
const viewListeners = new Set<() => void>();

function readView(): View {
  try {
    return window.localStorage.getItem(VIEW_KEY) === "list" ? "list" : "table";
  } catch {
    return "table";
  }
}
function writeView(view: View) {
  try {
    window.localStorage.setItem(VIEW_KEY, view);
  } catch {
    // private mode etc. — the choice just won't stick
  }
  for (const cb of viewListeners) cb();
}
function subscribeView(cb: () => void) {
  viewListeners.add(cb);
  return () => {
    viewListeners.delete(cb);
  };
}
function getServerView(): View {
  return "table";
}

// Values outside the taxonomy (e.g. a category removed from the list
// after documents were created) fall into "Other" instead of vanishing.
function normalizeCategory(value: string): string {
  return isResourceCategory(value) ? value : "other";
}

// Highest rated first inside a category, then alphabetical.
function byRatingThenTitle(a: SanityResource, b: SanityResource): number {
  return (b.rating ?? 0) - (a.rating ?? 0) || a.title.localeCompare(b.title);
}

// One grid for the column-header row and every table row, so the
// columns line up to the pixel: favicon · name · why (md+) · tags (lg+) · rating.
const TABLE_GRID =
  "grid grid-cols-[1.5rem_minmax(0,1fr)_auto] items-center gap-x-3 " +
  "md:grid-cols-[1.5rem_minmax(0,13rem)_minmax(0,1fr)_auto] md:gap-x-4 " +
  "lg:grid-cols-[1.5rem_minmax(0,15rem)_minmax(0,1fr)_minmax(0,8rem)_auto]";

export function ResourceLibrary({ resources }: Props) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const view = useSyncExternalStore(subscribeView, readView, getServerView);

  // "/" focuses the search box, Escape clears it.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      const typing =
        !!target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable);
      if (e.key === "/" && !typing) {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === "Escape" && target === inputRef.current) {
        setQuery("");
        inputRef.current?.blur();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Categories that actually have entries, in taxonomy order, with counts.
  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    for (const r of resources) {
      const key = normalizeCategory(r.category);
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return RESOURCE_CATEGORIES.filter((c) => counts.has(c.value)).map((c) => ({
      value: c.value,
      title: c.title,
      count: counts.get(c.value) ?? 0,
    }));
  }, [resources]);

  const filtered = useMemo(() => {
    const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    return resources.filter((r) => {
      if (activeCategory && normalizeCategory(r.category) !== activeCategory) {
        return false;
      }
      if (terms.length === 0) return true;
      const haystack = [
        r.title,
        r.description ?? "",
        resourceDomain(r.url),
        ...(r.tags ?? []),
      ]
        .join(" ")
        .toLowerCase();
      return terms.every((t) => haystack.includes(t));
    });
  }, [resources, query, activeCategory]);

  const groups = useMemo(() => {
    const byCategory = new Map<string, SanityResource[]>();
    for (const r of filtered) {
      const key = normalizeCategory(r.category);
      const list = byCategory.get(key) ?? [];
      list.push(r);
      byCategory.set(key, list);
    }
    return RESOURCE_CATEGORIES.filter((c) => byCategory.has(c.value)).map(
      (c) => ({
        value: c.value,
        title: c.title,
        items: [...(byCategory.get(c.value) ?? [])].sort(byRatingThenTitle),
      }),
    );
  }, [filtered]);

  if (resources.length === 0) return <EmptyLibrary />;

  const isFiltering = query.trim().length > 0 || activeCategory !== null;
  const compact = view === "table";

  return (
    <>
      <div className="mb-6 flex items-center gap-3 border-b border-rule pb-3 transition-colors focus-within:border-ink">
        <Search className="h-4 w-4 shrink-0 text-muted" strokeWidth={1.75} />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search the library"
          aria-label="Search resources"
          autoComplete="off"
          spellCheck={false}
          className="w-full min-w-0 bg-transparent text-[1rem] leading-[1.6] text-ink placeholder:text-faint focus:outline-none [&::-webkit-search-cancel-button]:hidden"
        />
        {query ? (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
            aria-label="Clear search"
            className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:bg-ink/5 hover:text-ink"
          >
            <X className="h-3.5 w-3.5" strokeWidth={1.75} />
          </button>
        ) : (
          <kbd
            aria-hidden
            className="hidden shrink-0 rounded-md border border-rule px-1.5 font-caption text-[11px] leading-[18px] text-faint md:inline-block"
          >
            /
          </kbd>
        )}
      </div>

      <div className="mb-10 flex flex-wrap items-center gap-2">
        <FilterPill
          label="All"
          count={resources.length}
          active={activeCategory === null}
          onClick={() => setActiveCategory(null)}
        />
        {categories.map((c) => (
          <FilterPill
            key={c.value}
            label={c.title}
            count={c.count}
            active={activeCategory === c.value}
            onClick={() =>
              setActiveCategory((prev) => (prev === c.value ? null : c.value))
            }
          />
        ))}
        <div className="ml-auto">
          <ViewToggle view={view} />
        </div>
      </div>

      {groups.length === 0 ? (
        <NoMatches
          query={query}
          onClear={() => {
            setQuery("");
            setActiveCategory(null);
            inputRef.current?.focus();
          }}
        />
      ) : (
        <>
          {compact ? <TableHeader /> : null}
          {groups.map((g) => (
            <section key={g.value} className={compact ? "mb-8" : "mb-12"}>
              <h2
                className={`flex items-baseline justify-between gap-4 border-t border-rule font-caption text-[13px] font-semibold uppercase tracking-[1.5px] text-ink ${
                  compact ? "pb-1 pt-3" : "pt-4"
                }`}
              >
                <span>{g.title}</span>
                <span className="font-caption text-[11px] font-medium tracking-[1px] text-faint">
                  {g.items.length}
                </span>
              </h2>
              <ul className="divide-y divide-rule-soft">
                {g.items.map((r) =>
                  compact ? (
                    <TableRow key={r._id} resource={r} />
                  ) : (
                    <ListRow key={r._id} resource={r} />
                  ),
                )}
              </ul>
            </section>
          ))}
        </>
      )}

      {isFiltering && groups.length > 0 ? (
        <p className="font-caption text-[11px] uppercase tracking-[2px] text-faint">
          {filtered.length} of {resources.length}
        </p>
      ) : null}
    </>
  );
}

function ViewToggle({ view }: { view: View }) {
  const options: { value: View; label: string; Icon: typeof Table2 }[] = [
    { value: "table", label: "Table view", Icon: Table2 },
    { value: "list", label: "List view", Icon: LayoutList },
  ];
  return (
    <div
      role="group"
      aria-label="View"
      className="inline-flex items-center rounded-full border border-rule-soft p-0.5"
    >
      {options.map(({ value, label, Icon }) => {
        const active = view === value;
        return (
          <button
            key={value}
            type="button"
            onClick={() => writeView(value)}
            aria-pressed={active}
            aria-label={label}
            title={label}
            className={`inline-flex h-7 w-8 items-center justify-center rounded-full transition-colors ${
              active ? "bg-ink text-bg" : "text-muted hover:text-ink"
            }`}
          >
            <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
          </button>
        );
      })}
    </div>
  );
}

function FilterPill({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full border px-4 py-1.5 font-caption text-[12px] font-medium uppercase tracking-[1px] transition-colors ${
        active
          ? "border-ink bg-ink text-bg"
          : "border-rule-soft text-muted hover:border-ink hover:text-ink"
      }`}
    >
      {label}
      <span className="ml-1.5 opacity-50">{count}</span>
    </button>
  );
}

// ---- Compact table view ----

const COLUMN_HEAD =
  "font-caption text-[10px] font-medium uppercase tracking-[1.5px] text-faint";

function TableHeader() {
  return (
    <div className={`${TABLE_GRID} -mx-2 px-2 pb-2`} aria-hidden>
      <span />
      <span className={COLUMN_HEAD}>Name</span>
      <span className={`${COLUMN_HEAD} hidden md:block`}>Why it&rsquo;s here</span>
      <span className={`${COLUMN_HEAD} hidden lg:block`}>Tags</span>
      <span className={`${COLUMN_HEAD} text-right`}>Rating</span>
    </div>
  );
}

// The table row keeps one line: name, why, two tags (+n), rating. The
// domain and full text live in the tooltip and in the list view.
function TableRow({ resource }: { resource: SanityResource }) {
  const domain = resourceDomain(resource.url);
  const tags = (resource.tags ?? []).filter(Boolean);
  const shownTags = tags.slice(0, 2);
  const moreTags = tags.length - shownTags.length;
  const tooltip = [domain, resource.description].filter(Boolean).join(" · ");

  return (
    <li>
      <a
        href={resource.url}
        target="_blank"
        rel="noopener noreferrer"
        title={tooltip}
        className={`group ${TABLE_GRID} -mx-2 rounded-lg px-2 py-[7px] transition-colors hover:bg-ink/[0.035]`}
      >
        <Favicon domain={domain} title={resource.title} size="sm" />

        <span className="min-w-0 truncate font-display text-[0.95rem] leading-[1.4] text-ink">
          {resource.title}
        </span>

        <p className="hidden min-w-0 truncate text-[0.85rem] leading-[1.4] text-muted md:block">
          {resource.description ?? ""}
        </p>

        <p className="hidden min-w-0 truncate font-caption text-[11px] tracking-[1px] text-faint lg:block">
          {shownTags.map((t) => `#${t}`).join(" ")}
          {moreTags > 0 ? (
            <span className="ml-1 opacity-70">+{moreTags}</span>
          ) : null}
        </p>

        <div className="flex items-center justify-end gap-3">
          <RatingDots rating={resource.rating} />
          <span
            aria-hidden
            className="w-3 translate-x-[-4px] text-ink opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100"
          >
            ↗
          </span>
        </div>
      </a>
    </li>
  );
}

// ---- Comfortable list view ----

function ListRow({ resource }: { resource: SanityResource }) {
  const domain = resourceDomain(resource.url);
  const tags = (resource.tags ?? []).filter(Boolean);

  return (
    <li>
      <a
        href={resource.url}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-start gap-4 py-4"
      >
        <Favicon domain={domain} title={resource.title} size="md" />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
            <span className="font-display text-[1.05rem] leading-[1.4] text-ink md:text-[1.1rem]">
              {resource.title}
            </span>
            <span className="font-caption text-[11px] uppercase tracking-[1.5px] text-faint transition-colors group-hover:text-muted">
              {domain}
            </span>
          </div>
          {resource.description ? (
            <p className="mt-1 max-w-[640px] text-[0.9rem] leading-[1.5rem] text-muted">
              {resource.description}
            </p>
          ) : null}
          {tags.length > 0 ? (
            <ul className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
              {tags.map((t) => (
                <li
                  key={t}
                  className="font-caption text-[11px] tracking-[1px] text-faint"
                >
                  #{t}
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <div className="mt-0.5 flex shrink-0 items-center gap-3">
          <RatingDots rating={resource.rating} />
          <span
            aria-hidden
            className="translate-x-[-4px] text-ink opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100"
          >
            ↗
          </span>
        </div>
      </a>
    </li>
  );
}

// ---- Shared bits ----

// Five dots, filled up to the rating. Hidden when unrated.
function RatingDots({ rating }: { rating?: number }) {
  if (!rating || rating < 1) return null;
  const value = Math.min(5, Math.round(rating));
  return (
    <span
      role="img"
      aria-label={`Rated ${value} of 5`}
      title={`${value}/5`}
      className="flex items-center gap-[3px]"
    >
      {Array.from({ length: 5 }, (_, i) => (
        <span
          key={i}
          className={`h-[5px] w-[5px] rounded-full ${i < value ? "bg-ink" : "bg-rule"}`}
        />
      ))}
    </span>
  );
}

// Site favicon via Google's s2 service (returns a generic globe when a
// site has none, so onError is rare). Falls back to an initial tile.
function Favicon({
  domain,
  title,
  size,
}: {
  domain: string;
  title: string;
  size: "sm" | "md";
}) {
  const [failed, setFailed] = useState(false);
  const initial = title.trim().charAt(0).toUpperCase() || "•";
  const tile =
    size === "sm"
      ? "h-6 w-6 rounded-[7px]"
      : "mt-0.5 h-9 w-9 rounded-[10px]";
  const icon = size === "sm" ? 14 : 20;

  return (
    <div
      className={`flex shrink-0 items-center justify-center overflow-hidden bg-card ${tile}`}
    >
      {failed ? (
        <span
          className={`font-caption font-semibold text-muted ${
            size === "sm" ? "text-[10px]" : "text-[12px]"
          }`}
        >
          {initial}
        </span>
      ) : (
        <Image
          src={`https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=64`}
          alt=""
          width={icon}
          height={icon}
          unoptimized
          onError={() => setFailed(true)}
          className="object-contain"
          style={{ width: icon, height: icon }}
        />
      )}
    </div>
  );
}

function NoMatches({ query, onClear }: { query: string; onClear: () => void }) {
  return (
    <div className="border-t border-rule pt-10">
      <p className="font-display text-[1.25rem] text-ink">
        {query.trim() ? (
          <>
            Nothing matches &ldquo;{query.trim()}&rdquo;.
          </>
        ) : (
          "Nothing in this category yet."
        )}
      </p>
      <button
        type="button"
        onClick={onClear}
        className="mt-4 font-caption text-[12px] font-medium uppercase tracking-[1px] text-muted underline decoration-rule underline-offset-4 transition-colors hover:text-ink"
      >
        Clear filters
      </button>
    </div>
  );
}

function EmptyLibrary() {
  return (
    <div className="border-t border-rule pt-10">
      <p className="font-display text-[1.25rem] text-ink">Nothing here yet.</p>
      <p className="mt-2 max-w-[440px] text-[0.95rem] leading-[1.6rem] text-muted">
        Add the first resource in the Studio. It shows up here within a
        minute of publishing.
      </p>
      <Link
        href="/studio/structure/resource"
        className="mt-6 inline-flex items-center gap-2 font-caption text-[12px] font-medium uppercase tracking-[1px] text-muted underline decoration-rule underline-offset-4 transition-colors hover:text-ink"
      >
        Open the Studio <span aria-hidden>↗</span>
      </Link>
    </div>
  );
}
