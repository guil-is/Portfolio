"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, X } from "lucide-react";
import type { SanityResource } from "@/lib/queries";
import {
  RESOURCE_CATEGORIES,
  isResourceCategory,
  resourceDomain,
} from "@/lib/resources";

type Props = {
  resources: SanityResource[];
};

// Values outside the taxonomy (e.g. a category removed from the list
// after documents were created) fall into "Other" instead of vanishing.
function normalizeCategory(value: string): string {
  return isResourceCategory(value) ? value : "other";
}

export function ResourceLibrary({ resources }: Props) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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
        items: byCategory.get(c.value) ?? [],
      }),
    );
  }, [filtered]);

  if (resources.length === 0) return <EmptyLibrary />;

  const isFiltering = query.trim().length > 0 || activeCategory !== null;

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

      <div className="mb-12 flex flex-wrap gap-2">
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
        groups.map((g) => (
          <section key={g.value} className="mb-12">
            <h2 className="flex items-baseline justify-between gap-4 border-t border-rule pt-4 font-caption text-[13px] font-semibold uppercase tracking-[1.5px] text-ink">
              <span>{g.title}</span>
              <span className="font-caption text-[11px] font-medium tracking-[1px] text-faint">
                {g.items.length}
              </span>
            </h2>
            <ul className="divide-y divide-rule-soft">
              {g.items.map((r) => (
                <ResourceRow key={r._id} resource={r} />
              ))}
            </ul>
          </section>
        ))
      )}

      {isFiltering && groups.length > 0 ? (
        <p className="font-caption text-[11px] uppercase tracking-[2px] text-faint">
          {filtered.length} of {resources.length}
        </p>
      ) : null}
    </>
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

function ResourceRow({ resource }: { resource: SanityResource }) {
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
        <Favicon domain={domain} title={resource.title} />

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

        <span
          aria-hidden
          className="mt-1 shrink-0 translate-x-[-4px] text-ink opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100"
        >
          ↗
        </span>
      </a>
    </li>
  );
}

// Site favicon via Google's s2 service (returns a generic globe when a
// site has none, so onError is rare). Falls back to an initial tile.
function Favicon({ domain, title }: { domain: string; title: string }) {
  const [failed, setFailed] = useState(false);
  const initial = title.trim().charAt(0).toUpperCase() || "•";

  return (
    <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-[10px] bg-card">
      {failed ? (
        <span className="font-caption text-[12px] font-semibold text-muted">
          {initial}
        </span>
      ) : (
        <Image
          src={`https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=64`}
          alt=""
          width={20}
          height={20}
          unoptimized
          onError={() => setFailed(true)}
          className="h-5 w-5 object-contain"
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
