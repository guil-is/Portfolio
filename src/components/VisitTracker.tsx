"use client";

import { useEffect } from "react";

/**
 * localStorage flag marking this browser as the site owner's. Set by the
 * /for/clients dashboard (whose password only Guil has) and checked here,
 * so the owner browsing his own client pages doesn't record visits or
 * trigger "just opened their proposal" emails. Client browsers never see
 * the dashboard, so they never get flagged.
 */
export const OWNER_FLAG_KEY = "guil-owner";

/**
 * Fire-and-forget tracker that pings /api/track-visit once per
 * browser-tab session. Renders nothing. Only mounts inside the
 * unlocked children of <PasswordGate>, so a visit = "they got past
 * the gate" and not "they saw the password prompt".
 */
export function VisitTracker({ slug }: { slug: string }) {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const key = `visit-tracked::${slug}`;
    try {
      if (localStorage.getItem(OWNER_FLAG_KEY) === "1") return;
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      // Private mode / storage disabled — just log anyway.
    }
    void fetch("/api/track-visit", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ slug }),
      keepalive: true,
    }).catch(() => {
      // Swallow — this is observability, shouldn't surface to the user.
    });
  }, [slug]);

  return null;
}
