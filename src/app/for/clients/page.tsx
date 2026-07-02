import { PasswordGate } from "@/components/PasswordGate";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ClientsDashboard } from "@/components/ClientsDashboard";

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

export default function ClientsPage() {
  return (
    <>
      <div className="fixed right-4 top-4 z-50">
        <ThemeToggle />
      </div>
      <PasswordGate password="cracatoa" storageKey="for-clients-unlocked">
        <ClientsDashboard />
      </PasswordGate>
    </>
  );
}
