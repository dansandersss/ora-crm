import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { StaffProfile } from "./types";

export const getStaffSession = cache(async () => {
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) return null;
  if (!user.email_confirmed_at) return { user, profile: null, emailVerified: false };

  const { data, error: profileError } = await supabase
    .from("staff_profiles")
    .select("id, first_name, last_name, phone, role, status, created_at, updated_at")
    .eq("id", user.id)
    .maybeSingle();

  return {
    user,
    profile: profileError ? null : data as StaffProfile | null,
    emailVerified: true,
  };
});

export async function requireActiveStaff() {
  const session = await getStaffSession();

  if (!session) redirect("/login");
  if (!session.emailVerified) redirect("/login?error=email-unverified");
  if (!session.profile) redirect("/account-disabled?reason=profile");
  if (session.profile.status === "pending") redirect("/pending-approval");
  if (session.profile.status === "disabled") redirect("/account-disabled");

  return { user: session.user, profile: session.profile };
}
