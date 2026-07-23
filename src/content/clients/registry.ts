/**
 * Master client record. One entry per client with a live /for/ page —
 * the primary key is `slug`, and every other system hangs off it:
 *
 *   - /for/<slug>            — the client page (proposal or dashboard)
 *   - signable.ts            — signing registry (same slug)
 *   - invoices/config.ts     — `billToPresets[billingPreset]`
 *   - invoices/ledger.ts     — `clientSlug` on ledger entries
 *   - sessionStorage         — `for-<slug>-unlocked` (PasswordGate)
 *
 * The dashboard at /for/clients renders this list and pre-unlocks each
 * page so the owner can jump straight in without per-page passwords.
 * `storageKey` MUST match the storageKey the target page passes to
 * <PasswordGate> (they all follow `for-<slug>-unlocked`).
 *
 * Lifecycle: `stage` tracks where the engagement is. Leads without a
 * page live as intake files (src/content/clients/intake/) and enter this
 * registry when their proposal page ships. Full protocol — what to do at
 * each stage transition — is in docs/client-lifecycle.md.
 */

export type ClientStage =
  /** Proposal page live, awaiting the client's response. */
  | "proposal"
  /** Verbal yes — agreement being drafted / out for signature. */
  | "accepted"
  /** Agreement signed, work not yet started. */
  | "signed"
  /** Work in progress (retainers on hold set `paused` too). */
  | "active"
  /** Work delivered; final invoice outstanding. Stays "current" on the
   * dashboard until the money lands — unpaid work is open business. */
  | "delivered"
  /** Fully wrapped: paid and offboarded — or a proposal that didn't
   * convert. The terminal stage either way. */
  | "closed";

export type ClientContact = {
  name: string;
  /** Fill in during intake — needed for proposals and signature emails. */
  email?: string;
  role?: string;
};

export type ClientEntry = {
  slug: string;
  /** Display name shown on the card. */
  name: string;
  /** One line on what the engagement is. */
  summary: string;
  stage: ClientStage;
  /** Retainer on hold (only meaningful alongside "active"). */
  paused?: boolean;
  /** Key into `billToPresets` (invoices/config.ts). Unset means billing
   * details haven't been collected yet — do that before invoicing. */
  billingPreset?: string;
  contacts?: ClientContact[];
  /** Route to the page. */
  href: string;
  /** sessionStorage key the target page's PasswordGate reads. */
  storageKey: string;
};

function entry(
  slug: string,
  name: string,
  summary: string,
  stage: ClientStage,
  extra?: Partial<Pick<ClientEntry, "paused" | "billingPreset" | "contacts">>,
): ClientEntry {
  return {
    slug,
    name,
    summary,
    stage,
    ...extra,
    href: `/for/${slug}`,
    storageKey: `for-${slug}-unlocked`,
  };
}

export const clientRegistry: ClientEntry[] = [
  entry(
    "e2c",
    "E2C Cookbook",
    "Report redesign for Tara Merk and Primavera De Filippi (CNRS). Paperwork phase.",
    "accepted",
    {
      contacts: [{ name: "Tara Merk" }, { name: "Primavera De Filippi" }],
    },
  ),
  entry(
    "logos",
    "Logos",
    "DWeb Camp 2026 video content: two shorts + aftermovie. Editing in progress.",
    "active",
  ),
  entry(
    "spa",
    "WinWin 2026",
    "Identity, invitation, and website for the Brussels summit.",
    "active",
    {
      billingPreset: "spa",
      contacts: [{ name: "Lara Sibbing" }],
    },
  ),
  entry(
    "justice",
    "Justice Conder",
    "Design retainer: scope of work and hours log. On pause.",
    "active",
    {
      paused: true,
      billingPreset: "justice",
      contacts: [{ name: "Justice Conder" }],
    },
  ),
  entry(
    "huit",
    "Studio Huit",
    "Motion design on the Safe Workspace launch video. Delivered; INV-26014 outstanding.",
    "delivered",
  ),
  entry(
    "tedxberlin",
    "TEDxBerlin",
    "Aftermovie collaboration agreement. Delivered; INV-26012 outstanding.",
    "delivered",
    {
      billingPreset: "tedxberlin",
      contacts: [{ name: "Stephan Balzer" }],
    },
  ),
  entry(
    "myosin",
    "Myosin",
    "Hivemind launch video: motion design, delivered and paid.",
    "closed",
    { billingPreset: "myosin" },
  ),
  entry("odyssey", "Odyssey", "Design partner proposal — didn't convert.", "closed", {
    contacts: [{ name: "Nick DeNuzzo" }],
  }),
];

export function getClientEntry(slug: string): ClientEntry | null {
  return clientRegistry.find((c) => c.slug === slug) ?? null;
}

/** Everything not closed — open business, in whatever stage. */
export function currentClients(): ClientEntry[] {
  return clientRegistry.filter((c) => c.stage !== "closed");
}

export function pastClients(): ClientEntry[] {
  return clientRegistry.filter((c) => c.stage === "closed");
}

/** Dashboard pill text per stage; null renders no pill. */
export function stageLabel(c: ClientEntry): string | null {
  if (c.paused) return "Paused";
  switch (c.stage) {
    case "proposal":
      return "Proposal out";
    case "accepted":
      return "Agreement out";
    case "signed":
      return "Signed";
    case "delivered":
      return "Awaiting payment";
    default:
      return null;
  }
}
