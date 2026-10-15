import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthCard } from "@/components/auth/AuthCard";
import { OraBrand } from "@/components/auth/OraBrand";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Setează parola nouă" };
export const instant = false;

export default async function ResetPasswordPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return <><OraBrand /><AuthCard title="Parolă nouă" className="w-fit max-w-full" variant="login"><ResetPasswordForm /></AuthCard></>;
}
