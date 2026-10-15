"use client";

import {
    forwardRef,
    useState,
    type InputHTMLAttributes,
    type ReactNode,
} from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

type AuthInputProps = InputHTMLAttributes<HTMLInputElement> & {
    label: string;
    icon: ReactNode;
    error?: string;
    variant?: "default" | "login";
};

export const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>(
    function AuthInput(
        {
            label,
            icon,
            error,
            variant = "default",
            type = "text",
            className,
            ...props
        },
        ref,
    ) {
        const [visible, setVisible] = useState(false);

        const isPassword = type === "password";
        const inputType = isPassword && visible ? "text" : type;

        return (
            <div
                suppressHydrationWarning
                data-auth-field
                className={cn(
                    "w-full min-w-0",
                    variant === "default" && "max-w-[350px] sm:max-w-[420px] lg:max-w-[500px]",
                )}
            >
                <label
                    className="sr-only"
                    htmlFor={props.id}
                >
                    {label}
                </label>

                <div
                    className={cn(
                        "group flex h-[54px] w-full items-center rounded-[18px] border bg-black/[.42] backdrop-blur-[12px]",
                        "shadow-[inset_0_1px_10px_rgba(0,0,0,.3),inset_0_1px_0_rgba(255,255,255,.035)]",
                        "transition-[border-color,box-shadow,background-color] duration-300",
                        "focus-within:border-[#d9a441]/80",
                        "focus-within:bg-black/50",
                        "focus-within:shadow-[inset_0_1px_10px_rgba(0,0,0,.32),0_0_0_3px_rgba(217,164,65,.1),0_0_24px_rgba(217,164,65,.08)]",
                        error
                            ? "border-[#ff8c78]/60"
                            : "border-white/[.1] hover:border-[#d9a441]/40",
                        className,
                    )}
                >
          <span
              className="
              flex h-7 w-[58px] shrink-0
              items-center justify-center
              border-r border-[#d9a441]/35
              text-[#d9a441]
              transition-[transform,filter,border-color]
              duration-300
              group-focus-within:scale-[1.04]
              group-focus-within:border-[#d9a441]/60
              group-focus-within:brightness-125
              [&_img]:h-auto
              [&_img]:w-[22px]
              [&_svg]:size-[18px]
            "
              aria-hidden="true"
          >
            {icon}
          </span>

                    <input
                        ref={ref}
                        type={inputType}
                        aria-invalid={Boolean(error)}
                        aria-describedby={
                            error ? `${props.id}-error` : undefined
                        }
                        className="
              h-full min-w-0 flex-1
              bg-transparent
              px-4
              text-[16px]
              text-[#f5f3ef]
              outline-none
              placeholder:text-white/48
            "
                        {...props}
                    />

                    {isPassword ? (
                        <button
                            type="button"
                            onClick={() =>
                                setVisible((current) => !current)
                            }
                            className="
                mr-2 grid size-9 shrink-0
                place-items-center
                rounded-xl
                text-white/35
                transition-colors
                hover:bg-white/5
                hover:text-[#e0ad52]
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-[#d9a441]/60
              "
                            aria-label={
                                visible
                                    ? "Ascunde parola"
                                    : "Afișează parola"
                            }
                        >
                            {visible ? (
                                <EyeOff size={18} />
                            ) : (
                                <Eye size={18} />
                            )}
                        </button>
                    ) : null}
                </div>

                {error ? (
                    <p
                        id={`${props.id}-error`}
                        className="mt-1.5 text-[12px] leading-[1.15] text-[#ff9a86]"
                        role="alert"
                    >
                        {error}
                    </p>
                ) : null}
            </div>
        );
    },
);
