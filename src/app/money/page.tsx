import { cookies } from "next/headers";
import { PasswordGate } from "@/components/PasswordGate";
import { ThemeToggle } from "@/components/ThemeToggle";
import { MoneyDashboard } from "@/components/money/MoneyDashboard";
import { incomeByMonth, incomeByYear, receivables } from "@/lib/income";
import { seedBooks, seedEntries, seedFacts } from "@/content/books/seed";
import { addedBookEntries } from "@/content/books/added";
import { subscriptions } from "@/content/books/subscriptions";

export const metadata = {
  title: "Money | Private",
  description: "Private personal finance overview",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false },
  },
};

// Ledger data is read on the server and only passed down once the gate's
// cookie is present, so it never sits in a static payload. Same gate and
// password as /books — one unlock covers both.
export const dynamic = "force-dynamic";

const STORAGE_KEY = "for-expenses-unlocked";

export default async function MoneyPage() {
  const unlocked = (await cookies()).get(STORAGE_KEY)?.value === "1";
  return (
    <>
      <div className="fixed right-4 top-4 z-50">
        <ThemeToggle />
      </div>
      <PasswordGate password="beancounter" storageKey={STORAGE_KEY}>
        <MoneyDashboard
          income={unlocked ? incomeByYear() : []}
          incomeMonths={unlocked ? incomeByMonth() : []}
          receivables={unlocked ? receivables() : []}
          seed={unlocked ? [...Object.keys(seedBooks).flatMap((y) => seedEntries(Number(y))), ...addedBookEntries()] : []}
          facts={unlocked ? seedFacts : {}}
          registry={unlocked ? subscriptions : []}
          ledgerLoaded={unlocked}
        />
      </PasswordGate>
    </>
  );
}
