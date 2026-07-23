import { PasswordGate } from "@/components/PasswordGate";
import { ThemeToggle } from "@/components/ThemeToggle";
import { VisitTracker } from "@/components/VisitTracker";
import { ClientPage, type ClientPageData } from "@/components/ClientPage";
import {
  e2c,
  CLIENT_ENTITY,
  currentPhase,
  phaseStatus,
} from "@/content/clients/e2c";
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

// Compose the shared ClientPage from the e2c content file. Statuses all
// derive from the single `currentPhase` value in the data.
function pageData(): ClientPageData {
  const current = currentPhase(e2c);
  const currentIndex = current ? e2c.currentPhase + 1 : e2c.phases.length;

  return {
    slug: "e2c",
    clientName: e2c.clientName,
    heroTitle: "E2C Cookbook × Guil",
    intro: `${e2c.subtitle} The agreement to approve, and a live view of where the work stands.`,
    defaultTab: "agreement",
    stats: [
      {
        label: "Current phase",
        value: `${currentIndex} of ${e2c.phases.length}`,
        sub: current ? current.title : "All phases complete",
      },
      {
        label: "Final delivery",
        value: e2c.finalDelivery,
        sub: "Print PDF and web PDF",
      },
      {
        label: "Launch event",
        value: e2c.launchEvent,
        sub: "One week of buffer after delivery",
      },
    ],
    phases: e2c.phases.map((phase, i) => ({
      eyebrow: `${phase.label} · ${phase.window}`,
      title: phase.title,
      description: phase.description,
      items: phase.items,
      status: phaseStatus(e2c, i),
    })),
    sow: e2c.sow,
    clientEntity: CLIENT_ENTITY,
    timelineSection: "Timeline",
  };
}

export default async function E2cPage() {
  const sowSignature = await getLatestSignature("e2c", e2c.sow.version);

  return (
    <>
      <div className="fixed right-4 top-4 z-50">
        <ThemeToggle />
      </div>
      <PasswordGate password={e2c.password} storageKey="for-e2c-unlocked">
        <VisitTracker slug="e2c" />
        <ClientPage data={pageData()} initialSignature={sowSignature} />
      </PasswordGate>
    </>
  );
}
