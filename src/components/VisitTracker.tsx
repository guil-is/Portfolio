"use client";

import { useEffect } from "react";

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
