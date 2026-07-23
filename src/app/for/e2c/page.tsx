import { PasswordGate } from "@/components/PasswordGate";
import { ThemeToggle } from "@/components/ThemeToggle";
import { E2cClientPage } from "@/components/E2cClientPage";
import { e2c } from "@/content/clients/e2c";
import { getLatestSignature } from "@/lib/signed-agreement";

export const metadata = {
  title: "E2C Cookbook × Guil | Private",
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

export default async function E2cPage() {
  const sowSignature = await getLatestSignature("e2c", e2c.sow.version);

  return (
    <>
      <div className="fixed right-4 top-4 z-50">
        <ThemeToggle />
      </div>
      <PasswordGate password={e2c.password} storageKey="for-e2c-unlocked">
        <E2cClientPage initialSignature={sowSignature} />
      </PasswordGate>
    </>
  );
}
