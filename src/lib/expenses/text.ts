/**
 * Small text helpers shared by the parser, rules, and memory.
 */

/** Lowercase, strip diacritics, collapse whitespace. */
export function fold(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

/** Header name → simplified key ("Amount (EUR)" → "amount eur"). */
export function headerKey(s: string): string {
  return fold(s)
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/** Tokens the memory key ignores — legal suffixes, locations, noise. */
const NOISE = new Set([
  "gmbh",
  "ug",
  "ag",
  "kg",
  "ohg",
  "inc",
  "ltd",
  "llc",
  "co",
  "corp",
  "sa",
  "sl",
  "srl",
  "sarl",
  "bv",
  "oy",
  "ab",
  "plc",
  "limited",
  "the",
  "de",
  "com",
  "net",
  "io",
  "www",
  "berlin",
  "hamburg",
  "muenchen",
  "munchen",
  "koeln",
  "koln",
  "deutschland",
  "germany",
  "europe",
  "eu",
  "emea",
  "international",
  "online",
  "shop",
  "store",
  "payment",
  "payments",
  "pay",
  "sumup",
  "zettle",
]);

/**
 * Merchant memory key: the first two meaningful words of the partner
 * name. "REWE Berlin Friedrichshain" → "rewe friedrichshain",
 * "Google *Notion" → "google notion", "Adobe Systems Software" → "adobe
 * systems". Two words so Google Play / PayPal pass-through billing
 * doesn't collapse into one key.
 */
export function merchantKey(partner: string): string {
  const tokens = fold(partner)
    .replace(/[^a-z0-9]+/g, " ")
    .split(" ")
    .filter((t) => t.length > 1 && !NOISE.has(t) && !/^\d+$/.test(t));
  if (tokens.length === 0) return fold(partner) || "unknown";
  return tokens.slice(0, 2).join(" ");
}

/** djb2-style 32-bit hash, hex. Good enough for stable row ids. */
export function hash32(input: string): string {
  let h = 5381;
  for (let i = 0; i < input.length; i++) {
    h = ((h << 5) + h + input.charCodeAt(i)) | 0;
  }
  return (h >>> 0).toString(16).padStart(8, "0");
}

/** Two independent hashes so file keys don't collide on similar exports. */
export function contentKey(text: string): string {
  let a = 2166136261;
  for (let i = 0; i < text.length; i++) {
    a ^= text.charCodeAt(i);
    a = Math.imul(a, 16777619);
  }
  return `${hash32(text)}${(a >>> 0).toString(16).padStart(8, "0")}-${text.length}`;
}

/** "-1.234,56", "-1,234.56", "-1234.56", "−12,00 €" → -1234.56 */
export function parseAmount(raw: string): number | null {
  let s = raw
    .replace(/−/g, "-")
    .replace(/[€$£\s]/g, "")
    .replace(/EUR|USD|GBP/gi, "")
    .trim();
  if (s === "") return null;
  let negative = false;
  if (s.startsWith("-")) {
    negative = true;
    s = s.slice(1);
  } else if (s.endsWith("-")) {
    negative = true;
    s = s.slice(0, -1);
  } else if (s.startsWith("+")) {
    s = s.slice(1);
  }
  const lastComma = s.lastIndexOf(",");
  const lastDot = s.lastIndexOf(".");
  if (lastComma >= 0 && lastDot >= 0) {
    // Both present: the later one is the decimal separator.
    if (lastComma > lastDot) s = s.replace(/\./g, "").replace(",", ".");
    else s = s.replace(/,/g, "");
  } else if (lastComma >= 0) {
    const decimals = s.length - lastComma - 1;
    s = decimals === 3 && s.split(",").length === 2 && !/^\d{1,3},\d{3}$/.test(s)
      ? s.replace(/,/g, "")
      : decimals <= 2
        ? s.replace(",", ".")
        : s.replace(/,/g, "");
  } else if (lastDot >= 0) {
    const decimals = s.length - lastDot - 1;
    if (decimals === 3 && s.split(".").length > 2) s = s.replace(/\./g, "");
  }
  if (!/^\d+(\.\d+)?$/.test(s)) return null;
  const n = Number(s);
  if (!Number.isFinite(n)) return null;
  return negative ? -n : n;
}

/** ISO, dd.mm.yyyy, dd/mm/yyyy, mm/dd/yyyy (only when unambiguous). */
export function parseDate(raw: string): string | null {
  const s = raw.trim();
  let m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return `${m[1]}-${m[2]}-${m[3]}`;
  m = s.match(/^(\d{1,2})[./](\d{1,2})[./](\d{4})$/);
  if (m) {
    let d = Number(m[1]);
    let mo = Number(m[2]);
    if (mo > 12 && d <= 12) [d, mo] = [mo, d];
    if (mo < 1 || mo > 12 || d < 1 || d > 31) return null;
    return `${m[3]}-${String(mo).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  }
  m = s.match(/^(\d{1,2})[./](\d{1,2})[./](\d{2})$/);
  if (m) {
    const d = Number(m[1]);
    const mo = Number(m[2]);
    if (mo < 1 || mo > 12 || d < 1 || d > 31) return null;
    return `20${m[3]}-${String(mo).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  }
  return null;
}

export const DATE_RE = /\b(\d{4}-\d{2}-\d{2}|\d{1,2}[./]\d{1,2}[./]\d{2,4})\b/;
export const AMOUNT_RE =
  /(?:^|\s)([-+−]?\s?(?:€\s?)?\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})\s?(?:€|EUR)?)(?=\s|$)/;
