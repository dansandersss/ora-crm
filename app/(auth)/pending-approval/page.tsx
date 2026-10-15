import type { Metadata } from "next";
import { logout } from "@/app/auth/actions";
import { AuthCard } from "@/components/auth/AuthCard";
import { OraBrand } from "@/components/auth/OraBrand";

export const metadata: Metadata = { title: "Cont în așteptare" };

export default function PendingApprovalPage() {
  return (
    <>
      <OraBrand />
      <AuthCard title="Cont în așteptare" className="w-fit max-w-full" variant="login">
        <div suppressHydrationWarning className="w-[480px] max-w-full text-center" data-auth-field>
          <p className="text-[16px] leading-7 text-white/65">Contul tău așteaptă aprobarea administratorului.</p>
          <p className="mt-3 text-sm leading-6 text-white/45">Vei putea accesa CRM-ul după activarea profilului de personal.</p>
          <form suppressHydrationWarning action={logout} data-auth-cta className="mt-8">
            <button className="h-[54px] w-full cursor-pointer rounded-[18px] border border-[#d9a441]/35 bg-[#d9a441]/10 font-semibold text-[#e5b55d] transition-colors hover:bg-[#d9a441]/15">Înapoi la autentificare</button>
          </form>
        </div>
      </AuthCard>
    </>
  );
}
