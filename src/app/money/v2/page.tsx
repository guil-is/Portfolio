import { cookies } from "next/headers";
import { PasswordGate } from "@/components/PasswordGate";
import { ThemeToggle } from "@/components/ThemeToggle";
import { FdDashboard } from "@/components/money/v2/FdDashboard";
import { dashboardProps, noRobots, PASSWORD, STORAGE_KEY } from "../data";

export const metadata = {
  title: "Financial Dashboard v2 | Private",
  description: "Private personal finance overview — shadcn/ui layout",
  robots: noRobots,
};

export const dynamic = "force-dynamic";

/** The same numbers as /money, laid out on shadcn/ui. Pick one, then the other goes. */
export default async function MoneyV2Page() {
  const unlocked = (await cookies()).get(STORAGE_KEY)?.value === "1";
  return (
    <>
      <div className="fixed right-4 top-4 z-50">
        <ThemeToggle />
      </div>
      <PasswordGate password={PASSWORD} storageKey={STORAGE_KEY}>
        <FdDashboard {...dashboardProps(unlocked)} />
      </PasswordGate>
    </>
  );
}
