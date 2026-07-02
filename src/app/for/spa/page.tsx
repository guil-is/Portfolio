import { PasswordGate } from "@/components/PasswordGate";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SpaClientPage } from "@/components/SpaClientPage";
import { spa } from "@/content/clients/spa";
import { getLatestSignature } from "@/lib/signed-agreement";

export const metadata = {
  title: "WinWin 2026 × Guil | Private",
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

export default async function SpaPage() {
  const sowSignature = await getLatestSignature("spa", spa.sow.version);

  return (
    <>
      <div className="fixed right-4 top-4 z-50">
        <ThemeToggle />
      </div>
      <PasswordGate password={spa.password} storageKey="for-spa-unlocked">
        <SpaClientPage initialSignature={sowSignature} />
      </PasswordGate>
    </>
  );
}
