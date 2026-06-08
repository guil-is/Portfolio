import { PasswordGate } from "@/components/PasswordGate";
import { ThemeToggle } from "@/components/ThemeToggle";
import { MyosinClientPage } from "@/components/MyosinClientPage";
import { myosin } from "@/content/clients/myosin";
import { getLatestSignature } from "@/lib/signed-agreement";

export const metadata = {
  title: "Myosin × Guil | Private",
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

export default async function MyosinPage() {
  const sowSignature = await getLatestSignature("myosin", myosin.sow.version);

  return (
    <>
      <div className="fixed right-4 top-4 z-50">
        <ThemeToggle />
      </div>
      <PasswordGate password={myosin.password} storageKey="for-myosin-unlocked">
        <MyosinClientPage initialSignature={sowSignature} />
      </PasswordGate>
    </>
  );
}
