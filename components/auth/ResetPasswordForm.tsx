"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { updatePassword } from "@/lib/auth/client";
import { resetPasswordSchema, type ResetPasswordValues } from "@/lib/validators/auth";
import { AuthButton } from "./AuthButton";
import { AuthInput } from "./AuthInput";

export function ResetPasswordForm() {
  const router = useRouter();
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const onSubmit = async (values: ResetPasswordValues) => {
    try {
      await updatePassword(values.password);
      router.replace("/login?password_updated=1");
      router.refresh();
    } catch (error) {
      setError("root", { message: error instanceof Error ? error.message : "Parola nu a putut fi actualizată." });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex w-[480px] max-w-full flex-col gap-5">
      <AuthInput id="password" label="Parolă nouă" type="password" autoComplete="new-password" placeholder="Parolă nouă" variant="login" icon={<Image unoptimized src="/assets/password-icon.svg" alt="" width={30} height={30} />} error={errors.password?.message} {...register("password")} />
      <AuthInput id="confirmPassword" label="Confirmă parola" type="password" autoComplete="new-password" placeholder="Confirmă parola" variant="login" icon={<Image unoptimized src="/assets/password-icon.svg" alt="" width={30} height={30} />} error={errors.confirmPassword?.message} {...register("confirmPassword")} />
      {errors.root?.message ? <p className="text-center text-[12px] text-[#ff9a86]" role="alert">{errors.root.message}</p> : null}
      <AuthButton type="submit" loading={isSubmitting} variant="login">Salvează parola</AuthButton>
    </form>
  );
}
