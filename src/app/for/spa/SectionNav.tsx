"use client";

import { useEffect, useState } from "react";

// Sticky left-rail section nav. Minimal by default: a column of short
// hairlines, one per section, with the active section's line longer and
// inked. Labels fade in on hover. Desktop only (sits in the left margin).
const sections = [
  { id: "brief", label: "Brief" },
  { id: "timeline", label: "Process" },
  { id: "investment", label: "Investment" },
  { id: "terms", label: "Terms" },
  { id: "work", label: "Relevant work" },
  { id: "approach", label: "How I work" },
  { id: "next", label: "Next step" },
];

export function SectionNav() {
  const [active, setActive] = useState(sections[0].id);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      // Fire when a section crosses the vertical middle band of the viewport.
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 },
    );
    for (const s of sections) {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, []);

  const handleClick = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (!el) return;
    history.replaceState(null, "", `#${id}`);
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <nav
      aria-label="Sections"
      className="no-print group fixed left-5 top-1/2 z-40 hidden -translate-y-1/2 flex-col gap-3.5 lg:flex xl:left-8"
    >
      {sections.map((s) => {
        const isActive = active === s.id;
        return (
          <a
            key={s.id}
            href={`#${s.id}`}
            onClick={(e) => handleClick(e, s.id)}
            className="flex items-center gap-3 py-0.5"
          >
            <span
              className={`h-px shrink-0 transition-all duration-300 ${
                isActive
                  ? "w-7 bg-ink"
                  : "w-4 bg-rule group-hover:bg-muted"
              }`}
            />
            <span
              className={`max-w-0 overflow-hidden whitespace-nowrap font-caption text-[10px] font-medium uppercase tracking-[1.5px] opacity-0 transition-all duration-300 group-hover:max-w-[12rem] group-hover:opacity-100 ${
                isActive ? "text-ink" : "text-muted"
              }`}
            >
              {s.label}
            </span>
          </a>
        );
      })}
    </nav>
  );
}
