"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import type { SanityPerson } from "@/lib/queries";

type Props = {
  people: SanityPerson[];
};

export function PeopleList({ people }: Props) {
  const allTags = useMemo(() => {
    const set = new Set<string>();
    for (const p of people) {
      for (const t of p.tags ?? []) set.add(t);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [people]);

  const [activeTag, setActiveTag] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!activeTag) return people;
    return people.filter((p) => (p.tags ?? []).includes(activeTag));
  }, [people, activeTag]);

  return (
    <>
      <div className="mb-10 flex flex-wrap gap-2">
        <TagPill
          label="All"
          active={activeTag === null}
          onClick={() => setActiveTag(null)}
        />
        {allTags.map((tag) => (
          <TagPill
            key={tag}
            label={tag}
            active={activeTag === tag}
            onClick={() => setActiveTag(tag)}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-x-8 gap-y-5 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((p) => (
          <PersonRow key={p._id} person={p} />
        ))}
      </div>
    </>
  );
}

function TagPill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-4 py-1.5 font-caption text-[12px] font-medium uppercase tracking-[1px] transition-colors ${
        active
          ? "border-ink bg-ink text-bg"
          : "border-rule-soft text-muted hover:border-ink hover:text-ink"
      }`}
    >
      {label}
    </button>
  );
}

function Avatar({ person }: { person: SanityPerson }) {
  const initials = person.name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
  if (person.image) {
    return (
      <div className="relative h-8 w-8 overflow-hidden rounded-full bg-card">
        <Image
          src={person.image}
          alt=""
          fill
          sizes="32px"
          unoptimized
          className="object-cover"
        />
      </div>
    );
  }
  return (
    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-card font-caption text-[10px] font-semibold uppercase tracking-[1px] text-muted">
      {initials}
    </div>
  );
}

function PersonRow({ person }: { person: SanityPerson }) {
  const content = (
    <>
      <Avatar person={person} />
      <span className="font-display text-[1rem] text-ink md:text-[1.05rem]">
        {person.name}
      </span>
      {person.link ? (
        <span
          aria-hidden
          className="translate-x-[-4px] opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100"
        >
          ↗
        </span>
      ) : null}
    </>
  );

  if (person.link) {
    return (
      <a
        href={person.link}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-center gap-3 py-2 text-muted transition-colors hover:text-ink"
      >
        {content}
      </a>
    );
  }

  return (
    <div className="group flex items-center gap-3 py-2 text-muted">
      {content}
    </div>
  );
}
