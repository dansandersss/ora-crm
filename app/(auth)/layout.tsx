import type { ReactNode } from "react";
import { AuthShell } from "@/components/auth/AuthShell";

export const instant = false;

export default function AuthLayout({ children }: { children: ReactNode }) {
  return <AuthShell>{children}</AuthShell>;
}
