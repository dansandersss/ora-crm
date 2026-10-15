"use client";

import Image from "next/image";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { requestPasswordReset } from "@/lib/auth/client";
import { forgotPasswordSchema, type ForgotPasswordValues } from "@/lib/validators/auth";
import { AuthButton } from "./AuthButton";
import { AuthInput } from "./AuthInput";

export function ForgotPasswordForm() {
  const [sent, setSent] = useState(false);
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (values: ForgotPasswordValues) => {
    try {
      await requestPasswordReset(values.email);
      setSent(true);
    } catch (error) {
      setError("root", { message: error instanceof Error ? error.message : "Cererea nu a putut fi trimisă." });
    }
  };

  if (sent) {
    return (
      <div suppressHydrationWarning className="w-[420px] max-w-full text-center" data-auth-field>
        <p className="text-sm leading-7 text-white/60">Dacă există un cont pentru această adresă, vei primi un email cu pașii pentru resetarea parolei.</p>
        <Link suppressHydrationWarning data-auth-cta href="/login" className="mt-7 flex h-[54px] items-center justify-center rounded-[18px] border border-[#d9a441]/35 bg-[#d9a441]/10 text-sm font-semibold text-[#e5b55d] transition-colors hover:bg-[#d9a441]/15">Înapoi la autentificare</Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex w-[420px] max-w-full flex-col gap-5">
      <p suppressHydrationWarning data-auth-field className="text-sm leading-6 text-white/55">Introdu adresa de email asociată contului tău.</p>
      <AuthInput id="email" label="Email" type="email" autoComplete="email" placeholder="Email" variant="login" icon={<Image unoptimized src="/assets/mail-icon.svg" alt="" width={30} height={30} />} error={errors.email?.message} {...register("email")} />
      {errors.root?.message ? <p className="text-center text-[12px] text-[#ff9a86]" role="alert">{errors.root.message}</p> : null}
      <AuthButton type="submit" loading={isSubmitting} variant="login">Trimite linkul</AuthButton>
      <Link suppressHydrationWarning data-auth-footer href="/login" className="text-center text-sm text-[#d9a441] transition-colors hover:text-[#ffc45c]">Înapoi la autentificare</Link>
    </form>
  );
}
