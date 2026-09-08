import { cookies } from "next/headers";
import { PasswordGate } from "@/components/PasswordGate";
import { ThemeToggle } from "@/components/ThemeToggle";
import { BooksDashboard } from "@/components/BooksDashboard";
import { incomeByYear, invoiceRows } from "@/lib/income";
import { seedBooks, seedEntries } from "@/content/books/seed";

export const metadata = {
  title: "Books | Private",
  description: "Private bookkeeping and tax dashboard",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false },
  },
};

// The ledger data is read on the server and only passed down once the
// gate's cookie is present, so it never sits in a static payload.
export const dynamic = "force-dynamic";

const STORAGE_KEY = "for-expenses-unlocked";

export default async function BooksPage() {
  const unlocked = (await cookies()).get(STORAGE_KEY)?.value === "1";
  return (
    <>
      <div className="fixed right-4 top-4 z-50">
        <ThemeToggle />
      </div>
      <PasswordGate password="beancounter" storageKey={STORAGE_KEY}>
        <BooksDashboard
          income={unlocked ? incomeByYear() : []}
          invoices={unlocked ? invoiceRows() : []}
          seed={unlocked ? Object.keys(seedBooks).flatMap((y) => seedEntries(Number(y))) : []}
          ledgerLoaded={unlocked}
        />
      </PasswordGate>
    </>
  );
}
