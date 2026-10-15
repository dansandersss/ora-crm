import { Dashboard } from "@/components/dashboard/Dashboard";
import { requireActiveStaff } from "@/lib/auth/server";

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ view?: string }> }) {
  const [{ profile }, params] = await Promise.all([requireActiveStaff(), searchParams]);
  return <Dashboard firstName={profile.first_name} historyView={params.view === "history"} />;
}
