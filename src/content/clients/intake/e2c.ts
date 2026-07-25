/**
 * Intake record for E2C Cookbook — created retroactively as the worked
 * example of the intake pattern (docs/client-lifecycle.md § 1). New
 * leads get one of these before anything else is scaffolded.
 *
 * Open gate: `intakeGaps(e2cIntake, "invoice")` — CERSA's VAT ID (and
 * SIRET) are still pending. Do not invoice until the VAT ID is recorded
 * and validated on VIES.
 */

import type { ClientIntake } from "../intake";

export const e2cIntake: ClientIntake = {
  slug: "e2c",
  name: "E2C Cookbook",
  source: "Direct — Tara Merk and Primavera De Filippi",
  contacts: [
    { name: "Tara Merk" },
    { name: "Primavera De Filippi", role: "grant holder (CNRS)" },
  ],

  engagement: {
    kind: "project",
    summary:
      "Design refinement of the E2C Cookbook report for the Exit to Community collective, funded through Primavera's research grant and administered by CNRS. Fixed fee EUR 2,000, invoiced up front.",
    deliverables: ["Print PDF", "Web PDF"],
    budget: "EUR 2,000 (fixed)",
    deadline: "Final PDFs by 21 August 2026; launch event 28 August",
  },

  billing: {
    // Confirmed by Primavera via Telegram, 24 July 2026.
    entityName: "CERSA (CNRS)",
    addressLines: ["12 Place du Panthéon", "75005 Paris", "France"],
    // SIRET and VAT ID still pending — validate the VAT number on VIES
    // before invoicing.
    country: "France",
    taxMode: "reverse-charge",
    currency: "EUR",
  },

  password: "cookbook",

  notes: [
    "Agreement is published at /for/e2c (stage: accepted, awaiting signature).",
    "Primavera signs for CERSA (confirmed via Telegram, 24 July) — record her email as signer when the signature lands.",
    "Invoice must cite the project reference: ERC BlockchainGov Grant Agreements No. 865856.",
    "Contact emails still to be recorded from the thread.",
  ],
};
