import type { Metadata } from "next";
import { AuthCard } from "@/components/auth/AuthCard";
import { LoginForm } from "@/components/auth/LoginForm";
import { OraBrand } from "@/components/auth/OraBrand";

export const metadata: Metadata = { title: "Autentificare" };
export const instant = false;

type LoginPageProps = {
  searchParams: Promise<{ verified?: string; error?: string; password_updated?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const notice = params.verified === "1"
    ? "Email confirmat. Te poți autentifica."
    : params.password_updated === "1"
      ? "Parola a fost actualizată. Te poți autentifica."
      : params.error === "email-unverified"
        ? "Confirmă mai întâi adresa de email."
        : undefined;

  return <><OraBrand /><AuthCard title="Autentificare personal" className="w-fit max-w-full" variant="login"><LoginForm notice={notice} /></AuthCard></>;
}
