"use client";

import { useEffect, useState } from "react";
import { formatOraHeaderDate, formatOraTime, getGreeting } from "@/lib/dashboard/format";

type DashboardHeaderProps = {
  firstName?: string;
  title?: { before: string; accent: string };
  subtitle?: string | null;
};

export function DashboardHeader({ firstName, title, subtitle }: DashboardHeaderProps) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const updateClock = () => setNow(new Date());
    updateClock();
    const interval = window.setInterval(updateClock, 15_000);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <header className="flex min-h-[76px] items-start justify-between gap-6">
      <div>
        <h1 className="text-[clamp(1.65rem,2.3vw,2.35rem)] font-bold leading-tight tracking-[-0.035em] text-[#f8f6f2]">
          {title ? <>{title.before}<span className="text-[#e7a52d]">{title.accent}</span></> : <>{now ? getGreeting(now) : "Bună"}, <span className="text-[#e7a52d]">{firstName}</span></>}
        </h1>
        {subtitle !== null ? <p className="mt-1 text-sm text-white/48 sm:text-base">{subtitle ?? "Totul funcționează perfect"}</p> : null}
      </div>
      <div className="min-w-[170px] text-right">
        <p className="min-h-6 text-sm text-white/48 sm:text-base">{now ? formatOraHeaderDate(now) : ""}</p>
        <p className="mt-0.5 min-h-10 text-[clamp(1.7rem,2.5vw,2.35rem)] font-semibold leading-none text-white">
          {now ? formatOraTime(now) : "--:--"}
        </p>
      </div>
    </header>
  );
}

