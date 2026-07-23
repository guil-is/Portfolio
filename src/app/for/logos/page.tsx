import { PasswordGate } from "@/components/PasswordGate";
import { ThemeToggle } from "@/components/ThemeToggle";
import { VisitTracker } from "@/components/VisitTracker";
import { LogosAgreement } from "@/components/LogosAgreement";
import { logos } from "@/content/clients/logos";
import { getLatestSignature } from "@/lib/signed-agreement";

export const metadata = {
  title: "Logos × Guil | Private",
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

export default async function LogosPage() {
  const sowSignature = await getLatestSignature("logos", logos.sow.version);

  return (
    <>
      <div className="fixed right-4 top-4 z-50">
        <ThemeToggle />
      </div>
      <PasswordGate password={logos.password} storageKey="for-logos-unlocked">
        <VisitTracker slug="logos" />
        <LogosAgreement initialSignature={sowSignature} />
      </PasswordGate>
    </>
  );
}
