"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

export function usePremiumTilt<T extends HTMLElement>(enabled = true) {
  const ref = useRef<T>(null);

  useGSAP(() => {
    const element = ref.current;
    if (!enabled || !element || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.set(element, {
      transformPerspective: 1050,
      transformStyle: "preserve-3d",
    });

    const rotateX = gsap.quickTo(element, "rotationX", { duration: 0.42, ease: "power3.out" });
    const rotateY = gsap.quickTo(element, "rotationY", { duration: 0.42, ease: "power3.out" });
    const y = gsap.quickTo(element, "y", { duration: 0.42, ease: "power3.out" });

    const handlePointerMove = (event: PointerEvent) => {
      const bounds = element.getBoundingClientRect();
      const xRatio = (event.clientX - bounds.left) / bounds.width;
      const yRatio = (event.clientY - bounds.top) / bounds.height;

      element.style.setProperty("--ora-pointer-x", `${xRatio * 100}%`);
      element.style.setProperty("--ora-pointer-y", `${yRatio * 100}%`);
      rotateX((0.5 - yRatio) * 5);
      rotateY((xRatio - 0.5) * 5);
      y(-2);
    };

    const handlePointerLeave = () => {
      rotateX(0);
      rotateY(0);
      y(0);
    };

    element.addEventListener("pointermove", handlePointerMove);
    element.addEventListener("pointerleave", handlePointerLeave);

    return () => {
      element.removeEventListener("pointermove", handlePointerMove);
      element.removeEventListener("pointerleave", handlePointerLeave);
      gsap.killTweensOf(element);
    };
  }, { scope: ref, dependencies: [enabled] });

  return ref;
}
