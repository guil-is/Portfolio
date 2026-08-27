import { PasswordGate } from "@/components/PasswordGate";
import { ThemeToggle } from "@/components/ThemeToggle";
import { VisitTracker } from "@/components/VisitTracker";
import { HuitAgreement } from "@/components/HuitAgreement";
import { VideoBriefs } from "@/components/VideoBriefs";
import { huit } from "@/content/clients/huit";
import { getLatestSignature, type SignedAgreement } from "@/lib/signed-agreement";

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
  // The framework and every video brief are separate signable documents, so
  // each needs its own lookup. Fetched together to keep the page one round.
  const [sowSignature, briefSignatures] = await Promise.all([
    getLatestSignature("huit", huit.sow.version),
    Promise.all(
      huit.videos.map(async (video) => {
        const signature = await getLatestSignature("huit", video.brief.version);
        return [video.key, signature] as const;
      }),
    ).then(
      (entries) =>
        Object.fromEntries(entries) as Record<string, SignedAgreement | null>,
    ),
  ]);

  return (
    <>
      <div className="no-print fixed right-4 top-4 z-50">
        <ThemeToggle />
      </div>
      <PasswordGate password={huit.password} storageKey="for-huit-unlocked">
        <VisitTracker slug="huit" />
        <HuitAgreement initialSignature={sowSignature} />
        <div className="mx-auto w-full max-w-[760px] px-6 pb-40 md:px-10">
          <VideoBriefs videos={huit.videos} signatures={briefSignatures} />
        </div>
      </PasswordGate>
    </>
  );
}
