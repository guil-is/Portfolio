/**
 * Decides, one transaction at a time, whether an outgoing payment looks
 * like a business expense. Order of authority:
 *
 *   1. Internal moves (N26 Spaces, transfers to yourself) → skip.
 *   2. What you taught it (merchant memory from earlier swipes).
 *   3. The rule table (rules.ts), first match wins. Pass-through billers
 *      (PayPal, Google, Apple, Stripe) defer to the merchant named in
 *      the payment reference when one is recognized.
 *   4. Fallbacks from how the money moved: cash → personal, a transfer
 *      with an invoice number → probably business, everything else →
 *      ask.
 */

import { RULES, type Rule } from "./rules";
import { fold, merchantKey } from "./text";
import type {
  Classification,
  MerchantMemory,
  Transaction,
} from "./types";

const COMPANY_RE =
  /\b(gmbh|ug|ag|kg|ohg|inc|ltd|llc|corp|co|sa|sl|srl|sarl|bv|oy|ab|plc|limited|e ?k|e ?v|studio|studios|agency|agentur|design|media|digital|solutions|services|group|verlag|kollektiv|collective|partners|consulting|labs?|technologies|software|systems)\b/;

const INVOICE_RE =
  /\b(rechnung|rechnungsnr|rechnungsnummer|invoice|inv|re|rg|rn|honorar|fee|beleg|auftrag|order)\b[\s.:#/-]*(nr|no|nummer|number)?[\s.:#/-]*\d|\b(rechnung|invoice|honorar)\b/;

export function looksLikeCompany(partner: string): boolean {
  return COMPANY_RE.test(fold(partner).replace(/[.&]/g, " "));
}

/** Two or three alphabetic words and no company marker → probably a person. */
export function looksLikePerson(partner: string): boolean {
  const tokens = fold(partner)
    .replace(/[^a-z\s'-]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
  return (
    tokens.length >= 2 &&
    tokens.length <= 4 &&
    !looksLikeCompany(partner) &&
    tokens.every((t) => t.length >= 2)
  );
}

function firstMatch(
  partnerText: string,
  anyText: string,
  skipPassthrough: boolean,
): Rule | null {
  for (const rule of RULES) {
    if (skipPassthrough && rule.passthrough) continue;
    const text = rule.scope === "any" ? anyText : partnerText;
    if (rule.match.test(text)) return rule;
  }
  return null;
}

function fromRule(rule: Rule, confidence = rule.confidence, reason = rule.reason): Classification {
  return {
    verdict: rule.verdict,
    category: rule.category,
    confidence,
    reason,
    ruleId: rule.id,
  };
}

/**
 * Pass-through billers (Apple, Google Play, PayPal, Klarna) hide the real
 * merchant, but a subscription recurs at a fixed price — so for them the
 * memory key includes the amount: "apple com@9.99" is one app, "apple
 * com@5.49" another. Everything else keys on the merchant alone.
 */
export function isPassthrough(partner: string): boolean {
  const text = fold(partner);
  return RULES.some((r) => r.passthrough && r.scope !== "any" && r.match.test(text));
}

export function itemKey(tx: Transaction): string {
  const key = merchantKey(tx.partner);
  return isPassthrough(tx.partner) ? `${key}@${Math.abs(tx.amount).toFixed(2)}` : key;
}

export function classify(
  tx: Transaction,
  memory: Record<string, MerchantMemory> = {},
): Classification {
  if (tx.kind === "internal") {
    return {
      verdict: "skip",
      category: "internal",
      confidence: 1,
      reason: "Move between your own accounts",
      ruleId: "kind-internal",
    };
  }

  const remembered = memory[itemKey(tx)];
  if (remembered) {
    return {
      verdict: remembered.verdict,
      category: remembered.category,
      confidence: 1,
      reason: `You decided this for “${remembered.label}” before`,
      ruleId: "memory",
    };
  }

  const partnerText = fold(tx.partner);
  const anyText = fold(`${tx.partner} ${tx.reference}`);
  const rule = firstMatch(partnerText, anyText, false);
  if (rule) {
    if (rule.passthrough) {
      // "PayPal · ADOBE SYSTEMS" — trust the merchant in the reference.
      const inner = firstMatch(anyText, anyText, true);
      if (inner && inner.id !== rule.id && inner.confidence >= 0.8) {
        return fromRule(
          inner,
          Math.min(inner.confidence, 0.95),
          `${inner.reason} (billed via ${tx.partner.split(/\s+/)[0]})`,
        );
      }
    }
    return fromRule(rule);
  }

  // No merchant rule — reason from how the money moved.
  if (tx.kind === "atm") {
    return {
      verdict: "personal",
      category: "personal",
      confidence: 0.9,
      reason: "Cash withdrawal — only receipts count, add those by hand",
      ruleId: "kind-atm",
    };
  }
  if (tx.kind === "fee") {
    return {
      verdict: "unsure",
      category: "fees",
      confidence: 0.7,
      reason: "Bank fee — business if it's the business account",
      ruleId: "kind-fee",
    };
  }

  const hasInvoice = INVOICE_RE.test(fold(tx.reference));
  const company = looksLikeCompany(tx.partner);
  if (hasInvoice && company) {
    return {
      verdict: "unsure",
      category: "services",
      confidence: 0.75,
      reason: "Invoice from a company — probably business, confirm it",
      ruleId: "invoice-company",
    };
  }
  if (hasInvoice) {
    return {
      verdict: "unsure",
      category: "services",
      confidence: 0.65,
      reason: "Has an invoice reference — a freelancer you hired?",
      ruleId: "invoice-person",
    };
  }
  if (tx.kind === "transfer" && looksLikePerson(tx.partner)) {
    return {
      verdict: "unsure",
      category: "other",
      confidence: 0.4,
      reason: "Transfer to a person — a collaborator's invoice or splitting dinner?",
      ruleId: "transfer-person",
    };
  }
  if (tx.kind === "transfer") {
    return {
      verdict: "unsure",
      category: "other",
      confidence: 0.5,
      reason: "Transfer to a company — check the reference",
      ruleId: "transfer-company",
    };
  }
  if (tx.kind === "debit") {
    return {
      verdict: "unsure",
      category: "other",
      confidence: 0.5,
      reason: "Direct debit from a merchant the rules don't know",
      ruleId: "debit-unknown",
    };
  }
  return {
    verdict: "unsure",
    category: "other",
    confidence: 0.3,
    reason: "Merchant the rules don't know",
    ruleId: "unknown",
  };
}
