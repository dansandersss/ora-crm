"use client";

import { formatMdl } from "@/lib/dashboard/format";
import type { DashboardOverview } from "@/lib/dashboard/types";
import { usePremiumTilt } from "@/hooks/usePremiumTilt";

function StatIcon({ src }: { src: string }) {
  return (
    <span
      aria-hidden="true"
      className="size-7 bg-[linear-gradient(135deg,#d9a441,#ffa600)]"
      style={{
        WebkitMaskImage: `url(${src})`,
        maskImage: `url(${src})`,
        WebkitMaskPosition: "center",
        maskPosition: "center",
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskSize: "contain",
        maskSize: "contain",
      }}
    />
  );
}

function StatCard({ value, label, iconPath, goldSuffix = false }: { value: string; label: string; iconPath: string; goldSuffix?: boolean }) {
  const cardRef = usePremiumTilt<HTMLElement>();
  const suffix = goldSuffix && value.endsWith(" MDL") ? " MDL" : "";
  const main = suffix ? value.slice(0, -suffix.length) : value;

  return (
    <article ref={cardRef} data-stat-card className="ora-glass-panel ora-tilt-card group relative flex h-[148px] items-center gap-4 overflow-hidden rounded-[18px] border border-[#d9a441]/25 bg-[linear-gradient(135deg,rgba(255,255,255,.07),rgba(18,18,20,.68))] px-5 shadow-[inset_0_1px_0_rgba(255,255,255,.04),0_18px_42px_rgba(0,0,0,.22)] transition-[border-color,box-shadow] duration-300 hover:border-[#d9a441]/42 hover:shadow-[inset_0_1px_0_rgba(255,255,255,.055),0_22px_48px_rgba(0,0,0,.28)] xl:h-[158px]">
      <div className="pointer-events-none absolute -right-8 -top-10 size-28 rounded-full bg-[#d9a441]/[.06] blur-2xl" />
      <div className="ora-depth-icon grid size-14 shrink-0 place-items-center rounded-xl bg-white/[.075] text-[#f2a91c] shadow-[inset_0_1px_0_rgba(255,255,255,.04)]">
        <StatIcon src={iconPath} />
      </div>
      <div className="ora-depth-copy min-w-0">
        <p className="text-[1.35rem] font-semibold leading-none text-[#f6f3ee]">
          {main}{suffix ? <span className="text-[#e7a52d]">{suffix}</span> : null}
        </p>
        <p className="mt-2 text-sm text-white/45">{label}</p>
      </div>
    </article>
  );
}

export function DashboardStats({ overview }: { overview: DashboardOverview }) {
  return (
    <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4 xl:gap-6">
      <StatCard value={String(overview.active_sessions)} label="Sesiuni active" iconPath="/assets/sessions-icon.svg" />
      <StatCard value={`${overview.pc_occupied}/${overview.pc_total}`} label="PC ocupat" iconPath="/assets/pc-icon.svg" />
      <StatCard value={`${overview.ps5_occupied}/${overview.ps5_total}`} label="PS5 ocupat" iconPath="/assets/playstation-icon.svg" />
      <StatCard value={formatMdl(overview.revenue_today_mdl)} label="Încasări azi" iconPath="/assets/money-icon.svg" goldSuffix />
    </section>
  );
}

export function DashboardStatsSkeleton() {
  return (
    <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4 xl:gap-6" aria-label="Se încarcă statisticile">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} data-stat-card className="h-[148px] animate-pulse rounded-[18px] border border-[#d9a441]/15 bg-white/[.045] xl:h-[158px]" />
      ))}
    </section>
  );
}

