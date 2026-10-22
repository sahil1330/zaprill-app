/**
 * Cookie Domain for Better Auth.
 *
 * Only pin cookies to the zaprill.com apex when THIS Vercel project actually
 * serves a zaprill.com host. `BETTER_AUTH_URL` / `NEXT_PUBLIC_APP_URL` are
 * copied onto the test Vercel project and still say app.zaprill.com, so they
 * must not decide the cookie domain. Using Domain=zaprill.com on
 * *.vercel.app makes the browser drop the OAuth state cookie and Better Auth
 * redirects to /?error=state_mismatch.
 */
export function resolveAuthCookieDomain(
  env: NodeJS.ProcessEnv = process.env,
): string | undefined {
  if (env.VERCEL_ENV === "preview") return undefined;

  const servingHost = hostnameOf(
    env.VERCEL_PROJECT_PRODUCTION_URL ?? env.VERCEL_URL ?? "",
  );

  if (isZaprillHost(servingHost)) return "zaprill.com";

  // Local + test Vercel: host-only. Domain=localhost is not sent to
  // 127.0.0.1 or lvh.me:3000.
  return undefined;
}

export function shouldUseCrossSubdomainCookies(
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  return resolveAuthCookieDomain(env) !== undefined;
}

function hostnameOf(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  try {
    return new URL(trimmed.includes("://") ? trimmed : `https://${trimmed}`)
      .hostname;
  } catch {
    return trimmed.split("/")[0]?.split(":")[0] ?? "";
  }
}

function isZaprillHost(host: string): boolean {
  return host === "zaprill.com" || host.endsWith(".zaprill.com");
}
