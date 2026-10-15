"use client";

import type { MouseEvent, ReactNode } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ArrowLeft, History, RotateCcw } from "lucide-react";
import {
  useDashboardActiveSessions,
  useDashboardHistory,
  useDashboardHistoryCounts,
  useDashboardOverview,
  useDashboardSessionActions,
  useDashboardStations,
} from "@/hooks/useDashboardQueries";
import type { DeviceType, HistoryFilter } from "@/lib/dashboard/types";
import { ActiveSessionCard, ActiveSessionSkeleton } from "./ActiveSessionCard";
import { DashboardHeader } from "./DashboardHeader";
import { DashboardStats, DashboardStatsSkeleton } from "./DashboardStats";
import { SessionHistory } from "./SessionHistory";
import { DashboardAtmosphere } from "./DashboardAtmosphere";

export function Dashboard({ firstName, historyView }: { firstName: string; historyView: boolean }) {
  const dashboardRef = useRef<HTMLDivElement>(null);
  const viewAnimationReadyRef = useRef(false);
  const synchronizedSessionIdsRef = useRef<Set<string> | null>(null);
  const overview = useDashboardOverview();
  const stations = useDashboardStations();
  const activeSessions = useDashboardActiveSessions();
  const historyCounts = useDashboardHistoryCounts();
  const sessionActions = useDashboardSessionActions();
  const [historyFilter, setHistoryFilter] = useState<HistoryFilter>(null);
  const [expiredSessionIds, setExpiredSessionIds] = useState<Set<string>>(() => new Set());
  const history = useDashboardHistory(historyFilter);
  const refetchOverview = overview.refetch;
  const refetchStations = stations.refetch;
  const refetchActiveSessions = activeSessions.refetch;
  const refetchHistory = history.refetch;
  const refetchHistoryCounts = historyCounts.refetch;

  const availableTypes = useMemo(() => new Set(
    (stations.data ?? []).map((station) => station.device_type as DeviceType),
  ), [stations.data]);

  const visibleActiveSessions = useMemo(() => (activeSessions.data ?? []).filter((session) => (
    session.session_status === "paused"
    || (session.remaining_seconds > 0 && !expiredSessionIds.has(session.session_id))
  )), [activeSessions.data, expiredSessionIds]);

  const visibleOverview = useMemo(() => {
    if (!overview.data || activeSessions.data === null) return overview.data;

    const occupiedByType = new Map<DeviceType, Set<string>>();
    visibleActiveSessions.forEach((session) => {
      const occupiedDevices = occupiedByType.get(session.device_type) ?? new Set<string>();
      occupiedDevices.add(session.device_id);
      occupiedByType.set(session.device_type, occupiedDevices);
    });

    return {
      ...overview.data,
      active_sessions: visibleActiveSessions.length,
      pc_occupied: occupiedByType.get("pc")?.size ?? 0,
      ps5_occupied: occupiedByType.get("ps5")?.size ?? 0,
      xbox_occupied: occupiedByType.get("xbox")?.size ?? 0,
      cinema_occupied: occupiedByType.get("cinema")?.size ?? 0,
    };
  }, [activeSessions.data, overview.data, visibleActiveSessions]);

  const refreshRelatedDashboardData = useCallback(() => Promise.all([
    refetchOverview(),
    refetchStations(),
    refetchHistory(),
    refetchHistoryCounts(),
  ]), [refetchHistory, refetchHistoryCounts, refetchOverview, refetchStations]);

  const refreshLiveData = useCallback((expiredSessionId: string) => {
    setExpiredSessionIds((current) => {
      const next = new Set(current);
      next.add(expiredSessionId);
      return next;
    });

    void refetchActiveSessions();
  }, [refetchActiveSessions]);

  const updateSession = useCallback(async (sessionId: string, action: "extend-30" | "extend-60" | "finish") => {
    if (action === "finish") await sessionActions.finish(sessionId);
    else await sessionActions.extend(sessionId, action === "extend-30" ? 30 : 60);
    await Promise.all([
      refetchActiveSessions(),
      refetchOverview(),
      refetchStations(),
      refetchHistory(),
      refetchHistoryCounts(),
    ]);
  }, [refetchActiveSessions, refetchHistory, refetchHistoryCounts, refetchOverview, refetchStations, sessionActions]);

  useEffect(() => {
    if (activeSessions.loading || activeSessions.error || activeSessions.data === null) return;

    const currentSessionIds = new Set(activeSessions.data.map((session) => session.session_id));
    const previousSessionIds = synchronizedSessionIdsRef.current;
    const sessionsChanged = previousSessionIds === null
      || previousSessionIds.size !== currentSessionIds.size
      || Array.from(previousSessionIds).some((sessionId) => !currentSessionIds.has(sessionId));

    synchronizedSessionIdsRef.current = currentSessionIds;
    if (sessionsChanged) void refreshRelatedDashboardData();
  }, [activeSessions.data, activeSessions.error, activeSessions.loading, refreshRelatedDashboardData]);

  useGSAP(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timeline = gsap.timeline({ defaults: { ease: "power3.out" } });
    timeline
      .fromTo("[data-dashboard-header]", { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.68 })
      .fromTo("[data-stat-card]", { autoAlpha: 0, y: 18, scale: 0.985 }, {
        autoAlpha: 1,
        y: 0,
        scale: 1,
        duration: 0.68,
        stagger: 0.075,
      }, "-=0.42")
      .fromTo("[data-dashboard-section-title]", { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.55 }, "-=0.34")
      .fromTo("[data-dashboard-body]", { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.62 }, "-=0.34");
    return () => timeline.kill();
  }, { scope: dashboardRef });

  useGSAP(() => {
    if (!viewAnimationReadyRef.current) {
      viewAnimationReadyRef.current = true;
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.fromTo("[data-dashboard-view]", { autoAlpha: 0, y: 10 }, {
      autoAlpha: 1,
      y: 0,
      duration: 0.52,
      ease: "power3.out",
      clearProps: "opacity,visibility,transform",
    });
  }, { scope: dashboardRef, dependencies: [historyView] });

  return (
    <div ref={dashboardRef} className="relative min-h-[calc(100dvh-4rem)]">
      <DashboardAtmosphere />
      <div className="relative z-10 mx-auto w-full max-w-[1164px] px-4 py-5 sm:px-5 sm:py-6 xl:px-0 xl:py-7">
        <div data-dashboard-header><DashboardHeader firstName={firstName} /></div>

        <div data-dashboard-stats className="mt-5">
          {overview.loading ? <DashboardStatsSkeleton /> : overview.error || !visibleOverview ? (
            <DashboardError message="Statisticile nu au putut fi încărcate." onRetry={overview.refetch} />
          ) : <DashboardStats overview={visibleOverview} />}
        </div>

        {stations.error ? (
          <div className="mt-4 flex items-center justify-between rounded-xl border border-amber-400/15 bg-amber-950/10 px-4 py-3 text-xs text-white/55">
            <span>Starea stațiilor nu a putut fi actualizată.</span>
            <button type="button" onClick={stations.refetch} className="cursor-pointer text-[#e7a52d]">Reîncearcă</button>
          </div>
        ) : null}

        <div key={historyView ? "history" : "standard"} data-dashboard-view className="mt-7 pb-9">
          {historyView ? (
            <FullHistory
              history={history}
              counts={historyCounts.data}
              availableTypes={availableTypes}
              filter={historyFilter}
              onFilterChange={setHistoryFilter}
            />
          ) : (
            <StandardDashboard
              activeSessions={{ ...activeSessions, data: visibleActiveSessions }}
              history={history}
              historyCounts={historyCounts.data}
              availableTypes={availableTypes}
              historyFilter={historyFilter}
              onHistoryFilterChange={setHistoryFilter}
              onExpire={refreshLiveData}
              onUpdateSession={updateSession}
            />
          )}
        </div>
      </div>
    </div>
  );
}

type HistoryState = ReturnType<typeof useDashboardHistory>;
type ActiveState = ReturnType<typeof useDashboardActiveSessions>;

function StandardDashboard({
  activeSessions,
  history,
  historyCounts,
  availableTypes,
  historyFilter,
  onHistoryFilterChange,
  onExpire,
  onUpdateSession,
}: {
  activeSessions: ActiveState;
  history: HistoryState;
  historyCounts: ReturnType<typeof useDashboardHistoryCounts>["data"];
  availableTypes: Set<DeviceType>;
  historyFilter: HistoryFilter;
  onHistoryFilterChange: (filter: HistoryFilter) => void;
  onExpire: (sessionId: string) => void;
  onUpdateSession: (sessionId: string, action: "extend-30" | "extend-60" | "finish") => Promise<void>;
}) {
  const sessions = activeSessions.data ?? [];
  const showEmpty = !activeSessions.loading && !activeSessions.error && sessions.length === 0;

  return (
    <section>
      <div data-dashboard-section-title className="mb-5 flex items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-white sm:text-2xl">Sesiuni <span className="text-[#e7a52d]">active</span></h2>
        {sessions.length > 0 ? (
          <DashboardViewLink href="/dashboard?view=history" className="inline-flex items-center gap-2 text-sm font-medium text-white/55 transition-colors duration-300 hover:text-[#e7a52d] focus-visible:outline-none focus-visible:text-[#e7a52d]">
            <History className="size-4" /> Istoric
          </DashboardViewLink>
        ) : null}
      </div>

      <div data-dashboard-body>
        {activeSessions.error ? (
          <DashboardError message="Sesiunile active nu au putut fi încărcate." onRetry={activeSessions.refetch} />
        ) : activeSessions.loading ? (
          <div className="grid gap-5 xl:grid-cols-2"><ActiveSessionSkeleton /><ActiveSessionSkeleton /></div>
        ) : showEmpty ? (
          <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(420px,520px)]">
            <div className="ora-glass-panel rounded-[20px] border border-[#d9a441]/24 bg-[linear-gradient(135deg,rgba(49,43,36,.62),rgba(18,19,21,.7))] p-5 shadow-[0_18px_48px_rgba(0,0,0,.2),inset_0_1px_0_rgba(255,255,255,.035)]">
              <p className="font-semibold text-white/90">Nici o sesiune activă</p>
              <p className="mt-2 text-sm text-white/48">Nu ai nici o sesiune activă la moment! <span className="text-[#e7a52d]">Chill Out!</span></p>
            </div>
            <SessionHistory
              variant="compact"
              items={history.items}
              counts={historyCounts}
              filter={historyFilter}
              availableTypes={availableTypes}
              loading={history.loading}
              error={history.error}
              page={history.page}
              pageCount={history.pageCount}
              hasPreviousPage={history.hasPreviousPage}
              hasNextPage={history.hasNextPage}
              onFilterChange={onHistoryFilterChange}
              onPreviousPage={history.previousPage}
              onNextPage={history.nextPage}
              onRetry={history.refetch}
            />
          </div>
        ) : (
          <div className="grid gap-6 xl:grid-cols-2">
            {sessions.map((session) => {
              const isOnlyActiveSession = sessions.length === 1;
              return (
                <div key={session.session_id} className={isOnlyActiveSession ? "xl:col-span-2 xl:mx-auto xl:w-full xl:max-w-[900px]" : undefined}>
                  <ActiveSessionCard session={session} onExpire={onExpire} onUpdate={onUpdateSession} featured={isOnlyActiveSession} />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

function FullHistory({ history, counts, availableTypes, filter, onFilterChange }: {
  history: HistoryState;
  counts: ReturnType<typeof useDashboardHistoryCounts>["data"];
  availableTypes: Set<DeviceType>;
  filter: HistoryFilter;
  onFilterChange: (filter: HistoryFilter) => void;
}) {
  return (
    <section>
      <div data-dashboard-section-title className="mb-5 flex items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-white sm:text-2xl">Istoric <span className="text-[#e7a52d]">Sesiuni</span></h2>
        <DashboardViewLink href="/dashboard" className="inline-flex items-center gap-2 text-sm font-medium text-white/55 transition-colors hover:text-[#e7a52d]"><ArrowLeft className="size-4" /> Înapoi</DashboardViewLink>
      </div>
      <div data-dashboard-body>
        <SessionHistory
          variant="full"
          items={history.items}
          counts={counts}
          filter={filter}
          availableTypes={availableTypes}
          loading={history.loading}
          error={history.error}
          page={history.page}
          pageCount={history.pageCount}
          hasPreviousPage={history.hasPreviousPage}
          hasNextPage={history.hasNextPage}
          onFilterChange={onFilterChange}
          onPreviousPage={history.previousPage}
          onNextPage={history.nextPage}
          onRetry={history.refetch}
        />
      </div>
    </section>
  );
}

function DashboardError({ message, onRetry }: { message: string; onRetry: () => Promise<void> }) {
  return (
    <div className="grid min-h-28 place-items-center rounded-[18px] border border-red-400/15 bg-red-950/10 text-center">
      <div>
        <p className="text-sm text-white/65">{message}</p>
        <button type="button" onClick={() => void onRetry()} className="mt-3 inline-flex cursor-pointer items-center gap-2 text-sm text-[#e7a52d]"><RotateCcw className="size-4" /> Încearcă din nou</button>
      </div>
    </div>
  );
}

function DashboardViewLink({ href, className, children }: { href: string; className: string; children: ReactNode }) {
  const router = useRouter();

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      router.push(href, { scroll: false });
      return;
    }
    const view = event.currentTarget.closest<HTMLElement>("[data-dashboard-view]");
    if (!view) {
      router.push(href, { scroll: false });
      return;
    }
    gsap.to(view, {
      autoAlpha: 0,
      y: -8,
      duration: 0.22,
      ease: "power2.in",
      onComplete: () => router.push(href, { scroll: false }),
    });
  };

  return (
    <Link href={href} onClick={handleClick} className={className}>{children}</Link>
  );
}

