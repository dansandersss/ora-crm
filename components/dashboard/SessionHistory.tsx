"use client";

import { useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, Monitor, RotateCcw } from "lucide-react";
import gsap from "gsap";
import { formatDuration, formatOraDate, formatOraTime } from "@/lib/dashboard/format";
import type { DashboardHistoryItem, DeviceType, HistoryCounts, HistoryFilter } from "@/lib/dashboard/types";
import { cn } from "@/lib/utils";
import { usePremiumTilt } from "@/hooks/usePremiumTilt";

const filterLabels: Record<"all" | DeviceType, string> = {
  all: "Toate",
  pc: "PC",
  ps5: "PS5",
  xbox: "Xbox",
  cinema: "Nopți film",
};

type SessionHistoryProps = {
  variant: "compact" | "full";
  items: DashboardHistoryItem[];
  counts: HistoryCounts | null;
  filter: HistoryFilter;
  availableTypes: Set<DeviceType>;
  loading: boolean;
  error: boolean;
  page: number;
  pageCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  onFilterChange: (filter: HistoryFilter) => void;
  onPreviousPage: () => void;
  onNextPage: () => void;
  onRetry: () => void;
};

export function SessionHistory({
  variant,
  items,
  counts,
  filter,
  availableTypes,
  loading,
  error,
  page,
  pageCount,
  hasPreviousPage,
  hasNextPage,
  onFilterChange,
  onPreviousPage,
  onNextPage,
  onRetry,
}: SessionHistoryProps) {
  const containerRef = usePremiumTilt<HTMLElement>(variant === "compact");
  const rowsRef = useRef<HTMLDivElement>(null);
  const animatedRowsRef = useRef(new Set<string>());
  const visibleTypes: DeviceType[] = ["pc", "ps5"];
  for (const type of ["xbox", "cinema"] as const) {
    if (availableTypes.has(type) || (counts?.[type] ?? 0) > 0) visibleTypes.push(type);
  }
  const filters: HistoryFilter[] = [null, ...visibleTypes];
  const visibleItems = items;

  useEffect(() => {
    const root = rowsRef.current;
    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const newRows = Array.from(root.querySelectorAll<HTMLElement>("[data-history-row]"))
      .filter((row) => !animatedRowsRef.current.has(row.dataset.historyRow ?? ""));
    if (newRows.length === 0) return;

    newRows.forEach((row) => animatedRowsRef.current.add(row.dataset.historyRow ?? ""));
    const tween = gsap.fromTo(newRows, { autoAlpha: 0, y: 9 }, {
      autoAlpha: 1,
      y: 0,
      duration: 0.46,
      stagger: 0.045,
      ease: "power3.out",
      clearProps: "opacity,visibility,transform",
    });
    return () => {
      tween.kill();
    };
  }, [items, variant]);

  return (
    <section ref={containerRef} className={cn(
      variant === "compact" && "ora-glass-panel ora-tilt-card w-full max-w-[520px] rounded-[20px] border border-[#d9a441]/25 bg-[linear-gradient(135deg,rgba(46,40,33,.68),rgba(17,18,20,.74)_68%)] p-5 shadow-[0_18px_50px_rgba(0,0,0,.24)]",
      variant === "full" && "w-full",
    )}>
      {variant === "compact" ? (
        <h2 className="text-xl font-bold text-white">Istoric <span className="text-[#e7a52d]">Sesiuni</span></h2>
      ) : null}

      <div className={cn("mb-5 flex flex-wrap gap-2", variant === "compact" && "mt-4")}>
        {filters.map((value) => {
          const key = value ?? "all";
          const selected = filter === value;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onFilterChange(value)}
              className={cn(
                "flex h-8 cursor-pointer items-center gap-2 rounded-full border px-3 text-xs font-medium transition-colors",
                selected
                  ? "border-[#efb349] bg-[#e7a52d] text-[#241606] shadow-[0_0_16px_rgba(231,165,45,.2)]"
                  : "border-[#d9a441]/22 bg-white/[.04] text-white/65 hover:border-[#d9a441]/45 hover:text-white",
              )}
            >
              {filterLabels[key]}
              <span className={cn("grid min-w-4 place-items-center rounded-full px-1 text-[9px]", selected ? "bg-white/75 text-black" : "bg-white/75 text-black")}>{counts?.[key] ?? "–"}</span>
            </button>
          );
        })}
      </div>

      {error ? (
        <div className="grid min-h-36 place-items-center rounded-xl border border-red-400/15 bg-red-950/10 text-center">
          <div>
            <p className="text-sm text-white/65">Istoricul nu a putut fi încărcat.</p>
            <button type="button" onClick={onRetry} className="mt-3 inline-flex cursor-pointer items-center gap-2 text-sm text-[#e7a52d]"><RotateCcw className="size-4" /> Încearcă din nou</button>
          </div>
        </div>
      ) : loading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-[62px] animate-pulse rounded-xl border border-[#d9a441]/12 bg-white/[.04]" />
          ))}
        </div>
      ) : visibleItems.length === 0 ? (
        <div className="grid min-h-36 place-items-center rounded-xl border border-[#d9a441]/15 bg-black/10 text-sm text-white/45">Nu există încă istoric de sesiuni.</div>
      ) : (
        <div ref={rowsRef} className="space-y-2">
          {visibleItems.map((item) => (
            <HistoryRow key={item.session_id} item={item} />
          ))}
        </div>
      )}

      {pageCount > 1 ? (
        <nav aria-label="Paginare istoric sesiuni" className="mt-5 flex items-center justify-center gap-3">
          <button type="button" onClick={onPreviousPage} disabled={!hasPreviousPage || loading} aria-label="Pagina anterioară" className="grid size-9 cursor-pointer place-items-center rounded-xl border border-[#d9a441]/30 text-[#e8aa3c] transition-colors hover:bg-[#d9a441]/10 disabled:cursor-not-allowed disabled:opacity-35"><ChevronLeft className="size-4" /></button>
          <span className="min-w-24 text-center text-xs font-medium text-white/55">Pagina {page + 1} din {pageCount}</span>
          <button type="button" onClick={onNextPage} disabled={!hasNextPage || loading} aria-label="Pagina următoare" className="grid size-9 cursor-pointer place-items-center rounded-xl border border-[#d9a441]/30 text-[#e8aa3c] transition-colors hover:bg-[#d9a441]/10 disabled:cursor-not-allowed disabled:opacity-35"><ChevronRight className="size-4" /></button>
        </nav>
      ) : null}
    </section>
  );
}

function HistoryRow({ item }: { item: DashboardHistoryItem }) {
  const rowRef = usePremiumTilt<HTMLElement>();
  const points = item.earned_points > 0 ? `+${item.earned_points} P` : `${item.earned_points} P`;
  return (
    <article ref={rowRef} data-history-row={item.session_id} className="ora-glass-panel ora-tilt-card flex h-[62px] items-center gap-3 rounded-xl border border-[#d9a441]/22 bg-[linear-gradient(90deg,rgba(255,255,255,.06),rgba(16,17,19,.62))] px-3.5 shadow-[0_9px_24px_rgba(0,0,0,.12)]">
      <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-white/[.075] text-white/75"><Monitor className="size-4" /></div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-white/88">{item.device_name}</p>
        <p className="mt-1 truncate text-[10px] text-white/38">{formatOraDate(item.starts_at)} • {formatOraTime(item.starts_at)} – {formatOraTime(item.ends_at)}</p>
      </div>
      <div className="shrink-0 text-right">
        <p className={cn("text-sm font-semibold", item.session_status === "cancelled" ? "text-red-400" : "text-[#e8a72f]")}>{points}</p>
        <p className="mt-1 text-[10px] text-white/38">{formatDuration(item.duration_seconds)}</p>
      </div>
    </article>
  );
}

