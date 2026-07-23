/**
 * Intake schema for new client leads — the structured handoff between
 * "had a chat with a prospective client" and everything downstream
 * (proposal page, agreement, invoicing).
 *
 * One file per lead at src/content/clients/intake/<slug>.ts, typed
 * `ClientIntake` and filled from the conversation/brief. Nothing in the
 * site imports these files; they exist so `tsc` validates the shape and
 * so every stage transition can check what's still missing via
 * `intakeGaps()` instead of discovering gaps at invoice time (see the
 * CNRS-entity scramble on e2c for why).
 *
 * Workflow: docs/client-lifecycle.md. The intake file stays with the
 * client for the whole engagement as the record of collected facts;
 * downstream files (registry entry, billToPresets, proposal data) are
 * derived from it, not the other way around.
 */

export type IntakeContact = {
  name: string;
  email?: string;
  role?: string;
};

export type IntakeTaxMode =
  /** German client → EUR, 19% MwSt. */
  | "de-19"
  /** EU business client outside Germany → EUR net, reverse charge,
   * both VAT IDs on the invoice (validate theirs on VIES first). */
  | "reverse-charge"
  /** Client outside the EU → USD, §3a UStG exemption. */
  | "outside-eu";

export type ClientIntake = {
  /** Becomes the /for/<slug> URL, registry key, and storageKey — pick it
   * once, lowercase, and never change it. */
  slug: string;
  /** Working display name (may firm up later, e.g. event vs company name). */
  name: string;
  /** Where the lead came from — referral, event, cold inbound. */
  source?: string;
  /** Everyone in the conversation. Mark who signs and who pays if known. */
  contacts: IntakeContact[];

  engagement: {
    kind: "project" | "retainer";
    /** One-paragraph description of what they want. */
    summary: string;
    /** Deliverables as discussed, even if rough. */
    deliverables?: string[];
    /** Ballpark or agreed figure, with currency, e.g. "EUR 5,000–8,000". */
    budget?: string;
    /** Hard dates that shape the timeline (launch, event, print deadline). */
    deadline?: string;
    startDate?: string;
  };

  /** Who signs the agreement. Required before the agreement ships. */
  signer?: {
    name: string;
    email: string;
    /** Legal entity they sign on behalf of, if different from `billing`. */
    entity?: string;
  };

  /** Required in full before the first invoice. */
  billing?: {
    /** Exact legal entity name as it must appear on the invoice. */
    entityName?: string;
    addressLines?: string[];
    country?: string;
    /** EU business clients only; validate on VIES before invoicing. */
    vatId?: string;
    taxMode?: IntakeTaxMode;
    currency?: "EUR" | "USD";
  };

  /** Shared-secret password for the /for/ page — one memorable lowercase
   * word, unique per client. */
  password?: string;

  /** Anything else worth remembering from the chat. */
  notes?: string[];
};

/**
 * Gates in the lifecycle where missing intake fields become blockers.
 * Check with `intakeGaps(intake, gate)` before crossing each one.
 */
export type IntakeGate = "proposal" | "agreement" | "invoice";

/** Human-readable list of what's missing for a gate; empty = clear to go. */
export function intakeGaps(intake: ClientIntake, gate: IntakeGate): string[] {
  const gaps: string[] = [];

  if (gate === "proposal" || gate === "agreement" || gate === "invoice") {
    if (!intake.contacts.some((c) => c.email)) {
      gaps.push("at least one contact email (to send the link/password to)");
    }
    if (!intake.engagement.summary) gaps.push("engagement summary");
    if (!intake.password) gaps.push("page password");
  }

  if (gate === "agreement" || gate === "invoice") {
    if (!intake.signer?.name || !intake.signer?.email) {
      gaps.push("signer name and email");
    }
    if (!intake.billing?.entityName) {
      gaps.push("client legal entity (exact name for the agreement parties row)");
    }
  }

  if (gate === "invoice") {
    const b = intake.billing;
    if (!b?.addressLines?.length) gaps.push("billing address");
    if (!b?.country) gaps.push("billing country");
    if (!b?.taxMode) gaps.push("tax mode (de-19 / reverse-charge / outside-eu)");
    if (!b?.currency) gaps.push("invoice currency");
    if (b?.taxMode === "reverse-charge" && !b?.vatId) {
      gaps.push("client VAT ID (required for reverse charge; validate on VIES)");
    }
  }

  return gaps;
}
