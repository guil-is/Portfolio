import { cookies } from "next/headers";
import { PasswordGate } from "@/components/PasswordGate";
import { ClientsDashboard } from "@/components/ClientsDashboard";
import { invoiceRows, receivables } from "@/lib/income";

export const metadata = {
  title: "Clients | Private",
  description: "Private client index",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false },
  },
};

// The open invoices come from the ledger on the server and are only
// passed down once the gate's cookie is present.
export const dynamic = "force-dynamic";

const STORAGE_KEY = "for-clients-unlocked";

export default async function ClientsPage() {
  const unlocked = (await cookies()).get(STORAGE_KEY)?.value === "1";
  return (
    <>
      <PasswordGate password="cracatoa" storageKey={STORAGE_KEY}>
        <ClientsDashboard receivables={unlocked ? receivables() : []} invoices={unlocked ? invoiceRows() : []} ledgerLoaded={unlocked} />
      </PasswordGate>
    </>
  );
}
