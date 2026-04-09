"use client";

import { useEffect, useState } from "react";

type Props = {
  title: string;
  client: string;
};

// Matches Webflow `.project-title-fixed`: a small fixed text block at
// left: 40px, top: 50% that appears once the user has scrolled past
// the main hero title. Hidden on viewports narrower than ~992px
// (same as the reference's responsive rule).
export function ProjectSideTitle({ title, client }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > 240);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      aria-hidden
      className={`pointer-events-none fixed left-10 top-1/2 z-40 hidden -translate-y-1/2 items-center gap-2 font-caption text-[11px] font-medium uppercase tracking-[1.5px] text-muted transition-opacity duration-500 lg:flex ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      <span className="italic">{client}</span>
      <span>/</span>
      <span className="text-ink">{title}</span>
    </div>
  );
}
