import { PasswordGate } from "@/components/PasswordGate";
import { ThemeToggle } from "@/components/ThemeToggle";
import { VisitTracker } from "@/components/VisitTracker";
import { HuitAgreement } from "@/components/HuitAgreement";
import { huit } from "@/content/clients/huit";
import { getLatestSignature } from "@/lib/signed-agreement";

export const metadata = {
  title: "Studio Huit × Guil | Private",
  description: "Private client page",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false },
  },
};

// Always fetch fresh signature state — once signed, it should appear
// immediately on every visit.
export const dynamic = "force-dynamic";

export default async function HuitPage() {
  const sowSignature = await getLatestSignature("huit", huit.sow.version);

  return (
    <>
      <div className="no-print fixed right-4 top-4 z-50">
        <ThemeToggle />
      </div>
      <PasswordGate password={huit.password} storageKey="for-huit-unlocked">
        <VisitTracker slug="huit" />
        <HuitAgreement initialSignature={sowSignature} />
      </PasswordGate>
    </>
  );
}
