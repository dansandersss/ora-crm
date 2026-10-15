export class SupabaseConfigurationError extends Error {
  constructor() {
    super("Serviciul de autentificare ORA nu este configurat.");
    this.name = "SupabaseConfigurationError";
  }
}

export function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !publishableKey) {
    throw new SupabaseConfigurationError();
  }

  return { url, publishableKey };
}
