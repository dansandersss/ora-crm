import { useState } from "react";
import { formatOraTime } from "@/lib/dashboard/format";
import type { DashboardActiveSession } from "@/lib/dashboard/types";
import { usePremiumTilt } from "@/hooks/usePremiumTilt";
import { SessionTimer } from "./SessionTimer";

function getInitial(name: string | null) {
  return (name?.trim().charAt(0) || "C").toLocaleUpperCase("ro-RO");
}

export function ActiveSessionCard({ session, onExpire, onUpdate, featured = false }: { session: DashboardActiveSession; onExpire: (sessionId: string) => void; onUpdate: (sessionId: string, action: "extend-30" | "extend-60" | "finish") => Promise<void>; featured?: boolean }) {
  const paused = session.session_status === "paused";
  const cardRef = usePremiumTilt<HTMLElement>();
  const [pendingAction, setPendingAction] = useState<"extend-30" | "extend-60" | "finish" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const update = async (action: "extend-30" | "extend-60" | "finish") => {
    setPendingAction(action);
    setError(null);
    try {
      await onUpdate(session.session_id, action);
    } catch {
      setError(action.startsWith("extend") ? "Nu s-a putut prelungi sesiunea." : "Nu s-a putut încheia sesiunea.");
    } finally {
      setPendingAction(null);
    }
  };

  return (
    <article ref={cardRef} data-active-session={session.session_id} className={`ora-glass-panel ora-tilt-card relative overflow-hidden rounded-[20px] border border-[#d9a441]/30 bg-[linear-gradient(135deg,rgba(49,43,36,.7),rgba(17,18,20,.76)_66%)] p-5 shadow-[0_20px_54px_rgba(0,0,0,.26)] xl:p-6 ${featured ? "xl:min-h-[430px] xl:p-8" : "xl:aspect-[570/384]"}`}>
      <div className="pointer-events-none absolute -left-16 top-12 size-48 rounded-full bg-[#e7a52d]/[.08] blur-3xl" />
      <header className="relative flex items-center gap-3">
        <h3 className="text-2xl font-bold tracking-[-0.025em] text-white">{session.device_name}</h3>
        <span className="rounded-full border border-[#d9a441]/45 bg-[#d9a441]/15 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-wide text-[#efad38]">
          {paused ? "Sesiune în pauză" : "Sesiune activă"}
        </span>
      </header>

      <div className={`relative mt-5 grid items-center gap-5 lg:grid-cols-[180px_1fr] ${featured ? "xl:grid-cols-[220px_1fr] xl:gap-10" : ""}`}>
        <SessionTimer
          endsAt={session.ends_at}
          totalSeconds={session.total_seconds}
          serverRemainingSeconds={session.remaining_seconds}
          paused={paused}
          onExpire={() => onExpire(session.session_id)}
        />
        <div className="min-w-0 space-y-4">
          <div className="flex items-center gap-3">
            <div className="grid size-11 shrink-0 place-items-center rounded-xl border border-[#eca62c] bg-black/25 text-lg font-semibold text-white shadow-[0_0_18px_rgba(217,164,65,.14)]">
              {getInitial(session.user_name)}
            </div>
            <div className="min-w-0">
              <p className="truncate font-semibold text-white">{session.user_name?.trim() || "Client"}</p>
              <p className="mt-1 truncate text-xs text-white/42">{session.user_phone?.trim() || "Telefon indisponibil"}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 rounded-xl border border-[#d9a441]/25 bg-black/20 py-3">
            <div className="text-center">
              <p className="text-[9px] uppercase tracking-wide text-white/36">Start</p>
              <p className="mt-1 text-sm font-semibold text-white">{formatOraTime(session.starts_at)}</p>
            </div>
            <div className="border-l border-[#d9a441]/20 text-center">
              <p className="text-[9px] uppercase tracking-wide text-white/36">Sfârșit</p>
              <p className="mt-1 text-sm font-semibold text-white">{formatOraTime(session.ends_at)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="relative mt-5 grid grid-cols-3 gap-3">
        <button type="button" disabled={pendingAction !== null} onClick={() => void update("extend-30")} className="h-10 cursor-pointer rounded-xl border border-[#d9a441]/30 bg-black/15 text-sm font-semibold text-[#e8a83a] transition hover:border-[#d9a441]/60 hover:bg-[#d9a441]/10 disabled:cursor-wait disabled:opacity-55">{pendingAction === "extend-30" ? "Se salvează…" : "+ 30 min"}</button>
        <button type="button" disabled={pendingAction !== null} onClick={() => void update("extend-60")} className="h-10 cursor-pointer rounded-xl border border-[#d9a441]/30 bg-black/15 text-sm font-semibold text-[#e8a83a] transition hover:border-[#d9a441]/60 hover:bg-[#d9a441]/10 disabled:cursor-wait disabled:opacity-55">{pendingAction === "extend-60" ? "Se salvează…" : "+ 1 ora"}</button>
        <button type="button" disabled={pendingAction !== null} onClick={() => void update("finish")} className="h-10 cursor-pointer rounded-xl border border-red-500/30 bg-red-950/25 text-sm font-semibold text-red-400 transition hover:border-red-400/60 hover:bg-red-900/30 disabled:cursor-wait disabled:opacity-55">{pendingAction === "finish" ? "Se salvează…" : "Încheie"}</button>
      </div>
      {error ? <p role="alert" className="relative mt-3 text-center text-xs text-red-300">{error}</p> : null}
    </article>
  );
}

export function ActiveSessionSkeleton() {
  return <div data-dashboard-body-card className="min-h-[320px] animate-pulse rounded-[20px] border border-[#d9a441]/15 bg-white/[.04] xl:aspect-[570/384] xl:min-h-0" />;
}

