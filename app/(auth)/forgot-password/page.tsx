import type { Metadata } from "next";
import { AuthCard } from "@/components/auth/AuthCard";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import { OraBrand } from "@/components/auth/OraBrand";

export const metadata: Metadata = { title: "Recuperare parolă" };

export default function ForgotPasswordPage() {
  return (
    <>
      <OraBrand />
      <AuthCard title="Recuperare parolă" className="w-fit max-w-full" variant="login"><ForgotPasswordForm /></AuthCard>
    </>
  );
}
