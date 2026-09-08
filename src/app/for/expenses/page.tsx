import { PasswordGate } from "@/components/PasswordGate";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ExpensesTriage } from "@/components/ExpensesTriage";

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

// Owner-only tool: N26 export in, books rows out. The bank data is
// parsed in the browser and kept in localStorage — no upload, no API.
// The tax estimate and the accountant export live on /for/books.
export default function ExpensesPage() {
  return (
    <>
      <div className="fixed right-4 top-4 z-50">
        <ThemeToggle />
      </div>
      <PasswordGate password="beancounter" storageKey="for-expenses-unlocked">
        <ExpensesTriage />
      </PasswordGate>
    </>
  );
}
