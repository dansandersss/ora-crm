import Link from "next/link";
import { AuthCard } from "@/components/auth/AuthCard";
import { AuthShell } from "@/components/auth/AuthShell";
import { OraBrand } from "@/components/auth/OraBrand";

export default function AuthErrorPage() {
  return (
    <AuthShell>
      <OraBrand />
      <AuthCard title="Link invalid sau expirat" className="w-fit max-w-full" variant="login">
        <div suppressHydrationWarning className="w-[420px] max-w-full text-center" data-auth-field>
          <p className="text-sm leading-7 text-white/60">Solicită un link nou și încearcă din nou.</p>
          <Link suppressHydrationWarning data-auth-cta className="mt-7 flex h-[54px] items-center justify-center rounded-[18px] border border-[#d9a441]/35 bg-[#d9a441]/10 text-sm font-semibold text-[#e5b55d] transition-colors hover:bg-[#d9a441]/15" href="/login">Înapoi la autentificare</Link>
        </div>
      </AuthCard>
    </AuthShell>
  );
}
