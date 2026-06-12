import { PasswordGate } from "@/components/PasswordGate";
import { ThemeToggle } from "@/components/ThemeToggle";
import { TedxBerlinAgreement } from "@/components/TedxBerlinAgreement";
import { tedxberlin } from "@/content/clients/tedxberlin";
import { getLatestSignature } from "@/lib/signed-agreement";

export const metadata = {
  title: "TEDxBerlin × Guil | Private",
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

export default async function TedxBerlinPage() {
  const sowSignature = await getLatestSignature(
    "tedxberlin",
    tedxberlin.sow.version,
  );

  return (
    <>
      <div className="fixed right-4 top-4 z-50">
        <ThemeToggle />
      </div>
      <PasswordGate
        password={tedxberlin.password}
        storageKey="for-tedxberlin-unlocked"
      >
        <TedxBerlinAgreement initialSignature={sowSignature} />
      </PasswordGate>
    </>
  );
}
