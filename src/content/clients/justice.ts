/**
 * Data for the private client page at /for/justice.
 *
 * Update `hoursLog` after each bi-weekly invoice cycle:
 * prepend a new period block at the top of the array so the most
 * recent period renders first on the page.
 */

export type HoursItem = {
  project: string;
  description: string;
  hours: number;
};

export type Expense = {
  project: string;
  description: string;
  /** Cost in USD, billed at-cost per the SOW. */
  amountUsd: number;
};

export type Invoice = {
  /** Optional human identifier shown in the UI (e.g. "INV-001"). */
  number?: string;
  /** ISO date the invoice was sent. */
  issuedAt: string;
  /** ISO date payment was received. Undefined = outstanding. */
  paidAt?: string;
};

export type HoursPeriod = {
  /** Display label, e.g. "Apr 6 – 17, 2026". */
  label: string;
  /** ISO date for the Monday of the first week (used for sorting). */
  weekStart: string;
  /** Number of weeks the period covers. Defaults to 2 (bi-weekly). */
  weeks?: number;
  items: HoursItem[];
  /** Pass-through expenses billed at cost (fonts, plugins, stock, etc.). */
  expenses?: Expense[];
  /** ISO date the period was last edited. Bump on every change so the
   * "Updated" line on the dashboard reflects real activity. */
  lastUpdated?: string;
  /** Optional one-line context shown alongside the period. */
  note?: string;
  /** Invoice metadata. Omit while a period is still in progress. */
  invoice?: Invoice;
};

export type SowSection = {
  heading: string;
  /** Paragraphs and/or bullet lists, rendered in order. */
  blocks: Array<
    | { type: "p"; text: string }
    | { type: "ul"; items: string[] }
    | { type: "kv"; rows: Array<[string, string]> }
  >;
};

/**
 * Generic shape for a signable document — used by both the SOW and the
 * Manfred Amendment. Keeps the signature flow / hash / PDF generic so
 * adding a new amendment is data-only.
 */
export type SignableDocument = {
  /** Display title shown above the doc. Defaults to "Statement of Work". */
  title?: string;
  /** Bump this when the doc content changes substantively. Previous
   * signatures remain valid records of what was signed then, but the
   * new version requires a fresh signature. */
  version: string;
  preamble: string;
  effectiveDate: string;
  sections: SowSection[];
  signatories: Array<[string, string]>;
  /** Wording of each checkbox the signer must tick. These exact
   * strings are stored on the signature record. */
  acknowledgments: string[];
  /** Optional plain-English summary card shown above the legal text. */
  tldr?: string[];
  /** Optional plain-English breakdown table — section name → one-line summary. */
  breakdown?: Array<{ section: string; summary: string }>;
  /** Optional footer note (e.g. "no attorney reviewed this"). */
  noteOnApproach?: string;
};

export type JusticeClient = {
  clientName: string;
  password: string;
  engagement: {
    startDate: string;
    rateUsd: number;
    weeklyHoursMin: number;
    weeklyHoursMax: number;
  };
  hoursLog: HoursPeriod[];
  sow: SignableDocument;
  /** Optional supplementary documents keyed by stable slug. The key
   * doubles as the `documentKey` passed to the signature API. */
  amendments?: Record<string, SignableDocument>;
};

export const justice: JusticeClient = {
  clientName: "Justice Conder",
  password: "lobster",

  engagement: {
    startDate: "March 26, 2026",
    rateUsd: 120,
    weeklyHoursMin: 5,
    weeklyHoursMax: 10,
  },

  // Most recent period first. Add new periods at the top.
  hoursLog: [
    {
      label: "Apr 20 – May 1, 2026",
      weekStart: "2026-04-20",
      weeks: 2,
      lastUpdated: "2026-04-30",
      items: [
        { project: "Clawbank", description: "Blog page", hours: 1.67 },
        {
          project: "Clawbank",
          description: "Design system upgrade (Claude Design)",
          hours: 1,
        },
        { project: "Clawbank", description: "CLI teaser video", hours: 3 },
        { project: "Clawbank", description: "Social media assets", hours: 1.67 },
        {
          project: "Clawbank",
          description: "Visual assets — Manfred (AI agent)",
          hours: 2.33,
        },
        {
          project: "Clawbank",
          description: "Quote headliner (audiogram)",
          hours: 1.1,
        },
        {
          project: "Clawbank",
          description: "Manfred launch video (incl. captioned version)",
          hours: 9.33,
        },
        { project: "Clawbank", description: "Formation video", hours: 3 },
        { project: "Clawbank", description: "Meetings & syncs", hours: 2.5 },
        {
          project: "Clawbank",
          description: "Documentation (IP contract amendment)",
          hours: 0.25,
        },
        { project: "Clawbank", description: "Research", hours: 0.15 },
      ],
      expenses: [
        {
          project: "Clawbank",
          description:
            "Signal plugin for After Effects (one-time license fee)",
          amountUsd: 39.99,
        },
        {
          project: "Clawbank",
          description: "Twitch plugin by VideoCopilot for After Effects",
          amountUsd: 45,
        },
      ],
      invoice: {
        number: "INV-26006",
        issuedAt: "2026-04-30",
        paidAt: "2026-04-30",
      },
    },
    {
      label: "Apr 6 – 17, 2026",
      weekStart: "2026-04-06",
      weeks: 2,
      items: [
        {
          project: "Clawbank",
          description:
            "Marketing assets — Twitter header, profile picture, X status update header",
          hours: 2,
        },
        { project: "Clawbank", description: "Design explorations", hours: 1 },
        { project: "Clawbank", description: "Launch / promo video", hours: 7 },
        { project: "Clawbank", description: "Blog page design", hours: 3 },
        { project: "Clawbank", description: "Audiogram asset + template", hours: 2 },
      ],
      invoice: {
        number: "INV-26005",
        issuedAt: "2026-04-18",
        paidAt: "2026-04-20",
      },
    },
    {
      label: "Mar 23 – Apr 3, 2026",
      weekStart: "2026-03-23",
      weeks: 2,
      note: "Two-week kickoff — hours ballparked per task rather than tracked in real time.",
      items: [
        { project: "Clawbank", description: "Discovery", hours: 1 },
        { project: "Clawbank", description: "Branding direction", hours: 3 },
        { project: "Clawbank", description: "Logo design", hours: 3 },
        { project: "Clawbank", description: "Website design", hours: 3 },
      ],
      invoice: {
        number: "INV-26004",
        issuedAt: "2026-04-03",
        paidAt: "2026-04-04",
      },
    },
  ],

  sow: {
    version: "v1-2026-03-26",
    preamble:
      "This document confirms the working agreement between Guilherme Maueler (designer) and Justice Conder (client).",
    effectiveDate: "March 26, 2026",
    acknowledgments: [
      "I have read and agree to the terms of this Statement of Work, and I consent to sign it electronically. My full name, email, and this confirmation together constitute my legal signature under the ESIGN Act and equivalent electronic signature laws.",
    ],
    sections: [
      {
        heading: "Scope of Work",
        blocks: [
          {
            type: "p",
            text: "Guil provides creative direction and design services for Justice on an ongoing basis, across any projects Justice brings to the engagement. Projects may be added, paused, or reprioritized week to week by mutual agreement.",
          },
          {
            type: "p",
            text: "Specific priorities are set by Justice at the end of each week for the week ahead.",
          },
        ],
      },
      {
        heading: "Rate and Hours",
        blocks: [
          {
            type: "kv",
            rows: [
              ["Hourly rate", "$120 USD"],
              ["Weekly allocation", "5–10 hours ($600–1,200 / week cap)"],
            ],
          },
          {
            type: "ul",
            items: [
              "Justice is only billed for hours actually worked.",
              "If a week runs light, the cap does not roll over.",
              "If scope requires more than the cap in a given week, Guil flags it before going over.",
            ],
          },
        ],
      },
      {
        heading: "Billing",
        blocks: [
          {
            type: "ul",
            items: [
              "Guil logs hours weekly and shares a brief summary with each invoice.",
              "Invoices are issued weekly or bi-weekly, as agreed.",
              "Payment due within 7 days of invoice.",
              "Any project expenses (fonts, stock assets, tools, etc.) are billed at cost and approved by Justice in advance.",
            ],
          },
        ],
      },
      {
        heading: "Working Rhythm",
        blocks: [
          {
            type: "ul",
            items: [
              "Weekly sync at end of week (counts toward hours).",
              "Async delivery in between.",
              "Guil requests priorities a few days in advance to block focused work time.",
            ],
          },
        ],
      },
      {
        heading: "Start Date",
        blocks: [
          {
            type: "p",
            text: "This engagement begins March 26, 2026. Work done prior to this date is not billed.",
          },
        ],
      },
      {
        heading: "General Terms",
        blocks: [
          {
            type: "ul",
            items: [
              "Either party can pause or end the engagement with one week's notice.",
              "Work created under this agreement is owned by the client upon full payment.",
              "Guil may reference this work in his portfolio unless asked otherwise.",
            ],
          },
        ],
      },
      {
        heading: "Agreement",
        blocks: [
          {
            type: "p",
            text: "By acknowledging this document (a reply, a comment, or a message confirming you've read it), both parties confirm they understand and agree to the above terms.",
          },
        ],
      },
    ],
    signatories: [
      ["Designer", "Guilherme Maueler"],
      ["Client", "Justice Conder"],
      ["Effective date", "March 26, 2026"],
    ],
  },

  amendments: {
    "manfred-amendment": {
      title: "Manfred Project — Contractor Amendment",
      version: "manfred-amendment-v1-2026-04-30",
      preamble:
        "This Amendment supplements and modifies the Contractor Services Agreement between the parties dated March 26, 2026. To the extent any terms in this Amendment conflict with the original, this Amendment controls.",
      effectiveDate: "Upon signature by both parties (drafted April 30, 2026)",
      tldr: [
        "The Manfred work uses third-party references (Max Headroom imagery, Matt Frewer's voice, Accelerando) under ClawBank's creative direction. ClawBank assumes the IP and right-of-publicity risk that comes with that direction.",
        "If a third party sues over the Manfred work, ClawBank covers defence and any judgement — not Guil. Justice personally guarantees this so it holds even if the LLCs run dry.",
        "ClawBank owns and publishes the Manfred / Aineko IP. Guil keeps the right to show the production work in his portfolio.",
        "If Guil receives a legal notice or takedown, he flags it within 5 business days and Justice takes over the response.",
      ],
      breakdown: [
        {
          section: "1. Acknowledgment of IP Context",
          summary:
            "Names which third-party references the Work involves (Max Headroom, Frewer's voice, Accelerando) and confirms ClawBank directed their use.",
        },
        {
          section: "2. Indemnification",
          summary:
            "If a third party sues, ClawBank pays everything — defence, settlement, judgement.",
        },
        {
          section: "3. Limit on Guil's Liability",
          summary:
            "Guil's exposure is capped at fees received in the last 12 months. No unlimited downside.",
        },
        {
          section: "4. Ownership and Publication",
          summary:
            "Once paid, ClawBank owns everything. ClawBank publishes first and is the named originator. Guil keeps portfolio rights.",
        },
        {
          section: "5. Notice of Claims",
          summary:
            "Process for handling any legal notice. Guil tells Justice fast; Justice takes over.",
        },
        {
          section: "6. Reps and Warranties",
          summary:
            "ClawBank confirms it has authority to direct this work and accepts the risk. Includes Justice's personal guarantee.",
        },
        {
          section: "7. Insurance",
          summary:
            "ClawBank maintains media liability insurance. Negotiable for pre-revenue companies.",
        },
        {
          section: "8. Governing Law / Survival",
          summary:
            "Where lawsuits go (Berlin, Germany), and confirmation that protections last forever.",
        },
        {
          section: "9. Entire Understanding",
          summary: "Standard 'this is the deal' boilerplate.",
        },
      ],
      noteOnApproach:
        "This amendment was drafted from generic best-practice templates and the specific risk profile of the Manfred project. It has not been reviewed by an attorney. Both parties acknowledge they are signing it without legal counsel and accept the document as-is. If/when budget allows for legal review, either party may propose modifications, but the protections herein remain in force in the meantime.",
      sections: [
        {
          heading:
            "§1. Acknowledgment of Project Nature and IP Context",
          blocks: [
            {
              type: "p",
              text: "The parties acknowledge that Contractor's services include the production of creative video content, brand assets, and supporting materials for the 'Manfred' character and related ClawBank marketing campaigns. The parties further acknowledge that this work involves, by Client's specific creative direction:",
            },
            {
              type: "ul",
              items: [
                "Visual reference to and stylistic derivation from 'Max Headroom,' a fictional character whose intellectual property rights are held by third parties;",
                "AI-generated synthetic voice cloning derived from publicly available recordings of the actor Matt Frewer in the role of Max Headroom;",
                "Reference to characters and concepts from the novel Accelerando by Charles Stross;",
                "Use of broadcast footage, imagery, and audio from the Max Headroom television series and related media as source material for derivative compositing.",
              ],
            },
            {
              type: "p",
              text: "Client represents that this creative direction has been independently determined by Client, that Client has evaluated or elected not to obtain third-party rights clearances, and that Client accepts all intellectual property and right-of-publicity risk arising from this direction.",
            },
          ],
        },
        {
          heading: "§2. Indemnification",
          blocks: [
            {
              type: "p",
              text: "Client shall defend, indemnify, and hold harmless Contractor (and his agents, heirs, and assigns) from and against any and all third-party claims, demands, lawsuits, regulatory actions, settlements, judgments, damages, fines, penalties, costs, and reasonable attorneys' fees arising out of or related to:",
            },
            {
              type: "ul",
              items: [
                "Any claim of copyright infringement, trademark infringement, or unfair competition relating to the Manfred character, Max Headroom imagery, the Accelerando references, or any other third-party intellectual property used in or referenced by the Work;",
                "Any claim of violation of the right of publicity, right of privacy, or related personal rights of Matt Frewer or any other individual whose voice, likeness, or persona is referenced or replicated in the Work, including under California Civil Code §3344, New York Civil Rights Law §§50-51, the Tennessee ELVIS Act, or any analogous statute or common-law right in any jurisdiction;",
                "Any claim arising from violation of the terms of service of any third-party AI service used at Client's direction, including but not limited to ElevenLabs, Flora, Kling, or similar tools;",
                "Any defamation, false light, or misrepresentation claim arising from the content of the Work as scripted or directed by Client;",
                "Any regulatory action under securities, advertising, or consumer-protection laws relating to the marketing of ClawBank, the $CLWB token, or the Manfred character;",
                "Any claim by Manfred LLC, Aineko LLC, or any other entity affiliated with Client or formed in connection with the Project.",
              ],
            },
            {
              type: "p",
              text: "This indemnity applies whether the claim is based on alleged negligent, knowing, willful, or strict-liability conduct by Client, and shall not be diminished or excluded on the basis that Client knew or should have known of the alleged infringement at the time the Work was directed. Client expressly waives any defense or carveout based on willfulness.",
            },
            {
              type: "p",
              text: "Client shall assume control of the defense of any covered claim with counsel reasonably acceptable to Contractor; Contractor may participate in the defense at his own expense and shall not unreasonably withhold cooperation. Client shall not settle any claim in a manner that imposes obligations on Contractor or admits Contractor's liability or wrongdoing without Contractor's prior written consent.",
            },
          ],
        },
        {
          heading: "§3. Limitation of Contractor's Liability",
          blocks: [
            {
              type: "p",
              text: "In no event shall Contractor's aggregate liability to Client under this Agreement, the original Agreement, or in connection with the Work exceed the total fees actually paid to Contractor by Client during the twelve (12) months preceding the claim. Contractor shall not be liable for indirect, consequential, incidental, special, exemplary, or punitive damages of any kind, including lost profits, lost revenue, lost goodwill, or business interruption, regardless of legal theory.",
            },
            {
              type: "p",
              text: "This limitation does not apply to liability for Contractor's gross negligence or willful misconduct, but does apply to all other claims, including those based in contract, tort, statute, or otherwise.",
            },
          ],
        },
        {
          heading: "§4. Ownership and Publication",
          blocks: [
            {
              type: "p",
              text: "(a) Ownership. Upon Contractor's receipt of full payment for each deliverable, all right, title, and interest in such deliverable — including all intellectual property rights — shall vest in Client. Contractor shall execute any documents reasonably required to perfect this transfer.",
            },
            {
              type: "p",
              text: "(b) Client as Originator and Publisher. Client shall be the sole party to publish, distribute, broadcast, post, or otherwise make the Work publicly available. All publications shall name Client (or its designated entity, including Manfred LLC or Aineko LLC) as the originator. Contractor shall not be required to publish, distribute, or host the Work on Contractor's personal channels, and Client shall not represent Contractor as the originator of the Manfred character or related intellectual property.",
            },
            {
              type: "p",
              text: "(c) Portfolio Rights. Notwithstanding the foregoing, Contractor retains a perpetual, royalty-free right to display the Work in his professional portfolio, on his personal website, in client-facing presentations, and on professional networking platforms, for the purpose of demonstrating his services. Contractor shall describe the Work as a contracted production for Client and not as Contractor's authorship of the underlying character or intellectual property.",
            },
          ],
        },
        {
          heading: "§5. Notice of Claims",
          blocks: [
            {
              type: "p",
              text: "If Contractor receives any cease-and-desist letter, takedown notice (DMCA or otherwise), legal complaint, subpoena, regulatory inquiry, or threat of legal action relating to the Work, Contractor shall provide written notice to Client within five (5) business days of receipt. Client shall thereafter assume control of the response in accordance with Section 2 above.",
            },
            {
              type: "p",
              text: "If any third-party platform (including ElevenLabs, YouTube, Twitter/X, TikTok, or similar) takes adverse action against any account, model, or asset created by Contractor in connection with the Work, Client shall reimburse Contractor for any reasonable costs of remediation, including the cost of replacing affected service accounts or assets.",
            },
          ],
        },
        {
          heading: "§6. Representations and Warranties",
          blocks: [
            {
              type: "p",
              text: "(a) Client represents and warrants that it has the full right and authority to direct the production of the Work as specified, that it has consulted (or knowingly elected not to consult) qualified legal counsel regarding the IP and right-of-publicity considerations described in Section 1, and that Contractor's reliance on Client's creative direction is reasonable.",
            },
            {
              type: "p",
              text: "(b) Client further represents that any entity formed in connection with the Project (including Manfred LLC and Aineko LLC) is and shall be solvent and capable of meeting the indemnification obligations under this Agreement, and Client (in its individual or principal capacity) personally guarantees the indemnification obligations under Section 2.",
            },
            {
              type: "p",
              text: "(c) Contractor represents and warrants that he will perform the services in a professional manner consistent with industry standards. Contractor makes no representation or warranty regarding the legality, IP-cleanliness, or non-infringement of the Work, the underlying creative direction having been provided by Client.",
            },
          ],
        },
        {
          heading: "§7. Insurance",
          blocks: [
            {
              type: "p",
              text: "Client shall maintain, throughout the term of this Agreement and for a period of three (3) years thereafter, media liability and/or errors-and-omissions insurance with coverage of not less than $1,000,000 per claim, naming Contractor as an additional insured for matters arising from the Work. Upon request, Client shall provide Contractor with a certificate of insurance evidencing such coverage. Where insurance is not commercially obtainable for an entity of Client's stage, Client's indemnification obligations under §2 remain in force and are backed by the personal guarantee in §6(b).",
            },
          ],
        },
        {
          heading: "§8. Governing Law; Jurisdiction; Survival",
          blocks: [
            {
              type: "p",
              text: "(a) Governing Law. This Amendment shall be governed by the laws of the Federal Republic of Germany.",
            },
            {
              type: "p",
              text: "(b) Jurisdiction. Any dispute between the parties shall be resolved in the courts located in Berlin, Germany. Notwithstanding, Client's indemnification obligations apply to claims brought against Contractor in any jurisdiction worldwide.",
            },
            {
              type: "p",
              text: "(c) Survival. Sections 1, 2, 3, 4(b), 4(c), 5, 6, and 7 shall survive termination of this Amendment and the underlying Agreement indefinitely, and shall be binding on Client's successors, assigns, and any entity to which the Manfred or Aineko intellectual property is transferred.",
            },
          ],
        },
        {
          heading: "§9. Entire Understanding",
          blocks: [
            {
              type: "p",
              text: "This Amendment, together with the original Contractor Services Agreement, constitutes the entire agreement between the parties with respect to the subject matter, and supersedes any prior oral or written understandings.",
            },
          ],
        },
      ],
      signatories: [
        ["Client (Entity)", "Fraction Software LLC, by Justice Conder"],
        ["Personal Guarantor (per §6(b))", "Justice Conder, individually"],
        ["Contractor", "Guilherme Maueler"],
      ],
      acknowledgments: [
        "I sign this Amendment in my capacity as authorised signer for Fraction Software LLC.",
        "I sign this Amendment in my personal capacity as personal guarantor pursuant to §6(b).",
        "I have read and agree to the terms of this Amendment, and I consent to sign it electronically. My full name, email, and this confirmation together constitute my legal signature under the ESIGN Act and equivalent electronic signature laws.",
      ],
    },
  },
};

// -------- Derived helpers --------

export const DEFAULT_PERIOD_WEEKS = 2;

export function periodWeeks(p: HoursPeriod): number {
  return p.weeks ?? DEFAULT_PERIOD_WEEKS;
}

export function periodTotal(p: HoursPeriod): number {
  return p.items.reduce((sum, i) => sum + i.hours, 0);
}

export function periodExpenses(p: HoursPeriod): number {
  return (p.expenses ?? []).reduce((sum, e) => sum + e.amountUsd, 0);
}

export function totalHours(periods: HoursPeriod[]): number {
  return periods.reduce((sum, p) => sum + periodTotal(p), 0);
}

export function periodAmount(p: HoursPeriod, rate: number): number {
  return periodTotal(p) * rate + periodExpenses(p);
}

export function totalEarned(periods: HoursPeriod[], rate: number): number {
  return periods.reduce((sum, p) => sum + periodAmount(p, rate), 0);
}

export function totalPaid(periods: HoursPeriod[], rate: number): number {
  return periods
    .filter((p) => p.invoice?.paidAt)
    .reduce((sum, p) => sum + periodAmount(p, rate), 0);
}

export function totalOutstanding(periods: HoursPeriod[], rate: number): number {
  return totalEarned(periods, rate) - totalPaid(periods, rate);
}

/** If every item in a period shares one project, return that name. */
export function singleProject(p: HoursPeriod): string | null {
  const first = p.items[0]?.project;
  if (!first) return null;
  return p.items.every((i) => i.project === first) ? first : null;
}

export type PaceStatus = {
  state: "on" | "over" | "under";
  /** Hours over (positive) or under (negative) the nearest bound. */
  delta: number;
  /** Lower bound of expected hours for this period. */
  min: number;
  /** Upper bound of expected hours for this period. */
  max: number;
};

export function paceStatus(
  p: HoursPeriod,
  engagement: JusticeClient["engagement"],
): PaceStatus {
  const weeks = periodWeeks(p);
  const min = engagement.weeklyHoursMin * weeks;
  const max = engagement.weeklyHoursMax * weeks;
  const total = periodTotal(p);
  if (total > max) return { state: "over", delta: total - max, min, max };
  if (total < min) return { state: "under", delta: total - min, min, max };
  return { state: "on", delta: 0, min, max };
}

export type InvoiceStatus =
  | { kind: "pending" }
  | { kind: "issued"; issuedAt: string; number?: string }
  | { kind: "paid"; issuedAt: string; paidAt: string; number?: string };

export function invoiceStatus(p: HoursPeriod): InvoiceStatus {
  if (!p.invoice) return { kind: "pending" };
  if (p.invoice.paidAt) {
    return {
      kind: "paid",
      issuedAt: p.invoice.issuedAt,
      paidAt: p.invoice.paidAt,
      number: p.invoice.number,
    };
  }
  return {
    kind: "issued",
    issuedAt: p.invoice.issuedAt,
    number: p.invoice.number,
  };
}

/** Most recently paid invoice across all periods, if any. */
export function lastPaidInvoice(
  periods: HoursPeriod[],
): { number?: string; paidAt: string } | null {
  const paid = periods
    .map((p) => p.invoice)
    .filter(
      (inv): inv is Invoice & { paidAt: string } =>
        !!inv && !!inv.paidAt,
    )
    .sort((a, b) => b.paidAt.localeCompare(a.paidAt));
  return paid[0] ?? null;
}

/** Most recent activity across all periods — looks at invoice events
 * (issued/paid) AND any explicit `lastUpdated` field. Drives the
 * "Updated …" line on the dashboard. */
export function lastInvoiceActivity(periods: HoursPeriod[]): string | null {
  const dates: string[] = [];
  for (const p of periods) {
    if (p.invoice?.issuedAt) dates.push(p.invoice.issuedAt);
    if (p.invoice?.paidAt) dates.push(p.invoice.paidAt);
    if (p.lastUpdated) dates.push(p.lastUpdated);
  }
  if (dates.length === 0) return null;
  dates.sort((a, b) => b.localeCompare(a));
  return dates[0]!;
}
