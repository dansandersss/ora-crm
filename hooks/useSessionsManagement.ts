"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { SessionCustomer, SessionRecord, SessionStation } from "@/lib/sessions/types";

export function useSessionsManagement() {
  const supabase = useMemo(() => createClient(), []);
  const [records, setRecords] = useState<SessionRecord[]>([]);
  const [stations, setStations] = useState<SessionStation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      const [recordsResult, stationsResult] = await Promise.all([
        supabase.rpc("get_crm_sessions", { p_kind: null }),
        supabase.rpc("get_crm_session_stations"),
      ]);
      if (recordsResult.error) throw recordsResult.error;
      if (stationsResult.error) throw stationsResult.error;
      setRecords((recordsResult.data ?? []) as SessionRecord[]);
      setStations((stationsResult.data ?? []) as SessionStation[]);
      setError(null);
    } catch (reason) {
      console.error("Sessions data could not be loaded", reason);
      setError("Sesiunile nu au putut fi încărcate.");
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    const timeout = window.setTimeout(() => void refetch(), 0);
    return () => window.clearTimeout(timeout);
  }, [refetch]);

  const searchCustomers = useCallback(async (search: string) => {
    const { data, error: rpcError } = await supabase.rpc("get_crm_session_customers", { p_search: search || null });
    if (rpcError) throw rpcError;
    return (data ?? []) as SessionCustomer[];
  }, [supabase]);

  const createGamingSession = useCallback(async (input: {
    userId: string;
    stationId: string;
    startsAt: string;
    durationMinutes: number;
    startNow: boolean;
    participantIds: string[];
  }) => {
    const { error: rpcError } = await supabase.rpc("create_crm_gaming_session", {
      p_user_id: input.userId,
      p_device_id: input.stationId,
      p_starts_at: input.startsAt,
      p_duration_minutes: input.durationMinutes,
      p_start_now: input.startNow,
      p_participant_ids: input.participantIds,
    });
    if (rpcError) throw rpcError;
    await refetch();
  }, [refetch, supabase]);

  const recordGamingSession = useCallback(async (input: {
    userId: string;
    stationId: string;
    durationMinutes: number;
    participantIds: string[];
  }) => {
    const { error: rpcError } = await supabase.rpc("record_crm_gaming_session", {
      p_user_id: input.userId,
      p_device_id: input.stationId,
      p_duration_minutes: input.durationMinutes,
      p_participant_ids: input.participantIds,
    });
    if (rpcError) throw rpcError;
    await refetch();
  }, [refetch, supabase]);

  const createMovieNight = useCallback(async (input: { title: string; startsAt: string; description: string }) => {
    const { error: rpcError } = await supabase.rpc("create_crm_movie_night", {
      p_title: input.title,
      p_starts_at: input.startsAt,
      p_description: input.description || null,
    });
    if (rpcError) throw rpcError;
    await refetch();
  }, [refetch, supabase]);

  const finishGamingSession = useCallback(async (sessionId: string, cancel: boolean) => {
    const { error: rpcError } = await supabase.rpc("finish_crm_gaming_session", {
      p_session_id: sessionId,
      p_cancel: cancel,
    });
    if (rpcError) throw rpcError;
    await refetch();
  }, [refetch, supabase]);

  return { records, stations, loading, error, refetch, searchCustomers, createGamingSession, recordGamingSession, createMovieNight, finishGamingSession };
}
