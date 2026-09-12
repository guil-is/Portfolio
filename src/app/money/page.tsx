import { cookies } from "next/headers";
import { PasswordGate } from "@/components/PasswordGate";
import { ThemeToggle } from "@/components/ThemeToggle";
import { FinancialDashboard } from "@/components/money/FinancialDashboard";
import { dashboardProps, noRobots, PASSWORD, STORAGE_KEY } from "./data";

export const metadata = {
  title: "Financial Dashboard | Private",
  description: "Private personal finance overview",
  robots: noRobots,
};

// Same gate and password as /books — one unlock covers both.
export const dynamic = "force-dynamic";

export default async function MoneyPage() {
  const unlocked = (await cookies()).get(STORAGE_KEY)?.value === "1";
  return (
    <>
      <div className="fixed right-4 top-4 z-50">
        <ThemeToggle />
      </div>
      <PasswordGate password={PASSWORD} storageKey={STORAGE_KEY}>
        <FinancialDashboard {...dashboardProps(unlocked)} />
      </PasswordGate>
    </>
  );
}
