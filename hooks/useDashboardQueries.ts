"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type {
  DashboardActiveSession,
  DashboardHistoryItem,
  DashboardOverview,
  DashboardStation,
  HistoryCounts,
  HistoryFilter,
} from "@/lib/dashboard/types";

type QueryState<T> = {
  data: T | null;
  error: boolean;
  loading: boolean;
  refetch: () => Promise<void>;
};

function usePollingQuery<T>(query: () => Promise<T>, intervalMs: number | null): QueryState<T> {
  const queryRef = useRef(query);
  const [state, setState] = useState<{ data: T | null; error: boolean; loading: boolean }>({
    data: null,
    error: false,
    loading: true,
  });

  useEffect(() => {
    queryRef.current = query;
  }, [query]);

  const refetch = useCallback(async () => {
    try {
      const data = await queryRef.current();
      setState({ data, error: false, loading: false });
    } catch (error) {
      console.error("Dashboard RPC failed", error);
      setState((current) => ({ ...current, error: true, loading: false }));
    }
  }, []);

  useEffect(() => {
    void refetch();
    if (!intervalMs) return;
    const interval = window.setInterval(() => void refetch(), intervalMs);
    return () => window.clearInterval(interval);
  }, [intervalMs, refetch]);

  return { ...state, refetch };
}

function numeric(value: unknown) {
  return Number(value) || 0;
}

export function useDashboardOverview() {
  const supabase = useMemo(() => createClient(), []);
  const query = useCallback(async () => {
    const { data, error } = await supabase.rpc("get_crm_dashboard_overview");
    if (error) throw error;
    const row = (data?.[0] ?? null) as DashboardOverview | null;
    if (!row) {
      return {
        active_sessions: 0,
        pc_total: 0,
        pc_occupied: 0,
        ps5_total: 0,
        ps5_occupied: 0,
        xbox_total: 0,
        xbox_occupied: 0,
        cinema_total: 0,
        cinema_occupied: 0,
        revenue_today_mdl: 0,
      } satisfies DashboardOverview;
    }

    return Object.fromEntries(
      Object.entries(row).map(([key, value]) => [key, numeric(value)]),
    ) as DashboardOverview;
  }, [supabase]);

  return usePollingQuery(query, 12_000);
}

export function useDashboardStations() {
  const supabase = useMemo(() => createClient(), []);
  const query = useCallback(async () => {
    const { data, error } = await supabase.rpc("get_crm_dashboard_stations");
    if (error) throw error;
    return (data ?? []) as DashboardStation[];
  }, [supabase]);

  return usePollingQuery(query, 8_000);
}

export function useDashboardActiveSessions() {
  const supabase = useMemo(() => createClient(), []);
  const query = useCallback(async () => {
    const { data, error } = await supabase.rpc("get_crm_dashboard_active_sessions");
    if (error) throw error;
    return ((data ?? []) as DashboardActiveSession[]).map((session) => ({
      ...session,
      total_seconds: numeric(session.total_seconds),
      remaining_seconds: numeric(session.remaining_seconds),
    }));
  }, [supabase]);

  return usePollingQuery(query, 8_000);
}

export function useDashboardSessionActions() {
  const supabase = useMemo(() => createClient(), []);

  const extend = useCallback(async (sessionId: string, minutes: 30 | 60) => {
    const { error } = await supabase.rpc("extend_crm_gaming_session", {
      p_session_id: sessionId,
      p_minutes: minutes,
    });
    if (error) throw error;
  }, [supabase]);

  const finish = useCallback(async (sessionId: string) => {
    const { error } = await supabase.rpc("finish_crm_gaming_session", {
      p_session_id: sessionId,
      p_cancel: false,
    });
    if (error) throw error;
  }, [supabase]);

  return { extend, finish };
}

const HISTORY_PAGE_SIZE = 4;

export function useDashboardHistory(filter: HistoryFilter) {
  const supabase = useMemo(() => createClient(), []);
  const [items, setItems] = useState<DashboardHistoryItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchPage = useCallback(async (targetPage: number) => {
    setLoading(true);
    try {
      const { data, error: rpcError } = await supabase.rpc("get_crm_dashboard_history", {
        p_device_type: filter,
        p_limit: HISTORY_PAGE_SIZE,
        p_offset: targetPage * HISTORY_PAGE_SIZE,
      });
      if (rpcError) throw rpcError;
      const rawRows = (data ?? []) as DashboardHistoryItem[];
      const rows = rawRows.map((item) => ({
        ...item,
        duration_seconds: numeric(item.duration_seconds),
        earned_points: numeric(item.earned_points),
        amount_paid_mdl: numeric(item.amount_paid_mdl),
        total_count: numeric(item.total_count),
      }));
      setItems(rows);
      setTotal(rows[0]?.total_count ?? 0);
      setPage(targetPage);
      setError(false);
    } catch (rpcError) {
      console.error("Dashboard history RPC failed", rpcError);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [filter, supabase]);

  useEffect(() => {
    const timeout = window.setTimeout(() => void fetchPage(0), 0);
    return () => window.clearTimeout(timeout);
  }, [fetchPage]);

  const previousPage = useCallback(() => {
    if (page > 0) void fetchPage(page - 1);
  }, [fetchPage, page]);
  const nextPage = useCallback(() => {
    if ((page + 1) * HISTORY_PAGE_SIZE < total) void fetchPage(page + 1);
  }, [fetchPage, page, total]);
  const refetch = useCallback(() => fetchPage(page), [fetchPage, page]);

  return {
    items,
    total,
    page,
    pageCount: Math.max(1, Math.ceil(total / HISTORY_PAGE_SIZE)),
    loading,
    error,
    hasPreviousPage: page > 0,
    hasNextPage: (page + 1) * HISTORY_PAGE_SIZE < total,
    previousPage,
    nextPage,
    refetch,
  };
}

export function useDashboardHistoryCounts() {
  const supabase = useMemo(() => createClient(), []);
  const query = useCallback(async () => {
    const uniqueSessions = new Map<string, DashboardHistoryItem>();
    const pageSize = 200;
    let offset = 0;
    let total = Number.POSITIVE_INFINITY;

    while (offset < total) {
      const { data, error } = await supabase.rpc("get_crm_dashboard_history", {
        p_device_type: null,
        p_limit: pageSize,
        p_offset: offset,
      });
      if (error) throw error;

      const rows = (data ?? []) as DashboardHistoryItem[];
      if (rows.length === 0) break;
      total = numeric(rows[0]?.total_count);
      rows.forEach((row) => uniqueSessions.set(row.session_id, row));
      offset += rows.length;
    }

    const counts: HistoryCounts = { all: uniqueSessions.size, pc: 0, ps5: 0, xbox: 0, cinema: 0 };
    uniqueSessions.forEach((session) => {
      if (session.device_type in counts) counts[session.device_type] += 1;
    });
    return counts;
  }, [supabase]);

  return usePollingQuery(query, null);
}

