"use client";

import type { CSSProperties } from "react";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

const particles = [
  [7, 17, 0.46, 15, -8, 13],
  [18, 73, 0.22, 21, 9, 19],
  [27, 37, 0.55, 17, -11, 16],
  [35, 88, 0.3, 12, 7, 22],
  [43, 12, 0.26, 20, -6, 18],
  [52, 53, 0.48, 15, 12, 15],
  [61, 25, 0.3, 19, -10, 20],
  [68, 82, 0.4, 13, 8, 17],
  [75, 44, 0.2, 18, -7, 21],
  [82, 18, 0.42, 14, 10, 14],
  [88, 67, 0.26, 20, -9, 23],
  [94, 35, 0.5, 16, 6, 16],
] as const;

type ParticleStyle = CSSProperties & Record<`--${string}`, string>;

export function DashboardAtmosphere() {
  const atmosphereRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const root = atmosphereRef.current;
    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const glow = root.querySelector<HTMLElement>("[data-depth='glow']");
    const streaks = root.querySelector<HTMLElement>("[data-depth='streaks']");
    const dust = root.querySelector<HTMLElement>("[data-depth='dust']");
    if (!glow || !streaks || !dust) return;

    const moveGlowX = gsap.quickTo(glow, "x", { duration: 1.25, ease: "power3.out" });
    const moveGlowY = gsap.quickTo(glow, "y", { duration: 1.25, ease: "power3.out" });
    const moveStreakX = gsap.quickTo(streaks, "x", { duration: 1, ease: "power3.out" });
    const moveStreakY = gsap.quickTo(streaks, "y", { duration: 1, ease: "power3.out" });
    const moveDustX = gsap.quickTo(dust, "x", { duration: 0.9, ease: "power3.out" });
    const moveDustY = gsap.quickTo(dust, "y", { duration: 0.9, ease: "power3.out" });

    const handlePointerMove = (event: PointerEvent) => {
      const normalizedX = event.clientX / window.innerWidth - 0.5;
      const normalizedY = event.clientY / window.innerHeight - 0.5;
      moveGlowX(normalizedX * 12);
      moveGlowY(normalizedY * 8);
      moveStreakX(normalizedX * -8);
      moveStreakY(normalizedY * -5);
      moveDustX(normalizedX * 18);
      moveDustY(normalizedY * 12);
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      gsap.killTweensOf([glow, streaks, dust]);
    };
  }, { scope: atmosphereRef });

  return (
    <div ref={atmosphereRef} aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_17%_13%,rgba(190,116,25,.12),transparent_34%),radial-gradient(circle_at_82%_5%,rgba(222,151,40,.07),transparent_27%),linear-gradient(145deg,#0c0b0a_0%,#080808_49%,#0b0907_100%)]" />
      <div data-depth="glow" className="absolute inset-[-5%]">
        <div className="ambient-glow-a absolute -left-28 top-2 h-[520px] w-[520px] rounded-full bg-[#a66516]/[.1] blur-[105px]" />
        <div className="ambient-glow-b absolute right-[3%] top-[-22%] h-[520px] w-[520px] rounded-full bg-[#d68f22]/[.08] blur-[120px]" />
        <div className="absolute bottom-[-18%] left-[38%] h-[390px] w-[500px] rounded-full bg-[#7e4c18]/[.055] blur-[125px]" />
      </div>
      <div data-depth="streaks" className="absolute inset-[-4%] opacity-70">
        <div className="ambient-streak absolute left-[3%] top-[48%] h-px w-[78%] rotate-[-11deg] bg-gradient-to-r from-transparent via-[#d9a441]/18 to-transparent" />
        <div className="absolute -right-[8%] bottom-[13%] h-px w-[64%] rotate-[-14deg] bg-gradient-to-r from-transparent via-[#d9a441]/10 to-transparent" />
      </div>
      <div data-depth="dust" className="absolute inset-[-2%]">
        {particles.map(([left, top, opacity, duration, drift, delay], index) => (
          <span
            key={`${left}-${top}`}
            className="dashboard-dust absolute rounded-full bg-[#ffc35b]"
            style={{
              left: `${left}%`,
              top: `${top}%`,
              width: index % 4 === 0 ? 6 : 4,
              height: index % 4 === 0 ? 6 : 4,
              "--particle-opacity": String(opacity),
              "--particle-duration": `${duration}s`,
              "--particle-x": `${drift}px`,
              "--particle-delay": `${-delay}s`,
              filter: index % 3 === 0 ? "blur(2.6px)" : "blur(1.7px)",
            } as ParticleStyle}
          />
        ))}
      </div>
      <div className="dashboard-noise absolute inset-0 opacity-[.035]" />
    </div>
  );
}
