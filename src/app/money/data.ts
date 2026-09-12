import type { DashboardProps } from "@/components/money/useDashboard";
import { incomeByMonth, incomeByYear, receivables } from "@/lib/income";
import { seedBooks, seedEntries, seedFacts } from "@/content/books/seed";
import { addedBookEntries } from "@/content/books/added";
import { subscriptions } from "@/content/books/subscriptions";

/**
 * Server-side data for both Financial Dashboard layouts. The ledger is
 * read on the server and only passed down once the gate's cookie is
 * present, so it never sits in a static payload.
 */

export const STORAGE_KEY = "for-expenses-unlocked";
export const PASSWORD = "beancounter";

export const noRobots = {
  index: false,
  follow: false,
  nocache: true,
  googleBot: { index: false, follow: false },
};

export function dashboardProps(unlocked: boolean): DashboardProps {
  return {
    income: unlocked ? incomeByYear() : [],
    incomeMonths: unlocked ? incomeByMonth() : [],
    receivables: unlocked ? receivables() : [],
    seed: unlocked ? [...Object.keys(seedBooks).flatMap((y) => seedEntries(Number(y))), ...addedBookEntries()] : [],
    facts: unlocked ? seedFacts : {},
    registry: unlocked ? subscriptions : [],
    ledgerLoaded: unlocked,
  };
}
