import type { ReactNode } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { requireActiveStaff } from "@/lib/auth/server";

export const instant = false;

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const { profile } = await requireActiveStaff();

  return (
    <div className="flex h-dvh overflow-hidden bg-[#080808] text-[#f5f3ef]">
      <Sidebar firstName={profile.first_name} role={profile.role} />
      <main className="min-w-0 flex-1 overflow-y-auto overscroll-contain">
        <div className="min-h-dvh px-4 py-6 sm:px-6 lg:py-8 xl:px-4">
          {children}
        </div>
      </main>
    </div>
  );
}
