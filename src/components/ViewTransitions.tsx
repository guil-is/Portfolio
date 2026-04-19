"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Enables cross-page fade transitions via the browser's View
 * Transitions API.
 *
 * How it works: we attach a capture-phase click listener at the
 * document root so we see <a> clicks before <Link>'s own handler.
 * For internal, left-click, modifier-free navigations we
 * preventDefault and run the router.push inside
 * `document.startViewTransition(...)`. The browser snapshots the old
 * DOM, swaps in the new one, and cross-fades between them per the
 * CSS in globals.css.
 *
 * Gracefully degrades on browsers that don't expose
 * `startViewTransition` (Firefox at time of writing) — those clicks
 * go through <Link>'s native handling unchanged.
 */
export function ViewTransitions() {
  const router = useRouter();

  useEffect(() => {
    if (typeof document === "undefined") return;
    const startViewTransition = (
      document as Document & {
        startViewTransition?: (cb: () => void) => unknown;
      }
    ).startViewTransition;
    if (typeof startViewTransition !== "function") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

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

      // Resolve against current origin so we can distinguish internal
      // from external URLs.
      let url: URL;
      try {
        url = new URL(href, window.location.href);
      } catch {
        return;
      }
      if (url.origin !== window.location.origin) return;

      // Same-page hash navigation — skip, we don't want to fade.
      if (
        url.pathname === window.location.pathname &&
        url.search === window.location.search &&
        url.hash
      ) {
        return;
      }

      event.preventDefault();
      const destination = url.pathname + url.search + url.hash;
      startViewTransition!(() => {
        router.push(destination);
      });
    }

    document.addEventListener("click", handler, { capture: true });
    return () => {
      document.removeEventListener("click", handler, { capture: true });
    };
  }, [router]);

  return null;
}
