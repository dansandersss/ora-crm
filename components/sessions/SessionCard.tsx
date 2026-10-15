"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { CalendarClock, Plus } from "lucide-react";
import { formatDuration, formatOraDate, formatOraTime } from "@/lib/dashboard/format";
import type { SessionRecord, SessionStation } from "@/lib/sessions/types";

type StationCardProps = {
  station: SessionStation;
  session?: SessionRecord;
  onCreate: (station: SessionStation) => void;
  onManage: (session: SessionRecord) => void;
};

export function StationSessionCard({ station, session, onCreate, onManage }: StationCardProps) {
  const isPs5 = station.device_type === "ps5";
  const asset = isPs5 ? "/assets/ps5-image.svg" : "/assets/pc1-image.svg";
  const active = session?.status === "active" || session?.status === "paused";
  const reserved = session?.status === "scheduled";

  return (
    <article className="group relative min-h-[385px] overflow-hidden rounded-[24px] border border-[#d9a441]/28 bg-[#161412] shadow-[0_20px_48px_rgba(0,0,0,.32)] xl:min-h-[600px]">
      <Image src={asset} alt="" fill sizes="(max-width: 768px) 100vw, 360px" className="object-cover opacity-80 transition-transform duration-700 group-hover:scale-[1.035]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,5,5,.12),rgba(5,5,5,.32)_42%,rgba(5,5,5,.93)_100%)]" />
      <div className="relative flex min-h-[385px] flex-col p-6 xl:min-h-[600px]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-[clamp(2rem,4vw,3.45rem)] font-bold leading-none tracking-[-.045em] text-white">{station.name}</h2>
            <span className={`mt-3 inline-flex rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wide ${active ? "border-[#efb349]/50 bg-[#e7a52d]/20 text-[#f1b447]" : reserved ? "border-sky-300/35 bg-sky-300/10 text-sky-100" : "border-white/20 bg-black/20 text-white/65"}`}>
              {active ? "OCUPAT" : reserved ? "PROGRAMAT" : "LIBER"}
            </span>
          </div>
          <div className="grid size-11 place-items-center rounded-xl bg-black/30 text-[#e9aa31] backdrop-blur-sm">
            <Image src={isPs5 ? "/assets/playstation-icon.svg" : "/assets/pc-icon.svg"} alt="" width={26} height={26} className="size-7" />
          </div>
        </div>

        {session ? (
          <div className="mt-auto">
            <div className="flex items-center gap-3">
              <div className="grid size-12 place-items-center rounded-xl border border-[#e7a52d] bg-black/35 text-lg font-bold text-white">{session.primary_user_name?.charAt(0).toLocaleUpperCase("ro-RO") ?? "C"}</div>
              <div className="min-w-0">
                <p className="truncate font-semibold text-white">{session.primary_user_name ?? "Client"}</p>
                <p className="mt-0.5 text-sm text-white/58">{session.participant_count > 1 ? `${session.participant_count} participanți` : session.primary_user_phone ?? "Client ORA"}</p>
              </div>
            </div>
            <div className="mt-4 space-y-1 text-sm text-white/75"><p className="flex items-center gap-2"><CalendarClock className="size-4 text-[#e7a52d]" />{reserved ? `${formatOraDate(session.starts_at)} · ${formatOraTime(session.starts_at)}` : `Început la ${formatOraTime(session.starts_at)}`}</p>{active ? <><p className="pl-6 text-white/56">Până la {session.ends_at ? formatOraTime(session.ends_at) : "—"}</p>{session.ends_at ? <RemainingTime endsAt={session.ends_at} /> : null}</> : null}</div>
            <button type="button" onClick={() => onManage(session)} className="mt-5 h-12 w-full cursor-pointer rounded-xl border border-[#e5a631]/70 bg-[linear-gradient(135deg,rgba(217,164,65,.2),rgba(217,164,65,.06))] font-semibold text-[#efb34b] transition hover:bg-[#d9a441]/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e7a52d]">Gestionează</button>
          </div>
        ) : (
          <div className="mt-auto">
            <p className="text-sm text-white/62">Stația este pregătită pentru următoarea sesiune.</p>
            <button type="button" onClick={() => onCreate(station)} className="mt-5 flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#e5a631]/70 bg-[linear-gradient(135deg,rgba(217,164,65,.2),rgba(217,164,65,.06))] font-semibold text-[#efb34b] transition hover:bg-[#d9a441]/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e7a52d]"><Plus className="size-4" /> Începe o sesiune</button>
          </div>
        )}
      </div>
    </article>
  );
}

function RemainingTime({ endsAt }: { endsAt: string }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 1_000);
    return () => window.clearInterval(interval);
  }, []);

  const remainingSeconds = Math.max(0, Math.ceil((new Date(endsAt).getTime() - now) / 1_000));
  return <p className="mt-3 inline-flex items-center gap-2 rounded-lg border border-[#d9a441]/25 bg-black/25 px-3 py-2 text-xs font-medium text-[#f0b54a]"><span className="text-white/46">Timp rămas</span>{formatDuration(remainingSeconds)}</p>;
}

export function MovieNightCard({ event, onSchedule }: { event?: SessionRecord; onSchedule: () => void }) {
  return (
    <article className="relative flex min-h-[385px] flex-col overflow-hidden rounded-[24px] border border-[#d9a441]/28 bg-[radial-gradient(circle_at_80%_12%,rgba(217,164,65,.13),transparent_28%),linear-gradient(145deg,rgba(43,35,25,.88),rgba(16,16,17,.95))] p-6 shadow-[0_20px_48px_rgba(0,0,0,.28)] xl:min-h-[600px]">
      <button type="button" onClick={onSchedule} aria-label="Programează noapte de film" className="absolute left-6 top-6 grid size-16 cursor-pointer place-items-center rounded-2xl border border-[#d9a441]/45 bg-[#241c12]/80 text-[#e7a52d] transition hover:bg-[#d9a441]/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e7a52d]"><Image src="/assets/plus.svg" alt="" width={32} height={32} className="size-8" /></button>
      <div className="flex flex-1 items-center justify-center pt-14 text-center">
        <div className="max-w-[280px]">
          <div className="mx-auto grid size-[150px] place-items-center rounded-[26px] border border-[#d9a441]/35 bg-[#221a10]/75 shadow-[0_0_34px_rgba(217,164,65,.1)]"><Image src="/assets/movie.svg" alt="" width={78} height={78} className="size-[78px]" /></div>
          <h2 className="mt-6 text-3xl font-bold tracking-[-.035em] text-white">Noapte film</h2>
          {event ? <><span className="mt-3 inline-flex rounded-full border border-sky-300/35 bg-sky-300/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-sky-100">PROGRAMATĂ</span><p className="mt-4 font-semibold text-white">{event.title}</p><p className="mt-2 flex justify-center gap-2 text-sm text-white/65"><CalendarClock className="size-4 text-[#e7a52d]" />{formatOraDate(event.starts_at)} · {formatOraTime(event.starts_at)}</p>{event.description ? <p className="mt-3 line-clamp-2 text-sm text-white/54">{event.description}</p> : null}</> : <><span className="mt-3 inline-flex rounded-full border border-white/20 bg-black/20 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white/65">LIBER</span><p className="mt-4 text-sm text-white/48">Niciun eveniment programat.</p></>}
        </div>
      </div>
      <button type="button" onClick={onSchedule} className="mt-6 h-12 w-full cursor-pointer rounded-xl border border-[#e5a631]/70 bg-[linear-gradient(135deg,rgba(217,164,65,.2),rgba(217,164,65,.06))] font-semibold text-[#efb34b] transition hover:bg-[#d9a441]/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e7a52d]">{event ? "Programează alta" : "Programează"}</button>
    </article>
  );
}
