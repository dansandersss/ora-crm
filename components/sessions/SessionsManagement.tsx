"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { RotateCcw, X } from "lucide-react";
import { DashboardAtmosphere } from "@/components/dashboard/DashboardAtmosphere";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { formatOraDate, formatOraTime } from "@/lib/dashboard/format";
import type { SessionFilter, SessionRecord } from "@/lib/sessions/types";
import { useSessionsManagement } from "@/hooks/useSessionsManagement";
import { AddSessionModal } from "./AddSessionModal";
import { MovieNightCard, StationSessionCard } from "./SessionCard";

const filters: { value: SessionFilter; label: string }[] = [
  { value: "all", label: "Toate" },
  { value: "pc", label: "PC" },
  { value: "ps5", label: "PS5" },
  { value: "cinema", label: "Nopți film" },
];

type ModalState = { mode: "gaming" | "movie"; stationId?: string; startNow?: boolean } | null;

export function SessionsManagement() {
  const [filter, setFilter] = useState<SessionFilter>("all");
  const [modal, setModal] = useState<ModalState>(null);
  const [managedSession, setManagedSession] = useState<SessionRecord | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const sessions = useSessionsManagement();

  const counts = useMemo(() => ({
    all: sessions.records.length,
    pc: sessions.records.filter((record) => record.record_kind === "gaming" && record.device_type === "pc").length,
    ps5: sessions.records.filter((record) => record.record_kind === "gaming" && record.device_type === "ps5").length,
    cinema: sessions.records.filter((record) => record.record_kind === "movie").length,
  }), [sessions.records]);

  const visibleStations = sessions.stations.filter((station) => filter === "all" || station.device_type === filter);
  const visibleMovies = sessions.records.filter((record) => record.record_kind === "movie" && (filter === "all" || filter === "cinema"));
  const gamingByDevice = new Map(sessions.records.filter((record) => record.record_kind === "gaming").map((record) => [record.device_id, record]));

  const saveNotice = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(null), 4200);
  };

  return (
    <div className="relative min-h-full">
      <DashboardAtmosphere />
      <div className="relative z-10 mx-auto w-full max-w-[1240px] px-4 py-5 sm:px-5 sm:py-7 xl:px-0">
        <DashboardHeader title={{ before: "Sesi", accent: "uni" }} subtitle={null} />

        <div className="mt-5 flex flex-wrap items-center gap-x-12 gap-y-3">
          <nav aria-label="Filtre sesiuni" className="flex flex-wrap gap-2">
            {filters.map(({ value, label }) => <button key={value} type="button" onClick={() => setFilter(value)} className={`flex h-9 cursor-pointer items-center gap-2 rounded-full border px-3.5 text-sm font-medium transition ${filter === value ? "border-[#efb349] bg-[#e7a52d] text-[#281906] shadow-[0_0_18px_rgba(231,165,45,.18)]" : "border-[#d9a441]/25 bg-white/[.035] text-white/60 hover:border-[#d9a441]/50 hover:text-white"}`}>{label}<span className="grid min-w-5 place-items-center rounded-full bg-white/75 px-1 text-[10px] font-bold text-black">{counts[value]}</span></button>)}
          </nav>
          <button type="button" onClick={() => setModal({ mode: "gaming", startNow: false })} className="flex h-11 cursor-pointer items-center gap-2 rounded-xl border border-[#e7a52d]/60 bg-[#e7a52d]/12 px-4 text-sm font-bold text-[#f2b74a] shadow-[0_0_22px_rgba(231,165,45,.1)] transition hover:bg-[#e7a52d]/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e7a52d]"><Image src="/assets/plus.svg" alt="" width={16} height={16} className="size-4" /> Adaugă sesiune</button>
        </div>

        {notice ? <div role="status" className="mt-5 rounded-xl border border-emerald-300/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">{notice}</div> : null}
        {sessions.error ? <div className="mt-8 grid min-h-48 place-items-center rounded-[24px] border border-red-400/20 bg-red-950/10"><div className="text-center"><p className="text-sm text-white/65">{sessions.error}</p><button type="button" onClick={() => void sessions.refetch()} className="mt-4 inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-[#e7a52d]"><RotateCcw className="size-4" /> Încearcă din nou</button></div></div> : null}
        {!sessions.error && sessions.loading ? <SessionGridSkeleton /> : null}
        {!sessions.error && !sessions.loading ? (
          <section className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {visibleStations.map((station) => <StationSessionCard key={station.device_id} station={station} session={gamingByDevice.get(station.device_id)} onCreate={(selected) => setModal({ mode: "gaming", stationId: selected.device_id, startNow: true })} onManage={setManagedSession} />)}
            {visibleMovies.map((event) => <MovieNightCard key={event.record_id} event={event} onSchedule={() => setModal({ mode: "movie" })} />)}
            {(filter === "all" || filter === "cinema") && visibleMovies.length === 0 ? <MovieNightCard onSchedule={() => setModal({ mode: "movie" })} /> : null}
          </section>
        ) : null}
        {!sessions.loading && !sessions.error && visibleStations.length === 0 && visibleMovies.length === 0 ? <div className="mt-8 rounded-[24px] border border-[#d9a441]/20 bg-white/[.025] p-7 text-center text-sm text-white/55">Nu există sesiuni pentru acest filtru.</div> : null}
      </div>

      <AddSessionModal key={modal ? `${modal.mode}-${modal.stationId ?? "none"}-${modal.startNow ? "now" : "record"}` : "closed"} open={modal !== null} initialMode={modal?.mode ?? "gaming"} initialStartNow={modal?.startNow ?? false} preselectedStationId={modal?.stationId} stations={sessions.stations} searchCustomers={sessions.searchCustomers} onClose={() => setModal(null)} onStartGaming={sessions.createGamingSession} onRecordGaming={sessions.recordGamingSession} onCreateMovie={sessions.createMovieNight} onSaved={saveNotice} />
      <ManageSessionDialog session={managedSession} onClose={() => setManagedSession(null)} onFinish={async (cancel) => { if (!managedSession) return; await sessions.finishGamingSession(managedSession.record_id, cancel); saveNotice(cancel ? "Sesiunea a fost anulată." : "Sesiunea a fost încheiată."); setManagedSession(null); }} />
    </div>
  );
}

function ManageSessionDialog({ session, onClose, onFinish }: { session: SessionRecord | null; onClose: () => void; onFinish: (cancel: boolean) => Promise<void> }) {
  const [saving, setSaving] = useState(false);
  if (!session) return null;
  const finish = async (cancel: boolean) => { setSaving(true); try { await onFinish(cancel); } finally { setSaving(false); } };
  return <div className="fixed inset-0 z-[60] grid place-items-center bg-black/75 p-4 backdrop-blur-sm" role="presentation"><section role="dialog" aria-modal="true" aria-labelledby="manage-session-title" className="w-full max-w-md rounded-[24px] border border-[#d9a441]/30 bg-[#171615] p-6 shadow-2xl"><div className="flex items-start justify-between"><div><p className="text-sm text-[#e7a52d]">{session.status === "scheduled" ? "Sesiune programată" : "Sesiune activă"}</p><h2 id="manage-session-title" className="mt-1 text-2xl font-bold text-white">{session.device_name}</h2></div><button type="button" onClick={onClose} disabled={saving} aria-label="Închide" className="grid size-9 cursor-pointer place-items-center rounded-lg text-white/60 hover:bg-white/10"><X className="size-5" /></button></div><div className="mt-5 rounded-xl border border-white/10 bg-white/[.035] p-4 text-sm"><p className="font-medium text-white">{session.primary_user_name}</p><p className="mt-1 text-white/52">{formatOraDate(session.starts_at)} · {formatOraTime(session.starts_at)}{session.ends_at ? ` – ${formatOraTime(session.ends_at)}` : ""}</p></div><div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><button type="button" onClick={() => void finish(true)} disabled={saving} className="h-10 cursor-pointer rounded-xl border border-red-400/35 px-4 text-sm font-semibold text-red-300 disabled:opacity-50">Anulează sesiunea</button><button type="button" onClick={() => void finish(false)} disabled={saving} className="h-10 cursor-pointer rounded-xl bg-[#e7a52d] px-4 text-sm font-bold text-[#291906] disabled:opacity-50">{saving ? "Se salvează…" : "Încheie sesiunea"}</button></div></section></div>;
}

function SessionGridSkeleton() { return <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 3 }).map((_, index) => <div key={index} className="h-[385px] animate-pulse rounded-[24px] border border-[#d9a441]/15 bg-white/[.035] xl:h-[600px]" />)}</div>; }
