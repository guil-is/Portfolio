/**
 * Intake record for E2C Cookbook — created retroactively as the worked
 * example of the intake pattern (docs/client-lifecycle.md § 1). New
 * leads get one of these before anything else is scaffolded.
 *
 * Open gate: `intakeGaps(e2cIntake, "invoice")` — the exact CNRS billing
 * establishment (and its VAT ID) is pending from Primavera. Do not
 * invoice until it's filled in and validated on VIES.
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
    entityName: "Centre National de la Recherche Scientifique (CNRS)",
    // CNRS has 1,000+ establishments, each with its own SIRET — the exact
    // billing establishment, address, and VAT ID are pending from
    // Primavera. Validate the VAT number on VIES before invoicing.
    country: "France",
    taxMode: "reverse-charge",
    currency: "EUR",
  },

  password: "cookbook",

  notes: [
    "Agreement is published at /for/e2c (stage: accepted, awaiting signature).",
    "Contact emails still to be recorded from the thread.",
  ],
};
