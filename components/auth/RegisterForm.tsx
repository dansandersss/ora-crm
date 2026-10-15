"use client";

import Link from "next/link";
import Image from "next/image";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { registerStaff } from "@/lib/auth/client";
import { registerSchema, type RegisterValues } from "@/lib/validators/auth";
import { AuthButton } from "./AuthButton";
import { AuthInput } from "./AuthInput";

export function RegisterForm() {
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { firstName: "", lastName: "", phone: "", email: "", password: "", confirmPassword: "" },
  });

  const onSubmit = async (values: RegisterValues) => {
    try {
      const result = await registerStaff(values);
      setRegisteredEmail(result.email);
    } catch (error) {
      setError("root", { message: error instanceof Error ? error.message : "Contul nu a putut fi creat." });
    }
  };

  if (registeredEmail) {
    return (
      <div className="w-[718px] max-w-full text-center">
        <div suppressHydrationWarning data-auth-field>
          <h2 className="text-[26px] font-medium text-[#fffaf1]">Verifică emailul</h2>
          <p className="mt-5 text-[15px] leading-7 text-white/60">Ți-am trimis un link de confirmare la:</p>
          <p className="mt-1 break-all font-medium text-[#e0a334]">{registeredEmail}</p>
          <p className="mt-4 text-[15px] leading-7 text-white/60">Deschide mesajul și confirmă adresa pentru a continua.</p>
        </div>
        <Link suppressHydrationWarning data-auth-cta href="/login" className="mx-auto mt-8 flex h-[54px] max-w-[480px] cursor-pointer items-center justify-center rounded-[18px] bg-gradient-to-r from-[#c99132] via-[#dfa33e] to-[#e8aa42] font-bold text-[#211608] shadow-[0_18px_46px_rgba(217,164,65,.16)] transition-[filter,box-shadow] duration-500 hover:brightness-110">
          Înapoi la autentificare
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="w-[718px] max-w-full">
      <div className="grid gap-y-3 md:grid-cols-2 md:gap-x-8">
        <AuthInput id="firstName" label="Nume" autoComplete="family-name" placeholder="Nume" icon={<Image unoptimized src="/assets/name-icon.svg" alt="" width={28} height={28} />} error={errors.firstName?.message} {...register("firstName")} />
        <AuthInput id="email" label="Email" type="email" autoComplete="email" placeholder="Email" icon={<Image unoptimized src="/assets/mail-icon.svg" alt="" width={28} height={28} />} error={errors.email?.message} {...register("email")} />
        <AuthInput id="lastName" label="Prenume" autoComplete="given-name" placeholder="Prenume" icon={<Image unoptimized src="/assets/name-icon.svg" alt="" width={28} height={28} />} error={errors.lastName?.message} {...register("lastName")} />
        <AuthInput id="password" label="Parolă" type="password" autoComplete="new-password" placeholder="Parolă" icon={<Image unoptimized src="/assets/password-icon.svg" alt="" width={28} height={28} />} error={errors.password?.message} {...register("password")} />
        <AuthInput id="phone" label="Telefon" type="tel" autoComplete="tel" placeholder="Telefon" icon={<Image unoptimized src="/assets/phone-icon.svg" alt="" width={28} height={28} />} error={errors.phone?.message} {...register("phone")} />
        <AuthInput id="confirmPassword" label="Confirmați Parola" type="password" autoComplete="new-password" placeholder="Confirmați Parola" icon={<Image unoptimized src="/assets/password-icon.svg" alt="" width={28} height={28} />} error={errors.confirmPassword?.message} {...register("confirmPassword")} />
      </div>
      {errors.root?.message ? (
        <div className="mt-4 text-center text-[12px] text-[#ff9a86]" role="alert">{errors.root.message}</div>
      ) : null}
      <AuthButton type="submit" loading={isSubmitting} variant="login" className="mx-auto mt-8 max-w-[480px]">Înregistrează-te</AuthButton>
      <p suppressHydrationWarning data-auth-footer className="mt-7 text-center text-[15px] text-white/55 sm:text-[16px]">Ai deja cont? <Link href="/login" className="font-medium text-[#d9a441] transition-colors hover:text-[#ffc45c] focus-visible:outline-none focus-visible:text-[#ffc45c]">Conectează-te</Link></p>
    </form>
  );
}
