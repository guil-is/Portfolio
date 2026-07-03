/**
 * Static config for the invoice maker (`npm run invoice`).
 *
 * Everything on an invoice that isn't per-invoice data lives here: the
 * issuer block, payment profiles (bank/crypto details), and bill-to
 * presets for repeat clients. Edit freely — nothing in the site imports
 * this; it is only consumed by `scripts/make-invoice.ts`.
 *
 * ⚠️ Payment values below were transcribed from previously issued
 * invoices (INV-26012, INV-26013). Double-check the crypto address and
 * account numbers against your own records before first use.
 */

import type { BillTo, PaymentProfile } from "../../lib/invoice";

export const issuer = {
  name: "Guilherme Maueler",
  email: "guil@maueler.com",
  addressLines: ["Müggelstraße 15", "10247 Berlin", "Germany"],
  phone: "+49 176 76241374",
  vatId: "USt-IdNr DE308488034",
  /** Header avatar, relative to the repo root. Unset to omit.
   * Halftone version generated from guil_prof_2026_3.jpeg — replace the
   * file to change the invoice avatar. */
  logoPath: "public/invoice-avatar.png",
};

/**
 * Payment sections rendered at the bottom of the invoice. An invoice spec
 * picks profiles by key — typically `["n26-eur"]` for EU clients and
 * `["wise-usd-local", "wise-usd-intl", "crypto-usdc"]` for USD clients.
 */
export const paymentProfiles: Record<string, PaymentProfile> = {
  "n26-eur": {
    heading: "Payment details",
    rows: [
      ["Account holder", "Guilherme Maueler — N26 GmbH"],
      ["IBAN", "DE11 1001 1001 2626 9970 72"],
      ["BIC", "NTSBDEB1XXX"],
    ],
  },
  "wise-usd-local": {
    heading: "Local bank details",
    subheading:
      "Use these details to pay USD from bank accounts inside the US",
    rows: [
      ["Account holder", "Guilherme Maueler"],
      ["ACH and Wire routing number", "026073008"],
      ["Account number", "8310780394"],
      ["Account type", "Checking"],
      [
        "Bank name and address",
        "Community Federal Savings Bank\n89-16 Jamaica Ave\nWoodhaven NY 11421\nUnited States",
      ],
    ],
  },
  "wise-usd-intl": {
    heading: "International bank details",
    subheading:
      "Use these details to pay USD from bank accounts outside the US",
    rows: [
      ["Account holder", "Guilherme Maueler"],
      ["Routing number", "026073150"],
      ["Swift/BIC", "CMFGUS33"],
      ["Account number", "8310780394"],
      [
        "Bank name and address",
        "Community Federal Savings Bank\n89-16 Jamaica Ave\nWoodhaven NY 11421\nUnited States",
      ],
    ],
  },
  "crypto-usdc": {
    heading: "Pay with crypto",
    includeReference: false,
    rows: [
      // TODO: verify — transcribed from INV-26013's PDF, confirm against
      // your wallet before including on a live invoice.
      ["USDC on Ethereum Mainnet", "0x06B759c70c2136224D4cFA6C79de0a3c1F4D7131"],
    ],
  },
};

/** Bill-to presets for repeat clients, keyed by a short slug. */
export const billToPresets: Record<string, BillTo> = {
  justice: {
    name: "Justice Conder",
    lines: ["Fraction Software LLC"],
  },
  myosin: {
    name: "MYOSIN MANAGEMENT CONSULTANCY - FZCO",
    lines: [
      "IFZA Business Park, DDP",
      "001 - 86290 Makani - A1 - 3641379065 Dubai Silicon Oasis",
      "Dubai, United Arab Emirates",
    ],
  },
  tedxberlin: {
    name: "red onion GmbH",
    lines: [
      "Stephan Balzer",
      "TAX/VAT: DE812866010",
      "Ziegelstraße 16",
      "10117 Berlin",
    ],
  },
  // EU cross-border B2B: invoice net, reverse charge note, both VAT IDs
  // on the invoice.
  spa: {
    name: "Sustainable Public Affairs",
    lines: [
      "Lara Sibbing",
      "TAX/VAT: BE0642.953.216",
      "c/o Norrsken House Brussels",
      "Rue du Commerce 72",
      "Brussels, Belgium",
    ],
  },
};
