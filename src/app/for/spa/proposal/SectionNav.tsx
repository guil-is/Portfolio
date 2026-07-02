"use client";

import { useEffect, useState } from "react";

// Sticky left-rail section nav. Minimal by default: a column of short
// hairlines, one per section, with the active section's line longer and
// inked. Labels fade in on hover. Desktop only (sits in the left margin).
const sections = [
  { id: "brief", label: "Brief" },
  { id: "timeline", label: "Process" },
  { id: "investment", label: "Investment" },
  { id: "scope", label: "Full scope" },
  { id: "terms", label: "Terms" },
  { id: "work", label: "Relevant work" },
  { id: "approach", label: "How I work" },
  { id: "next", label: "Next step" },
];

export function SectionNav() {
  // Empty until a section reaches the viewport's middle band, so nothing is
  // highlighted while the cover (hero) is in view.
  const [active, setActive] = useState("");

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
      className="no-print group fixed left-4 top-1/2 z-40 hidden -translate-y-1/2 flex-col gap-3.5 min-[1440px]:flex"
    >
      {sections.map((s) => {
        const isActive = active === s.id;
        return (
          <a
            key={s.id}
            href={`#${s.id}`}
            onClick={(e) => handleClick(e, s.id)}
            className="group/item flex items-center gap-3 py-0.5"
          >
            <span
              className={`h-px shrink-0 transition-all duration-300 ${
                isActive
                  ? "w-7 bg-ink"
                  : "w-4 bg-rule group-hover/item:bg-muted"
              }`}
            />
            <span
              className={`whitespace-nowrap font-caption text-[10px] font-medium uppercase tracking-[1.5px] transition-colors duration-300 ${
                isActive ? "text-ink" : "text-muted group-hover/item:text-ink"
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
