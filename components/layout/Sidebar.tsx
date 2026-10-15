"use client";

import { useRef, useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { StaffRole } from "@/lib/auth/types";
import { cn } from "@/lib/utils";

const SIDEBAR_STORAGE_KEY = "ora-sidebar-collapsed";
const SIDEBAR_STORAGE_EVENT = "ora-sidebar-state-change";
const EXPANDED_WIDTH = 236;
const COLLAPSED_WIDTH = 80;

type NavigationItem = {
  href: string;
  label: string;
  iconPath: string;
};

const navigationItems: NavigationItem[] = [
  { href: "/dashboard", label: "Acasă", iconPath: "/assets/home-icon.svg" },
  { href: "/sessions", label: "Sesiuni", iconPath: "/assets/sessions-icon.svg" },
  { href: "/clients", label: "Clienți", iconPath: "/assets/clients-icon.svg" },
  { href: "/content", label: "Conținut", iconPath: "/assets/content-icon.svg" },
  { href: "/statistics", label: "Statistici", iconPath: "/assets/stats-icon.svg" },
  { href: "/more", label: "Mai mult", iconPath: "/assets/more-icon.svg" },
];

const roleLabels: Record<StaffRole, string> = {
  owner: "Proprietar",
  admin: "Administrator",
  reception: "Recepție",
};

type SidebarProps = {
  firstName: string;
  role: StaffRole;
};

function isActiveRoute(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

function subscribeToSidebarState(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(SIDEBAR_STORAGE_EVENT, onStoreChange);

  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(SIDEBAR_STORAGE_EVENT, onStoreChange);
  };
}

function getCollapsedSnapshot() {
  const savedState = window.localStorage.getItem(SIDEBAR_STORAGE_KEY);
  return savedState === null ? window.innerWidth < 1024 : savedState === "true";
}

function getExpandedServerSnapshot() {
  return false;
}

function subscribeToHydration() {
  return () => undefined;
}

function SidebarIcon({ src }: { src: string }) {
  return (
    <span
      aria-hidden="true"
      className="size-5 shrink-0 bg-current"
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

export function Sidebar({ firstName, role }: SidebarProps) {
  const pathname = usePathname();
  const sidebarRef = useRef<HTMLElement>(null);
  const animationReadyRef = useRef(false);
  const collapsed = useSyncExternalStore(
    subscribeToSidebarState,
    getCollapsedSnapshot,
    getExpandedServerSnapshot,
  );
  const hydrated = useSyncExternalStore(subscribeToHydration, () => true, () => false);

  useGSAP(() => {
    if (!hydrated || !sidebarRef.current) return;

    const labels = sidebarRef.current.querySelectorAll<HTMLElement>("[data-sidebar-label]");
    const fullLogo = sidebarRef.current.querySelector<HTMLElement>("[data-sidebar-logo-full]");
    const compactLogo = sidebarRef.current.querySelector<HTMLElement>("[data-sidebar-logo-compact]");
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!animationReadyRef.current || prefersReducedMotion) {
      gsap.set(sidebarRef.current, { width: collapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH });
      gsap.set(labels, {
        display: collapsed ? "none" : "block",
        autoAlpha: collapsed ? 0 : 1,
        x: collapsed ? -4 : 0,
      });
      gsap.set(fullLogo, { autoAlpha: collapsed ? 0 : 1 });
      gsap.set(compactLogo, { autoAlpha: collapsed ? 1 : 0 });
      animationReadyRef.current = true;
      return;
    }

    const timeline = gsap.timeline({
      defaults: { ease: "power2.out", overwrite: "auto" },
      onStart: () => {
        gsap.set(sidebarRef.current, { willChange: "width" });
      },
      onComplete: () => {
        gsap.set(sidebarRef.current, { clearProps: "willChange" });
      },
    });

    if (collapsed) {
      timeline
        .to(labels, { autoAlpha: 0, x: -4, duration: 0.14 }, 0)
        .to(fullLogo, { autoAlpha: 0, duration: 0.16 }, 0)
        .to(compactLogo, { autoAlpha: 1, duration: 0.2 }, 0.12)
        .to(sidebarRef.current, { width: COLLAPSED_WIDTH, duration: 0.44 }, 0)
        .set(labels, { display: "none" });
    } else {
      timeline
        .set(labels, { display: "block" }, 0)
        .to(sidebarRef.current, { width: EXPANDED_WIDTH, duration: 0.44 }, 0)
        .to(compactLogo, { autoAlpha: 0, duration: 0.14 }, 0)
        .to(fullLogo, { autoAlpha: 1, duration: 0.2 }, 0.12)
        .to(labels, { autoAlpha: 1, x: 0, duration: 0.22 }, 0.12);
    }

    return () => {
      timeline.kill();
      gsap.set(sidebarRef.current, { clearProps: "willChange" });
    };
  }, { scope: sidebarRef, dependencies: [collapsed, hydrated] });

  const toggleSidebar = () => {
    const nextState = !collapsed;
    window.localStorage.setItem(SIDEBAR_STORAGE_KEY, String(nextState));
    window.dispatchEvent(new Event(SIDEBAR_STORAGE_EVENT));
  };

  const displayFirstName = firstName.trim() || "Daniel";
  const initial = displayFirstName.charAt(0).toLocaleUpperCase("ro-RO");

  return (
    <aside
      ref={sidebarRef}
      className="sticky top-0 z-30 flex h-dvh w-[236px] shrink-0 flex-col overflow-visible border-r border-[#d9a441]/35 bg-[linear-gradient(155deg,#181819,#0a0a0b)] text-white shadow-[18px_0_55px_rgba(0,0,0,.34),inset_-1px_0_0_rgba(255,193,77,.025)]"
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-r-[28px]">
        <div className="absolute -right-20 top-10 size-48 rounded-full bg-[#d9a441]/[.055] blur-3xl" />
        <div className="absolute bottom-24 left-4 size-28 rounded-full bg-[#ad7420]/[.035] blur-3xl" />
      </div>

      <button
        type="button"
        onClick={toggleSidebar}
        aria-label={collapsed ? "Extinde meniul lateral" : "Restrânge meniul lateral"}
        aria-expanded={!collapsed}
        className="absolute -right-[18px] top-[76px] z-40 grid size-9 cursor-pointer place-items-center rounded-full border border-[#ffd270]/85 bg-[linear-gradient(145deg,#f2bd55_0%,#d99d35_55%,#b97818_100%)] text-[#211506] shadow-[0_8px_24px_rgba(0,0,0,.5),0_0_20px_rgba(217,164,65,.24),inset_0_1px_0_rgba(255,255,255,.5)] transition-[filter,box-shadow,transform] duration-300 ease-out hover:scale-105 hover:brightness-110 hover:shadow-[0_10px_28px_rgba(0,0,0,.52),0_0_25px_rgba(217,164,65,.35),inset_0_1px_0_rgba(255,255,255,.55)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f0b13c] focus-visible:ring-offset-2 focus-visible:ring-offset-[#101011] active:scale-95"
      >
        {collapsed ? (
          <ChevronRight className="size-[18px]" strokeWidth={2.4} />
        ) : (
          <ChevronLeft className="size-[18px]" strokeWidth={2.4} />
        )}
      </button>

      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-tr-[28px]">
        <div className="relative mx-4 mt-5 h-[82px] shrink-0">
          <div
            data-sidebar-logo-full
            className="absolute inset-0 flex origin-center items-center justify-center"
          >
            <Image
              src="/assets/main-logo.svg"
              alt="ORA Project"
              width={248}
              height={137}
              priority
              className="h-auto w-[112px]"
            />
          </div>

          <div
            data-sidebar-logo-compact
            className="invisible absolute inset-0 flex origin-center items-center justify-center opacity-0"
            aria-hidden={!collapsed}
          >
            <Image
              src="/assets/short-logo.svg"
              alt=""
              width={24}
              height={37}
              className="h-[44px] w-auto"
            />
          </div>
        </div>

        <nav className="relative mt-4 flex flex-col gap-2 px-4" aria-label="Navigare principală">
          {navigationItems.map((item) => {
            const active = isActiveRoute(pathname, item.href);

            return (
              <div key={item.href} className="group relative">
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  aria-label={item.label}
                  className={cn(
                    "flex h-11 items-center gap-3 overflow-hidden rounded-xl border px-[14px] text-[15px] font-medium transition-[color,background-color,border-color,box-shadow] duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e7ad42]/70",
                    active
                      ? "border-[#dca63b]/65 bg-[linear-gradient(135deg,rgba(217,164,65,.14),rgba(255,255,255,.025))] text-[#edb548] shadow-[inset_0_1px_0_rgba(255,255,255,.07),0_0_22px_rgba(217,164,65,.1)]"
                      : "border-transparent text-white/55 hover:border-white/[.055] hover:bg-white/[.045] hover:text-white/78",
                  )}
                >
                  <SidebarIcon src={item.iconPath} />
                  <span
                    data-sidebar-label
                    aria-hidden={collapsed}
                    className="whitespace-nowrap"
                  >
                    {item.label}
                  </span>
                </Link>

                {collapsed ? (
                  <span
                    role="tooltip"
                    className="pointer-events-none absolute left-[58px] top-1/2 z-40 -translate-y-1/2 translate-x-1 whitespace-nowrap rounded-lg border border-[#d9a441]/20 bg-[#171411]/95 px-3 py-2 text-xs font-medium text-[#f3d49a] opacity-0 shadow-xl backdrop-blur-md transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100 group-focus-within:translate-x-0 group-focus-within:opacity-100"
                  >
                    {item.label}
                  </span>
                ) : null}
              </div>
            );
          })}
        </nav>

        <div className="relative mt-auto border-t border-[#d9a441]/20 px-2 py-5">
          <div className="flex h-[58px] items-center gap-3 overflow-hidden rounded-2xl px-1">
            <div className="grid size-11 shrink-0 place-items-center rounded-full border border-[#e5a631] bg-[#171717] text-base font-semibold text-[#f6f1e7] shadow-[0_0_22px_rgba(217,164,65,.13)]">
              {initial}
            </div>
            <div data-sidebar-label aria-hidden={collapsed} className="min-w-0 whitespace-nowrap">
              <p className="truncate text-[15px] font-semibold text-white/90">{displayFirstName}</p>
              <p className="mt-0.5 text-xs text-white/45">{roleLabels[role]}</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
