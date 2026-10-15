import type { Metadata } from "next";
import { AuthCard } from "@/components/auth/AuthCard";
import { OraBrand } from "@/components/auth/OraBrand";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata: Metadata = { title: "Înregistrare" };

export default function RegisterPage() {
  return <><OraBrand /><AuthCard title="Registrare personal" className="w-fit max-w-full" variant="register"><RegisterForm /></AuthCard></>;
}
