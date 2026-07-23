/**
 * Registry of every private /for/ page, used by the master dashboard at
 * /for/clients. The dashboard lists these and pre-unlocks each one so the
 * owner can jump straight in without re-entering per-page passwords.
 *
 * This is deliberately a light metadata list, not an import of each client's
 * full data module: the dashboard only needs a label, a blurb, and where to
 * link. Add a new /for/ page here when you create it.
 *
 * `storageKey` MUST match the storageKey the target page passes to
 * <PasswordGate> (they all follow `for-<slug>-unlocked`). That is the key the
 * dashboard sets to "1" to skip the password on that page.
 */

export type ClientStatus = "current" | "paused" | "past";

export type ClientEntry = {
  slug: string;
  /** Display name shown on the card. */
  name: string;
  /** One line on what the engagement is. */
  summary: string;
  status: ClientStatus;
  /** Route to the page. */
  href: string;
  /** sessionStorage key the target page's PasswordGate reads. */
  storageKey: string;
};

function entry(
  slug: string,
  name: string,
  summary: string,
  status: ClientStatus,
): ClientEntry {
  return {
    slug,
    name,
    summary,
    status,
    href: `/for/${slug}`,
    storageKey: `for-${slug}-unlocked`,
  };
}

export const clientRegistry: ClientEntry[] = [
  entry(
    "e2c",
    "E2C Cookbook",
    "Report redesign for Tara Merk and Primavera De Filippi (CNRS). Paperwork phase.",
    "current",
  ),
  entry(
    "logos",
    "Logos",
    "DWeb Camp 2026 video content: two shorts + aftermovie. Editing in progress.",
    "current",
  ),
  entry(
    "spa",
    "WinWin 2026",
    "Identity, invitation, and website for the Brussels summit.",
    "current",
  ),
  entry(
    "justice",
    "Justice Conder",
    "Design retainer: scope of work and hours log. On pause.",
    "paused",
  ),
  entry(
    "myosin",
    "Myosin",
    "Hivemind launch video: motion design, delivered.",
    "past",
  ),
  entry(
    "huit",
    "Studio Huit",
    "Motion design on the Safe Workspace launch video.",
    "past",
  ),
  entry(
    "tedxberlin",
    "TEDxBerlin",
    "Aftermovie collaboration agreement.",
    "past",
  ),
  entry("odyssey", "Odyssey", "Design partner proposal.", "past"),
];

export function currentClients(): ClientEntry[] {
  return clientRegistry.filter(
    (c) => c.status === "current" || c.status === "paused",
  );
}

export function pastClients(): ClientEntry[] {
  return clientRegistry.filter((c) => c.status === "past");
}
