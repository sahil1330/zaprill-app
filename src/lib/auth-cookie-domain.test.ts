import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  resolveAuthCookieDomain,
  shouldUseCrossSubdomainCookies,
} from "./auth-cookie-domain";

describe("resolveAuthCookieDomain", () => {
  it("does not pin Domain=zaprill.com when APP_URL is production but this project serves vercel.app", () => {
    const env = {
      VERCEL_ENV: "production",
      BETTER_AUTH_URL: "https://app.zaprill.com",
      NEXT_PUBLIC_APP_URL: "https://app.zaprill.com",
      VERCEL_PROJECT_PRODUCTION_URL: "ai-job-god.vercel.app",
      VERCEL_URL: "ai-job-god.vercel.app",
    } as NodeJS.ProcessEnv;

    assert.equal(resolveAuthCookieDomain(env), undefined);
    assert.equal(shouldUseCrossSubdomainCookies(env), false);
  });

  it("pins zaprill.com when this Vercel project actually serves app.zaprill.com", () => {
    const env = {
      VERCEL_ENV: "production",
      BETTER_AUTH_URL: "https://app.zaprill.com",
      VERCEL_PROJECT_PRODUCTION_URL: "app.zaprill.com",
      VERCEL_URL: "zaprill-app-abc.vercel.app",
    } as NodeJS.ProcessEnv;

    assert.equal(resolveAuthCookieDomain(env), "zaprill.com");
    assert.equal(shouldUseCrossSubdomainCookies(env), true);
  });

  it("uses host-only cookies on Vercel preview deploys", () => {
    const env = {
      VERCEL_ENV: "preview",
      BETTER_AUTH_URL: "https://app.zaprill.com",
      VERCEL_PROJECT_PRODUCTION_URL: "app.zaprill.com",
      VERCEL_URL: "zaprill-git-feat-xxx.vercel.app",
    } as NodeJS.ProcessEnv;

    assert.equal(resolveAuthCookieDomain(env), undefined);
    assert.equal(shouldUseCrossSubdomainCookies(env), false);
  });

  it("uses host-only cookies locally even if APP_URL points at production", () => {
    const env = {
      BETTER_AUTH_URL: "https://app.zaprill.com",
      NEXT_PUBLIC_APP_URL: "https://app.zaprill.com",
    } as NodeJS.ProcessEnv;

    assert.equal(resolveAuthCookieDomain(env), undefined);
    assert.equal(shouldUseCrossSubdomainCookies(env), false);
  });

  it("accepts a bare production hostname without a scheme", () => {
    const env = {
      VERCEL_ENV: "production",
      VERCEL_PROJECT_PRODUCTION_URL: "hq.zaprill.com",
    } as NodeJS.ProcessEnv;

    assert.equal(resolveAuthCookieDomain(env), "zaprill.com");
  });
});
