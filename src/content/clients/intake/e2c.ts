/**
 * Intake record for E2C Cookbook — created retroactively as the worked
 * example of the intake pattern (docs/client-lifecycle.md § 1). New
 * leads get one of these before anything else is scaffolded.
 *
 * All gates cleared: invoice INV-26017 issued 28 July against the
 * billing details below. Kept for the historical record.
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
    // Final address/VAT per Primavera's annuaire link (retracted the
    // earlier CERSA-only address). Used on invoice INV-26017.
    entityName: "Centre National de la Recherche Scientifique (CNRS), CERSA",
    addressLines: ["3 Rue Michel-Ange", "75016 Paris", "France"],
    vatId: "FR40 180089013",
    country: "France",
    taxMode: "reverse-charge",
    currency: "EUR",
  },

  password: "cookbook",

  notes: [
    "Agreement live at /for/e2c, project in Phase 3 (full production, delivery 21 Aug).",
    "Signing model settled 28 July: nobody can sign for CNRS, so a project lead (Primavera De Filippi or Tara Merk) approves the agreement in their own name, while CNRS formalizes payment by processing the invoice.",
    "Invoice INV-26017 (EUR 2,000) issued 28 July, citing project reference ERC BlockchainGov Grant Agreements No. 865856. Card payment via Stripe, settlement pending — overdue as of the 15 Aug sweep (due 28 Jul), chase Primavera.",
    "Contact emails still to be recorded from the thread.",
  ],
};
