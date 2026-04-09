"use client";

import Link from "next/link";
import { site } from "@/content/site";
import { ThemeToggle } from "./ThemeToggle";

export function Nav() {
  return (
    <header className="sticky top-0 z-50 w-full bg-background/70 backdrop-blur">
      <nav className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-8">
        <Link
          href="#top"
          className="text-sm font-medium tracking-tight text-foreground/90 hover:text-foreground"
        >
          {site.name}
        </Link>
        <ThemeToggle />
      </nav>
    </header>
  );
}
