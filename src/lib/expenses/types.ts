/**
 * Shared types for the tax-expenses classifier (/for/expenses and
 * `npm run expenses`). Everything downstream — rules, swipe UI, export —
 * works on the normalized `Transaction` shape produced by parse.ts.
 */

/** What the classifier (or you) decided about an outgoing payment. */
export type Verdict =
  /** Deductible business expense — goes to the tax sheet. */
  | "business"
  /** Private spend — stays out. */
  | "personal"
  /** Not a business expense, but tax-relevant (Finanzamt, health
   * insurance, pension). Kept in a separate list for the tax advisor. */
  | "tax"
  /** Money moving between your own accounts, reversals — ignore. */
  | "skip"
  /** The rules can't tell. Goes to the swipe queue. */
  | "unsure";

/** Final verdicts a decision can carry (never "unsure"). */
export type DecidedVerdict = Exclude<Verdict, "unsure">;

export type Category =
  | "software"
  | "assets"
  | "hardware"
  | "production"
  | "office"
  | "telecom"
  | "travel"
  | "meals"
  | "education"
  | "web"
  | "marketing"
  | "fees"
  | "insurance"
  | "services"
  | "other"
  | "tax"
  | "health"
  | "personal"
  | "internal";

export const CATEGORY_LABELS: Record<Category, string> = {
  software: "Software & subscriptions",
  assets: "Fonts, plugins & stock",
  hardware: "Hardware & equipment",
  production: "Print & production",
  office: "Office & coworking",
  telecom: "Phone & internet",
  travel: "Travel & transport",
  meals: "Meals & hospitality",
  education: "Education & events",
  web: "Domains & hosting",
  marketing: "Marketing & ads",
  fees: "Bank & payment fees",
  insurance: "Insurance",
  services: "Professional services",
  other: "Other business",
  tax: "Tax payments",
  health: "Health & pension",
  personal: "Personal",
  internal: "Internal transfer",
};

/** Categories you can pick for a business expense, in menu order. */
export const BUSINESS_CATEGORIES: Category[] = [
  "software",
  "assets",
  "hardware",
  "production",
  "office",
  "telecom",
  "travel",
  "meals",
  "education",
  "web",
  "marketing",
  "fees",
  "insurance",
  "services",
  "other",
];

/** How the bank moved the money. Derived from the export's type column. */
export type TransactionKind =
  | "card"
  | "transfer"
  | "debit"
  | "atm"
  | "fee"
  | "internal"
  | "other";

export type Transaction = {
  /** Stable hash of date + partner + amount + reference (+ duplicate index). */
  id: string;
  /** ISO date, YYYY-MM-DD. */
  date: string;
  /** Merchant / payee as the bank printed it. */
  partner: string;
  /** Payment reference / Verwendungszweck. */
  reference: string;
  /** Raw type column ("Presentment", "MasterCard Payment", ...). */
  type: string;
  kind: TransactionKind;
  /** Negative for outgoing money. Always in the account currency (EUR). */
  amount: number;
  currency: string;
  originalAmount?: number;
  originalCurrency?: string;
  /** Every column as exported, for the "more info" view. */
  raw: Record<string, string>;
  source: "csv" | "pdf";
};

export type Classification = {
  verdict: Verdict;
  category: Category;
  /** 0..1 — at or above AUTO_THRESHOLD the verdict is applied without asking. */
  confidence: number;
  /** One line shown on the card: why the rules think so. */
  reason: string;
  ruleId?: string;
};

export type DecisionSource = "auto" | "you" | "memory";

export type Decision = {
  verdict: DecidedVerdict;
  category: Category;
  note?: string;
  by: DecisionSource;
  /** ISO timestamp of when you decided (absent for auto). */
  at?: string;
};

/** What you taught the tool about a merchant. Persists across files. */
export type MerchantMemory = {
  verdict: DecidedVerdict;
  category: Category;
  updatedAt: string;
  /** Display name of the first partner string that produced this key. */
  label: string;
};

export type ParseResult = {
  transactions: Transaction[];
  /** Detected layout — shown in the UI so a wrong guess is visible. */
  format: "n26-2024" | "n26-legacy" | "generic-csv" | "pdf";
  /** Rows with money coming in (ignored). */
  incomingCount: number;
  /** Rows that couldn't be read at all. */
  skippedRows: number;
  warnings: string[];
};

/** Confidence at or above which a rule verdict is applied automatically. */
export const AUTO_THRESHOLD = 0.85;
