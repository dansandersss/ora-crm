"use client";

import { LoaderCircle } from "lucide-react";
import gsap from "gsap";
import { useEffect, useRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type AuthButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
    loading?: boolean;
    variant?: "default" | "login";
};

export function AuthButton({
                               children,
                               loading,
                               className,
                               disabled,
                               style,
                               variant = "default",
                               onMouseEnter,
                               onMouseLeave,
                               onPointerDown,
                               onPointerUp,
                               onPointerCancel,
                               ...props
                           }: AuthButtonProps) {
    const buttonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => () => {
        if (buttonRef.current) gsap.killTweensOf(buttonRef.current);
    }, []);

    const animateHover = (hovered: boolean) => {
        if (!buttonRef.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

        gsap.to(buttonRef.current, {
            scale: hovered ? 1.015 : 1,
            y: hovered ? -2 : 0,
            duration: 0.5,
            ease: "sine.inOut",
            force3D: true,
            overwrite: "auto",
        });
    };

    const animatePress = () => {
        if (!buttonRef.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

        gsap.to(buttonRef.current, {
            scale: 0.985,
            y: 0,
            duration: 0.14,
            ease: "power2.out",
            force3D: true,
            overwrite: "auto",
        });
    };

    return (
        <div
            suppressHydrationWarning
            data-auth-cta
            className="w-full"
        >
            <button
                ref={buttonRef}
                disabled={disabled || loading}
                onMouseEnter={(event) => {
                    onMouseEnter?.(event);
                    animateHover(true);
                }}
                onMouseLeave={(event) => {
                    onMouseLeave?.(event);
                    animateHover(false);
                }}
                onPointerDown={(event) => {
                    onPointerDown?.(event);
                    animatePress();
                }}
                onPointerUp={(event) => {
                    onPointerUp?.(event);
                    animateHover(event.pointerType === "mouse");
                }}
                onPointerCancel={(event) => {
                    onPointerCancel?.(event);
                    animateHover(false);
                }}
                className={cn(
                    "relative flex w-full cursor-pointer touch-manipulation select-none items-center justify-center overflow-hidden bg-gradient-to-r from-[#c99132] via-[#dfa33e] to-[#e8aa42] px-6 font-bold tracking-[.01em] text-[#211608]",
                    variant === "login"
                        ? "h-[54px] rounded-[18px] text-[17px]"
                        : "h-[58px] rounded-[18px] text-[17px] sm:h-[68px] sm:rounded-[22px] sm:text-[21px] lg:h-[76px] lg:rounded-[26px] lg:text-[24px]",
                    "shadow-[inset_0_1px_0_rgba(255,255,255,.4),0_18px_46px_rgba(217,164,65,.16),0_0_42px_rgba(217,164,65,.1)]",
                    "transform-gpu will-change-transform transition-[filter,box-shadow] duration-[500ms] ease-in-out",
                    "before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-white/55",
                    "hover:brightness-110",
                    "hover:shadow-[inset_0_1px_0_rgba(255,255,255,.44),0_22px_54px_rgba(217,164,65,.2),0_0_48px_rgba(217,164,65,.12)]",
                    "active:brightness-95 active:duration-150",
                    "disabled:cursor-not-allowed disabled:opacity-65",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffd17a] focus-visible:ring-offset-2 focus-visible:ring-offset-[#15110d]",
                    "motion-reduce:transform-none motion-reduce:transition-none",
                    className
                )}
                style={style}
                {...props}
            >
                {loading ? (
                    <>
                        <LoaderCircle className="mr-2 size-4 animate-spin" />
                        Se procesează...
                    </>
                ) : (
                    children
                )}
            </button>
        </div>
    );
}
