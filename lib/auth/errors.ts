import type { AuthError } from "@supabase/supabase-js";

export class StaffAuthError extends Error {
  constructor(
    message: string,
    public readonly reason:
      | "invalid_credentials"
      | "email_unverified"
      | "email_registered"
      | "weak_password"
      | "pending"
      | "disabled"
      | "profile_missing"
      | "network"
      | "unknown",
  ) {
    super(message);
    this.name = "StaffAuthError";
  }
}

export function mapAuthError(error: AuthError | Error): StaffAuthError {
  const message = error.message.toLowerCase();
  const code = "code" in error && typeof error.code === "string" ? error.code.toLowerCase() : "";

  if (message.includes("email not confirmed") || code.includes("email_not_confirmed")) {
    return new StaffAuthError("Confirmă mai întâi adresa de email.", "email_unverified");
  }

  if (message.includes("invalid login credentials") || code.includes("invalid_credentials")) {
    return new StaffAuthError("Email sau parolă incorectă.", "invalid_credentials");
  }

  if (message.includes("already registered") || message.includes("already been registered") || code.includes("user_already_exists")) {
    return new StaffAuthError("Există deja un cont cu această adresă de email.", "email_registered");
  }

  if (message.includes("password") && (message.includes("weak") || message.includes("least"))) {
    return new StaffAuthError("Parola nu îndeplinește cerințele de securitate.", "weak_password");
  }

  if (message.includes("fetch") || message.includes("network")) {
    return new StaffAuthError("Nu ne-am putut conecta la server. Încearcă din nou.", "network");
  }

  return new StaffAuthError("Operațiunea nu a putut fi finalizată. Încearcă din nou.", "unknown");
}
