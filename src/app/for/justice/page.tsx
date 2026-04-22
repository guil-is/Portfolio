import { PasswordGate } from "@/components/PasswordGate";
import { SiteNav } from "@/components/SiteNav";
import { JusticeClientPage } from "@/components/JusticeClientPage";
import { justice } from "@/content/clients/justice";
import { getLatestSignature } from "@/lib/signed-agreement";

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

// Always fetch fresh signature state — once signed, it should appear
// immediately on every visit.
export const dynamic = "force-dynamic";

export default async function JusticePage() {
  const signature = await getLatestSignature("justice", justice.sow.version);

  return (
    <>
      <div className="fixed right-4 top-4 z-50">
        <SiteNav />
      </div>
      <PasswordGate password={justice.password} storageKey="for-justice-unlocked">
        <JusticeClientPage initialSignature={signature} />
      </PasswordGate>
    </>
  );
}
