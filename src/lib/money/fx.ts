/**
 * The USD→EUR rate from the ECB, via Frankfurter (a public mirror of the
 * ECB reference rates, no key, no payload). Nothing of yours goes out:
 * the request carries no data, and the answer is one number. The rate
 * lands in the books settings like a typed one; "manual" switches the
 * refresh off again.
 */

export type FxQuote = { rate: number; date: string };

const URL = "https://api.frankfurter.dev/v1/latest?base=USD&symbols=EUR";

export async function fetchUsdEur(signal?: AbortSignal): Promise<FxQuote> {
  const res = await fetch(URL, { signal, cache: "no-store" });
  if (!res.ok) throw new Error(`ECB rate unavailable (${res.status})`);
  const json = (await res.json()) as { date?: string; rates?: { EUR?: number } };
  const rate = json.rates?.EUR;
  if (!rate || !Number.isFinite(rate)) throw new Error("ECB rate unavailable");
  return { rate: Math.round(rate * 10_000) / 10_000, date: json.date ?? new Date().toISOString().slice(0, 10) };
}
