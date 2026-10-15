import type { LoginValues, RegisterValues } from "@/lib/validators/auth";
import { createClient, setRememberSession } from "@/lib/supabase/client";
import { SupabaseConfigurationError } from "@/lib/supabase/config";
import { mapAuthError, StaffAuthError } from "./errors";
import type { StaffProfile } from "./types";

export class AuthNotConfiguredError extends Error {
  constructor() {
    super("Serviciul de autentificare ORA nu este configurat.");
    this.name = "AuthNotConfiguredError";
  }
}

function getClient() {
  try {
    return createClient();
  } catch (error) {
    if (error instanceof SupabaseConfigurationError) throw new AuthNotConfiguredError();
    throw error;
  }
}

export async function signInStaff(credentials: LoginValues): Promise<StaffProfile> {
  setRememberSession(credentials.rememberMe);
  const supabase = getClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: credentials.email.trim(),
    password: credentials.password,
  });

  if (error) throw mapAuthError(error);
  if (!data.user.email_confirmed_at) {
    await supabase.auth.signOut();
    throw new StaffAuthError("Confirmă mai întâi adresa de email.", "email_unverified");
  }

  const { data: profile, error: profileError } = await supabase
    .from("staff_profiles")
    .select("id, first_name, last_name, phone, role, status, created_at, updated_at")
    .eq("id", data.user.id)
    .maybeSingle();

  if (profileError || !profile) {
    await supabase.auth.signOut();
    throw new StaffAuthError("Profilul de personal nu a fost găsit.", "profile_missing");
  }

  const staffProfile = profile as StaffProfile;

  if (staffProfile.status === "pending") {
    await supabase.auth.signOut();
    throw new StaffAuthError("Contul tău așteaptă aprobarea administratorului.", "pending");
  }

  if (staffProfile.status === "disabled") {
    await supabase.auth.signOut();
    throw new StaffAuthError("Acest cont a fost dezactivat.", "disabled");
  }

  return staffProfile;
}

export async function registerStaff(values: RegisterValues): Promise<{ email: string }> {
  const supabase = getClient();
  const email = values.email.trim();

  const { data, error } = await supabase.auth.signUp({
    email,
    password: values.password,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/confirm?next=/login`,
      data: {
        account_type: "staff",
        first_name: values.lastName.trim(),
        last_name: values.firstName.trim(),
        phone: values.phone.trim(),
      },
    },
  });

  if (error) throw mapAuthError(error);
  if (data.user?.identities?.length === 0) {
    throw new StaffAuthError("Există deja un cont cu această adresă de email.", "email_registered");
  }

  // Confirmation must remain mandatory. Do not keep a session if the dashboard setting is misconfigured.
  if (data.session) await supabase.auth.signOut();

  return { email };
}

export async function requestPasswordReset(emailValue: string): Promise<void> {
  const supabase = getClient();
  const { error } = await supabase.auth.resetPasswordForEmail(emailValue.trim(), {
    redirectTo: `${window.location.origin}/auth/confirm?next=/reset-password`,
  });

  if (error) throw mapAuthError(error);
}

export async function updatePassword(password: string): Promise<void> {
  const supabase = getClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) throw mapAuthError(error);
  await supabase.auth.signOut();
}
