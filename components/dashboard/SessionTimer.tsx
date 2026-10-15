"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { formatDuration } from "@/lib/dashboard/format";

type SessionTimerProps = {
  endsAt: string;
  totalSeconds: number;
  serverRemainingSeconds: number;
  paused: boolean;
  onExpire: () => void;
};

export function SessionTimer({ endsAt, totalSeconds, serverRemainingSeconds, paused, onExpire }: SessionTimerProps) {
  const [now, setNow] = useState(() => Date.now());
  const expiredRef = useRef(false);
  const endTimestamp = useMemo(() => new Date(endsAt).getTime(), [endsAt]);

  useEffect(() => {
    if (paused) return;
    const interval = window.setInterval(() => setNow(Date.now()), 1_000);
    return () => window.clearInterval(interval);
  }, [paused]);

  const remaining = paused
    ? Math.max(0, serverRemainingSeconds)
    : Number.isFinite(endTimestamp)
      ? Math.max(0, Math.ceil((endTimestamp - now) / 1_000))
      : Math.max(0, serverRemainingSeconds);
  const progress = totalSeconds > 0 ? Math.min(1, Math.max(0, remaining / totalSeconds)) : 0;
  const radius = 67;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    if (remaining > 0) {
      expiredRef.current = false;
      return;
    }
    if (!expiredRef.current) {
      expiredRef.current = true;
      onExpire();
    }
  }, [onExpire, remaining]);

  return (
    <div className="relative grid size-[168px] shrink-0 place-items-center rounded-full bg-[radial-gradient(circle,rgba(108,78,35,.72),rgba(31,27,22,.98)_68%)] shadow-[0_0_34px_rgba(229,158,42,.2),inset_0_0_30px_rgba(217,164,65,.12)]">
      <svg className="absolute inset-0 size-full -rotate-90" viewBox="0 0 168 168" aria-hidden="true">
        <circle cx="84" cy="84" r={radius} fill="none" stroke="rgba(217,164,65,.17)" strokeWidth="8" />
        <circle
          cx="84"
          cy="84"
          r={radius}
          fill="none"
          stroke="#efaa36"
          strokeLinecap="round"
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - progress)}
          className="transition-[stroke-dashoffset] duration-700 ease-linear [filter:drop-shadow(0_0_7px_rgba(239,170,54,.65))]"
        />
      </svg>
      <div className="relative text-center">
        <p className="text-[1.65rem] font-medium tracking-[-0.03em] text-white">{formatDuration(remaining)}</p>
        <p className="mt-1 text-[11px] text-white/38">din {formatDuration(totalSeconds)}</p>
      </div>
    </div>
  );
}

