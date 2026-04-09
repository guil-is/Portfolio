"use client";

import { useEffect, useState } from "react";

type Props = {
  title: string;
  client: string;
};

// Small label fixed at the far-left edge of the viewport, vertically
// centered, rotated so the text reads laterally (bottom-to-top). Appears
// once the user has scrolled past the project hero. Hidden below lg to
// match the Webflow `.project-title-fixed` responsive rule.
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
      className={`pointer-events-none fixed left-6 top-1/2 z-40 hidden whitespace-nowrap font-caption text-[11px] font-medium uppercase tracking-[1.5px] text-muted transition-opacity duration-500 lg:block ${
        visible ? "opacity-100" : "opacity-0"
      }`}
      style={{
        writingMode: "vertical-rl",
        transform: "translateY(-50%) rotate(180deg)",
      }}
    >
      <span className="italic">{client}</span>
      <span className="mx-2">/</span>
      <span className="text-ink">{title}</span>
    </div>
  );
}
