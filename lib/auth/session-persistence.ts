import type { CookieOptions } from "@supabase/ssr";

export const REMEMBER_SESSION_COOKIE = "ora-remember-session";
export const REMEMBER_SESSION_MAX_AGE = 400 * 24 * 60 * 60;

export function applySessionPersistence(
  options: CookieOptions,
  rememberSession: boolean,
): CookieOptions {
  if (rememberSession || options.maxAge === 0) return options;

  const sessionOptions = { ...options };
  delete sessionOptions.maxAge;
  delete sessionOptions.expires;
  return sessionOptions;
}
