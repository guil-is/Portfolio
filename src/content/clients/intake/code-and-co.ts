/**
 * Intake record for Code & Co. (codeandco.com) — a due diligence
 * consultancy serving private equity funds. Backfilled by the
 * 2026-09-08 client sweep (the proposal page shipped before an intake
 * file existed), then kept current from the Telegram thread. Kelly
 * Cheesman is the inside champion; Dan and Lucas are the C-level
 * decision-makers. Proposal live at /for/code-and-co.
 */

import type { ClientIntake } from "../intake";

export const codeAndCoIntake: ClientIntake = {
  slug: "code-and-co",
  name: "Code & Co.",
  source: "Existing relationship with Kelly Cheesman (Telegram)",
  contacts: [
    {
      name: "Kelly Cheesman",
      role: "Champion; would set weekly priorities on the retainer",
    },
    { name: "Dan", role: "C-level decision-maker; proposal is with him" },
    { name: "Lucas", role: "C-level decision-maker" },
  ],

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
    startDate:
      "Retainer available now; sprint week to be agreed on the intro call (proposal de-dated 9 Sep)",
  },

  // Proposal is call-first (no accept button): the intro call at
  // cal.com/guil-is is the next step, then paperwork.
  password: "duediligence",

  notes: [
    "Proposal live at /for/code-and-co since 2026-08-31 (last copy edit 1 Sep).",
    "German freelance business invoices; tax mode depends on where Code & Co. is established — collect the legal entity before the agreement.",
    "2026-09-07: Dan has not booked a call yet.",
    "2026-09-08: sent Kelly the booking link (guil.is/available) to pass to Dan.",
    "2026-09-09: decision slipping a few days — Dan and team traveling to London, then US. Dan has not opened the proposal page yet; Kelly has flagged it to him as very important.",
    "2026-09-09: strong fit signal from Kelly: staffing is a top concern, hired 3 analysts and a new ops lead last week, next step is sorting product capacity.",
    "Stance: prioritizing retainer-type work over one-offs, but not turning this down if it moves slowly.",
    "2026-09-09: proposal de-dated so nothing goes stale during their travel — retainer now 'Available now', sprint week 'agreed on the intro call', closer 'start within a week' (was 'on the 9th').",
  ],
};
