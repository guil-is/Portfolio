"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

/**
 * Cross-page fade using a simple class-based approach: fade the
 * body out on link click, wait for the animation, then run the
 * navigation. When the new page mounts, the class is removed and
 * the body fades back in.
 *
 * This is less magical than the View Transitions API but works
 * reliably with server components and async data fetching — the
 * navigation itself is untouched, we only add a CSS opacity
 * transition around it.
 */

const FADE_MS = 200;

export function ViewTransitions() {
  const router = useRouter();
  const pathname = usePathname();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Drop the leaving class whenever the URL changes so the new page
  // can fade back in via its own mount animation.
  useEffect(() => {
    document.documentElement.classList.remove("page-leaving");
  }, [pathname]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    function handler(event: MouseEvent) {
      if (event.defaultPrevented) return;
      if (event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }

      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest("a");
      if (!anchor) return;
      if (anchor.target && anchor.target !== "_self") return;
      if (anchor.hasAttribute("download")) return;

      const href = anchor.getAttribute("href");
      if (!href) return;
      if (
        href.startsWith("#") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        href.startsWith("javascript:")
      ) {
        return;
      }

      let url: URL;
      try {
        url = new URL(href, window.location.href);
      } catch {
        return;
      }
      if (url.origin !== window.location.origin) return;
      // Same-page (only hash or identical) — skip the fade.
      if (
        url.pathname === window.location.pathname &&
        url.search === window.location.search
      ) {
        return;
      }

      event.preventDefault();
      const destination = url.pathname + url.search + url.hash;

      document.documentElement.classList.add("page-leaving");
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        router.push(destination);
      }, FADE_MS);
    }

    document.addEventListener("click", handler, { capture: true });
    return () => {
      document.removeEventListener("click", handler, { capture: true });
      if (timer.current) clearTimeout(timer.current);
    };
  }, [router]);

  return null;
}
