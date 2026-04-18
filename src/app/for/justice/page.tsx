import { PasswordGate } from "@/components/PasswordGate";
import { ThemeToggle } from "@/components/ThemeToggle";
import { JusticeClientPage } from "@/components/JusticeClientPage";
import { justice } from "@/content/clients/justice";

export const metadata = {
  title: "Justice × Guil | Private",
  description: "Private client page",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false },
  },
};

export default function JusticePage() {
  return (
    <>
      <div className="fixed right-4 top-4 z-50">
        <ThemeToggle />
      </div>
      <PasswordGate password={justice.password} storageKey="for-justice-unlocked">
        <JusticeClientPage />
      </PasswordGate>
    </>
  );
}
