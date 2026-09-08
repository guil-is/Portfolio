/**
 * Intake record for Code & Co. (codeandco.com) — backfilled by the
 * 2026-09-08 client sweep. The proposal page shipped 31 Aug before an
 * intake file existed, so this is reconstructed from the proposal data
 * (src/content/proposals/code-and-co.tsx). Fill the gaps as facts land.
 */

import type { ClientIntake } from "../intake";

export const codeAndCoIntake: ClientIntake = {
  slug: "code-and-co",
  name: "Code & Co.",
  contacts: [{ name: "Kelly Cheesman" }],

  engagement: {
    kind: "retainer",
    summary:
      "Embedded design partner for Code & Co.'s next product surfaces (Target Portal, AI KPI tracking): flows to working interfaces without being managed. Pitched retainer-first, with a one-week sprint as the alternative.",
    deliverables: [
      "Weekly retainer: 2 days per week, priorities set weekly with Kelly",
      "Full-week sprint: one project, five days, working first version + plan",
    ],
    budget:
      "EUR 950 per day (1,900 per week, invoiced monthly) or EUR 5,200 for a one-week sprint",
    startDate: "Retainer from 9 September 2026; sprint slot 14–18 September 2026",
  },

  // Proposal is call-first (no accept button): the intro call at
  // cal.com/guil-is is the next step, then paperwork.
  password: "duediligence",

  notes: [
    "Proposal live at /for/code-and-co since 2026-08-31 (last copy edit 1 Sep).",
    "German freelance business invoices; tax mode depends on where Code & Co. is established — collect the legal entity before the agreement.",
  ],
};
