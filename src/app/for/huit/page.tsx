import { PasswordGate } from "@/components/PasswordGate";
import { ThemeToggle } from "@/components/ThemeToggle";
import { VisitTracker } from "@/components/VisitTracker";
import { ClientPage, type ClientPageData } from "@/components/ClientPage";
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
  // The framework and every video brief are separate signable documents,
  // so each needs its own lookup. Fetched together in one round.
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

  const data: ClientPageData = {
    slug: "huit",
    clientName: huit.clientName,
    heroTitle: huit.heading,
    intro: huit.subtitle,
    // Returning visits land on the briefs once the framework is signed;
    // before that the videos tab is locked and the agreement leads.
    defaultTab: sowSignature ? "videos" : "agreement",
    sow: huit.sow,
    videos: { items: huit.videos, signatures: briefSignatures },
  };

  return (
    <>
      <div className="no-print fixed right-4 top-4 z-50">
        <ThemeToggle />
      </div>
      <PasswordGate password={huit.password} storageKey="for-huit-unlocked">
        <VisitTracker slug="huit" />
        <ClientPage data={data} initialSignature={sowSignature} />
      </PasswordGate>
    </>
  );
}
