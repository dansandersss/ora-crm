import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type AuthCardProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  variant?: "default" | "login" | "register";
};

export function AuthCard({ title, subtitle = "Accesează panoul ORA", children, className, variant = "default" }: AuthCardProps) {
  return (
    <section
      suppressHydrationWarning
      data-auth-card
      className={cn(
        "relative w-full rounded-[28px] shadow-[0_30px_80px_rgba(0,0,0,.42),0_0_50px_rgba(217,164,65,.05)] sm:rounded-[34px]",
        className,
      )}
    >
      <div
        className={cn(
          "auth-glass relative overflow-hidden rounded-[inherit] border border-[#e5b65d]/[.36] bg-[linear-gradient(145deg,rgba(28,23,18,.4),rgba(14,13,12,.27))] px-5 py-8 shadow-[inset_0_1px_0_rgba(255,255,255,.15),inset_1px_0_0_rgba(255,255,255,.035),inset_0_-1px_0_rgba(217,164,65,.065)]",
          variant === "login"
            ? "sm:px-12 sm:py-12"
            : variant === "register"
              ? "sm:px-10 sm:py-10 lg:px-12 lg:py-12"
              : "sm:px-10 sm:py-11 lg:px-[60px] lg:py-[58px]",
        )}
        style={{
          backdropFilter: "blur(30px) saturate(150%)",
          WebkitBackdropFilter: "blur(30px) saturate(150%)",
        }}
      >
        <div className={cn(
          "relative text-left",
          variant === "login" ? "mb-9 sm:mb-10" : variant === "register" ? "mb-8 sm:mb-9" : "mb-9 sm:mb-12",
        )}>
          <h1 suppressHydrationWarning data-auth-title className={cn(
            "font-normal leading-[1.08] tracking-[-.025em] text-[#fffaf1]",
            variant === "login"
              ? "text-[29px] sm:text-[34px]"
              : variant === "register"
                ? "text-[30px] sm:text-[36px]"
                : "text-[30px] sm:text-[40px] lg:text-[46px]",
          )}>{title}</h1>
          <p suppressHydrationWarning data-auth-description className={cn(
            "font-normal leading-tight tracking-[.005em] text-[#e0a334]",
            variant === "login" ? "mt-1.5 text-[18px] sm:text-[22px]" : "mt-2",
            variant === "register" ? "text-[19px] sm:text-[24px]" : variant === "default" ? "text-[19px] sm:text-[26px] lg:text-[32px]" : null,
          )}>{subtitle}</p>
        </div>
        <div className="relative">{children}</div>
      </div>
    </section>
  );
}
