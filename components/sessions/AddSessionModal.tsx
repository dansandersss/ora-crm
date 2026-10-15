"use client";

import { type FormEvent, useEffect, useMemo, useState } from "react";
import { CalendarDays, ChevronDown, Search, X } from "lucide-react";
import type { SessionCustomer, SessionStation } from "@/lib/sessions/types";

type Mode = "gaming" | "movie";

function initialDateTime() {
  const date = new Date(Date.now() + 30 * 60_000);
  date.setMinutes(Math.ceil(date.getMinutes() / 15) * 15, 0, 0);
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 16);
}

function readableError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  if (message.includes("CRM_DEVICE_CONFLICT")) return "Stația este deja rezervată în acest interval.";
  if (message.includes("CRM_STATION_UNAVAILABLE")) return "Stația nu mai este disponibilă.";
  if (message.includes("CRM_START_TIME_INVALID")) return "Alege o dată și o oră viitoare.";
  if (message.includes("CRM_EVENT_TIME_INVALID")) return "Alege o dată și o oră viitoare pentru eveniment.";
  return "Nu am putut salva. Verifică datele și încearcă din nou.";
}

export function AddSessionModal({
  open,
  initialMode,
  initialStartNow,
  preselectedStationId,
  stations,
  searchCustomers,
  onClose,
  onStartGaming,
  onRecordGaming,
  onCreateMovie,
  onSaved,
}: {
  open: boolean;
  initialMode: Mode;
  initialStartNow: boolean;
  preselectedStationId?: string;
  stations: SessionStation[];
  searchCustomers: (search: string) => Promise<SessionCustomer[]>;
  onClose: () => void;
  onStartGaming: (input: { userId: string; stationId: string; startsAt: string; durationMinutes: number; startNow: boolean; participantIds: string[] }) => Promise<void>;
  onRecordGaming: (input: { userId: string; stationId: string; durationMinutes: number; participantIds: string[] }) => Promise<void>;
  onCreateMovie: (input: { title: string; startsAt: string; description: string }) => Promise<void>;
  onSaved: (message: string) => void;
}) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [startNow, setStartNow] = useState(initialStartNow);
  const [startsAt, setStartsAt] = useState(initialDateTime);
  const [stationId, setStationId] = useState(preselectedStationId ?? "");
  const [durationMinutes, setDurationMinutes] = useState(120);
  const [customerSearch, setCustomerSearch] = useState("");
  const [customers, setCustomers] = useState<SessionCustomer[]>([]);
  const [primaryCustomer, setPrimaryCustomer] = useState<SessionCustomer | null>(null);
  const [withFriends, setWithFriends] = useState(false);
  const [participants, setParticipants] = useState<SessionCustomer[]>([]);
  const [movieTitle, setMovieTitle] = useState("");
  const [movieDescription, setMovieDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || mode !== "gaming") return;
    const id = window.setTimeout(() => {
      void searchCustomers(customerSearch).then(setCustomers).catch(() => setCustomers([]));
    }, 160);
    return () => window.clearTimeout(id);
  }, [customerSearch, mode, open, searchCustomers]);

  const selectableCustomers = useMemo(() => customers.filter((customer) => (
    customer.id !== primaryCustomer?.id && !participants.some((participant) => participant.id === customer.id)
  )), [customers, participants, primaryCustomer]);

  if (!open) return null;

  const selectCustomer = (customer: SessionCustomer) => {
    if (!primaryCustomer) setPrimaryCustomer(customer);
    else if (withFriends) setParticipants((current) => [...current, customer]);
    setCustomerSearch("");
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    if (mode === "gaming" && (!primaryCustomer || !stationId)) {
      setError("Alege un client și o stație.");
      return;
    }
    if (mode === "movie" && !movieTitle.trim()) {
      setError("Introdu tema serii.");
      return;
    }
    setSaving(true);
    try {
      if (mode === "gaming" && primaryCustomer) {
        if (startNow) {
          await onStartGaming({
            userId: primaryCustomer.id,
            stationId,
            startsAt: new Date(startsAt).toISOString(),
            durationMinutes,
            startNow: true,
            participantIds: participants.map((participant) => participant.id),
          });
          onSaved("Sesiunea a început.");
        } else {
          await onRecordGaming({
            userId: primaryCustomer.id,
            stationId,
            durationMinutes,
            participantIds: participants.map((participant) => participant.id),
          });
          onSaved("Sesiunea a fost adăugată în istoric.");
        }
      } else {
        await onCreateMovie({ title: movieTitle.trim(), startsAt: new Date(startsAt).toISOString(), description: movieDescription.trim() });
        onSaved("Noaptea de film a fost programată.");
      }
      onClose();
    } catch (reason) {
      setError(readableError(reason));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 p-3 backdrop-blur-sm sm:items-center sm:p-6" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !saving) onClose(); }}>
      <form onSubmit={submit} aria-modal="true" aria-labelledby="session-modal-title" role="dialog" className="max-h-[min(92dvh,760px)] w-full max-w-2xl overflow-y-auto rounded-[28px] border border-[#d9a441]/35 bg-[linear-gradient(145deg,#1d1a16,#111112)] p-5 shadow-[0_24px_90px_rgba(0,0,0,.62)] sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-[#e7a52d]">Sesiuni</p>
            <h2 id="session-modal-title" className="mt-1 text-2xl font-bold text-white">Adaugă o sesiune</h2>
          </div>
          <button type="button" onClick={onClose} disabled={saving} aria-label="Închide" className="grid size-10 cursor-pointer place-items-center rounded-xl border border-white/10 text-white/65 transition hover:bg-white/10 hover:text-white disabled:opacity-40"><X className="size-5" /></button>
        </div>

        <div className="relative mt-6 grid grid-cols-2 rounded-xl border border-[#d9a441]/20 bg-black/20 p-1">
          <span aria-hidden="true" className={`pointer-events-none absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-lg bg-[#e7a52d] shadow-[0_6px_16px_rgba(217,164,65,.22)] transition-transform duration-300 ease-out ${mode === "movie" ? "translate-x-full" : "translate-x-0"}`} />
          {(["gaming", "movie"] as const).map((value) => <button key={value} type="button" onClick={() => { setMode(value); setError(null); }} className={`relative z-10 h-10 cursor-pointer rounded-lg text-sm font-semibold transition-colors duration-300 ${mode === value ? "text-[#271805]" : "text-white/55 hover:text-white"}`}>{value === "gaming" ? "Sesiune de gaming" : "Noapte de film"}</button>)}
        </div>

        {mode === "gaming" ? (
          <div className="mt-6 space-y-5">
            <label className="block text-sm font-medium text-white/82">Client
              <div className="relative mt-2"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/38" /><input value={customerSearch} onChange={(event) => setCustomerSearch(event.target.value)} placeholder={primaryCustomer ? "Caută participanți" : "Caută după nume sau telefon"} className="h-11 w-full rounded-xl border border-white/12 bg-black/25 pl-10 pr-3 text-sm text-white outline-none transition placeholder:text-white/34 focus:border-[#e7a52d]/70" /></div>
            </label>
            {primaryCustomer ? <SelectedCustomer customer={primaryCustomer} label="Client principal" onRemove={() => setPrimaryCustomer(null)} /> : null}
            {customerSearch ? <div className="max-h-36 overflow-y-auto rounded-xl border border-white/10 bg-[#151515] p-1">{selectableCustomers.length ? selectableCustomers.map((customer) => <button key={customer.id} type="button" onClick={() => selectCustomer(customer)} className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm hover:bg-white/[.06]"><span className="text-white">{customer.full_name}</span><span className="text-white/45">{customer.phone ?? "—"}</span></button>) : <p className="px-3 py-3 text-sm text-white/45">Nu am găsit un client.</p>}</div> : null}

            <label className="block text-sm font-medium text-white/82">Stație de gaming
              <select value={stationId} onChange={(event) => setStationId(event.target.value)} className="mt-2 h-11 w-full cursor-pointer rounded-xl border border-white/12 bg-[#171717] px-3 text-sm text-white outline-none focus:border-[#e7a52d]/70"><option value="">Alege stația</option>{stations.map((station) => <option key={station.device_id} value={station.device_id} disabled={startNow && station.availability !== "available"}>{station.name} · {station.availability === "available" ? "liberă" : station.availability === "reserved" ? "rezervată" : "ocupată"}</option>)}</select>
            </label>
            <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[.035] p-3"><div><p className="text-sm font-medium text-white">Începe acum</p><p className="mt-0.5 text-xs text-white/45">Când este oprit, sesiunea se adaugă direct în istoric.</p></div><button type="button" role="switch" aria-checked={startNow} onClick={() => setStartNow((current) => !current)} className={`relative h-6 w-11 cursor-pointer rounded-full transition-colors duration-300 ease-out ${startNow ? "bg-[#e7a52d]" : "bg-white/15"}`}><span className={`absolute left-1 top-1 size-4 rounded-full bg-white shadow-sm transition-transform duration-300 ease-out ${startNow ? "translate-x-5" : "translate-x-0"}`} /></button></div>
            <DurationSelect value={durationMinutes} onChange={setDurationMinutes} />

            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-white/[.035] p-3 text-sm text-white"><input type="checkbox" checked={withFriends} onChange={(event) => { setWithFriends(event.target.checked); if (!event.target.checked) setParticipants([]); }} className="size-4 accent-[#e7a52d]" /> Te joci cu prietenii?</label>
            {withFriends ? <p className="-mt-2 text-xs text-white/48">Caută și selectează participanții în câmpul de client de mai sus.</p> : null}
            {withFriends && participants.length ? <div className="flex flex-wrap gap-2">{participants.map((customer) => <SelectedCustomer key={customer.id} customer={customer} label="Participant" onRemove={() => setParticipants((current) => current.filter((participant) => participant.id !== customer.id))} compact />)}</div> : null}
          </div>
        ) : (
          <div className="mt-6 space-y-5"><label className="block text-sm font-medium text-white/82">Tema serii<input required value={movieTitle} onChange={(event) => setMovieTitle(event.target.value)} placeholder="ex. Seară fantasy" className="mt-2 h-11 w-full rounded-xl border border-white/12 bg-black/25 px-3 text-sm text-white outline-none placeholder:text-white/34 focus:border-[#e7a52d]/70" /></label><label className="block text-sm font-medium text-white/82">Data evenimentului și ora de început<div className="relative mt-2"><input required type="datetime-local" value={startsAt} onChange={(event) => setStartsAt(event.target.value)} className="h-11 w-full rounded-xl border border-white/12 bg-[#171717] px-3 pr-11 text-sm text-white outline-none focus:border-[#e7a52d]/70 [&::-webkit-calendar-picker-indicator]:opacity-0" /><CalendarDays className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-white/45" /></div></label><label className="block text-sm font-medium text-white/82">Descriere <span className="text-white/35">(opțional)</span><textarea value={movieDescription} onChange={(event) => setMovieDescription(event.target.value)} rows={3} placeholder="Detalii despre seară" className="mt-2 w-full resize-none rounded-xl border border-white/12 bg-black/25 px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/34 focus:border-[#e7a52d]/70" /></label></div>
        )}

        {error ? <p className="mt-5 rounded-xl border border-red-400/25 bg-red-500/10 px-3 py-2.5 text-sm text-red-200">{error}</p> : null}
        <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><button type="button" disabled={saving} onClick={onClose} className="h-11 cursor-pointer rounded-xl px-5 text-sm font-medium text-white/62 transition hover:bg-white/[.06] disabled:opacity-40">Anulează</button><button type="submit" disabled={saving} className="h-11 cursor-pointer rounded-xl bg-[linear-gradient(135deg,#d99a2c,#f4ba4b)] px-5 text-sm font-bold text-[#261705] shadow-[0_7px_24px_rgba(217,164,65,.24)] transition hover:brightness-110 disabled:cursor-wait disabled:opacity-60">{saving ? "Se salvează…" : mode === "movie" ? "Programează evenimentul" : startNow ? "Începe sesiunea" : "Adaugă în istoric"}</button></div>
      </form>
    </div>
  );
}

function DurationSelect({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  return <label className="block text-sm font-medium text-white/82">Durata<div className="relative mt-2"><select value={value} onChange={(event) => onChange(Number(event.target.value))} className="h-11 w-full cursor-pointer appearance-none rounded-xl border border-white/12 bg-[#171717] px-3 pr-11 text-sm text-white outline-none focus:border-[#e7a52d]/70"><option value={30}>30 minute</option><option value={60}>1 oră</option><option value={120}>2 ore</option><option value={180}>3 ore</option></select><ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-white/45" /></div></label>;
}

function SelectedCustomer({ customer, label, onRemove, compact = false }: { customer: SessionCustomer; label: string; onRemove: () => void; compact?: boolean }) {
  return <div className={`flex items-center gap-2 rounded-xl border border-[#d9a441]/25 bg-[#d9a441]/[.08] ${compact ? "px-2.5 py-2" : "justify-between px-3 py-2.5"}`}><div className="min-w-0"><p className="text-xs text-[#e7a52d]">{label}</p><p className="truncate text-sm font-medium text-white">{customer.full_name} <span className="font-normal text-white/45">{customer.phone ?? ""}</span></p></div><button type="button" aria-label={`Elimină ${customer.full_name}`} onClick={onRemove} className="grid size-7 shrink-0 cursor-pointer place-items-center rounded-lg text-white/55 hover:bg-white/10 hover:text-white"><X className="size-4" /></button></div>;
}
