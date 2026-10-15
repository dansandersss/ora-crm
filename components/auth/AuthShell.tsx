"use client";

import { useRef, type ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { usePathname } from "next/navigation";
import { PremiumAuthBackground } from "./PremiumAuthBackground";

export function AuthShell({ children }: { children: ReactNode }) {
  const container = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useGSAP(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

    const timeline = gsap.timeline({ defaults: { ease: "power3.out" } })
        .from("[data-auth-logo]", { opacity: 0, y: 14, duration: .68 })
        .from("[data-auth-subtitle]", { opacity: 0, y: 8, duration: .48 }, "-=.38")
        .from("[data-auth-card]", { opacity: 0, y: 22, scale: .99, filter: "blur(6px)", duration: .82 }, "-=.2")
        .from("[data-auth-title]", { opacity: 0, y: 10, duration: .5 }, "-=.4")
        .from("[data-auth-description]", { opacity: 0, y: 8, duration: .45 }, "-=.3")
        .from("[data-auth-field]", { opacity: 0, y: 10, scale: .995, duration: .5, stagger: .065 }, "-=.2")
        .from("[data-auth-cta]", { opacity: 0, y: 8, scale: .99, duration: .5 }, "-=.12")
        .from("[data-auth-footer]", { opacity: 0, y: 6, duration: .42 }, "-=.22");

    return () => timeline.kill();
  }, { scope: container, dependencies: [pathname], revertOnUpdate: true });

  return (
    <div ref={container} className="relative min-h-dvh overflow-x-hidden text-[#f5f3ef]">
      <PremiumAuthBackground />
      <main className="relative z-10 flex min-h-dvh items-center justify-center px-4 py-8 sm:px-8 sm:py-12 lg:px-10 lg:py-14">
        <div className="flex w-full flex-col items-center">{children}</div>
      </main>
    </div>
  );
}
