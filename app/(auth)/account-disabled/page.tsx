import type { Metadata } from "next";
import { logout } from "@/app/auth/actions";
import { AuthCard } from "@/components/auth/AuthCard";
import { OraBrand } from "@/components/auth/OraBrand";

export const metadata: Metadata = { title: "Acces indisponibil" };
export const instant = false;

type AccountDisabledPageProps = {
  searchParams: Promise<{ reason?: string }>;
};

export default async function AccountDisabledPage({ searchParams }: AccountDisabledPageProps) {
  const { reason } = await searchParams;
  const message = reason === "profile"
    ? "Profilul de personal nu a fost găsit. Contactează administratorul."
    : "Acest cont a fost dezactivat.";

  return (
    <>
      <OraBrand />
      <AuthCard title="Acces indisponibil" className="w-fit max-w-full" variant="login">
        <div suppressHydrationWarning className="w-[480px] max-w-full text-center" data-auth-field>
          <p className="text-[16px] leading-7 text-white/65">{message}</p>
          <form suppressHydrationWarning action={logout} data-auth-cta className="mt-8">
            <button className="h-[54px] w-full cursor-pointer rounded-[18px] border border-[#d9a441]/35 bg-[#d9a441]/10 font-semibold text-[#e5b55d] transition-colors hover:bg-[#d9a441]/15">Înapoi la autentificare</button>
          </form>
        </div>
      </AuthCard>
    </>
  );
}
