import { PasswordGate } from "@/components/PasswordGate";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ExpensesTriage } from "@/components/ExpensesTriage";
import { incomeByYear } from "@/lib/income";

export const metadata = {
  title: "Expenses | Private",
  description: "Private tax-expenses sorter",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false },
  },
};

// Owner-only tool: N26 export in, tax-sheet rows out. The bank data is
// parsed in the browser and kept in localStorage — no upload, no API.
// Income comes the other way: aggregated from the invoice ledger here on
// the server, so the ledger itself never ships to the client.
export default function ExpensesPage() {
  return (
    <>
      <div className="fixed right-4 top-4 z-50">
        <ThemeToggle />
      </div>
      <PasswordGate password="beancounter" storageKey="for-expenses-unlocked">
        <ExpensesTriage income={incomeByYear()} />
      </PasswordGate>
    </>
  );
}
