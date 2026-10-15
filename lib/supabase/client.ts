import {
  createBrowserClient,
  parseCookieHeader,
  serializeCookieHeader,
} from "@supabase/ssr";
import {
  applySessionPersistence,
  REMEMBER_SESSION_COOKIE,
  REMEMBER_SESSION_MAX_AGE,
} from "@/lib/auth/session-persistence";
import { getSupabaseConfig } from "./config";

function shouldRememberSession() {
  if (typeof document === "undefined") return false;
  return parseCookieHeader(document.cookie).some(
    ({ name, value }) => name === REMEMBER_SESSION_COOKIE && value === "1",
  );
}

export function setRememberSession(rememberSession: boolean) {
  document.cookie = serializeCookieHeader(
    REMEMBER_SESSION_COOKIE,
    rememberSession ? "1" : "0",
    {
      path: "/",
      sameSite: "lax",
      ...(rememberSession ? { maxAge: REMEMBER_SESSION_MAX_AGE } : {}),
    },
  );
}

export function createClient() {
  const { url, publishableKey } = getSupabaseConfig();
  return createBrowserClient(url, publishableKey, {
    cookies: {
      getAll() {
        if (typeof document === "undefined") return [];
        return parseCookieHeader(document.cookie).map(({ name, value }) => ({
          name,
          value: value ?? "",
        }));
      },
      setAll(cookiesToSet) {
        if (typeof document === "undefined") return;
        const rememberSession = shouldRememberSession();

        cookiesToSet.forEach(({ name, value, options }) => {
          document.cookie = serializeCookieHeader(
            name,
            value,
            applySessionPersistence(options, rememberSession),
          );
        });
      },
    },
  });
}
