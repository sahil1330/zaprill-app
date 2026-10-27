import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { resolveHomeEntry } from "@/lib/home-entry";

describe("resolveHomeEntry", () => {
  it("waits while the session is unknown", () => {
    assert.equal(
      resolveHomeEntry({
        sessionLoading: true,
        hasSession: false,
        profilePending: false,
      }),
      "loading",
    );
  });

  it("sends a signed-out visitor to sign-in", () => {
    assert.equal(
      resolveHomeEntry({
        sessionLoading: false,
        hasSession: false,
        profilePending: false,
      }),
      "sign-in",
    );
  });

  it("waits for the profile request", () => {
    assert.equal(
      resolveHomeEntry({
        sessionLoading: false,
        hasSession: true,
        profilePending: true,
      }),
      "loading",
    );
  });

  it("opens Home after the profile resolves, including an incomplete file", () => {
    assert.equal(
      resolveHomeEntry({
        sessionLoading: false,
        hasSession: true,
        profilePending: false,
      }),
      "home",
    );
  });
});

describe("app root copy", () => {
  it("does not keep the marketing landing", () => {
    const source = readFileSync(
      new URL("../app/page.tsx", import.meta.url),
      "utf8",
    );
    assert.equal(source.includes("Find the job you actually deserve."), false);
    assert.equal(source.includes("Get Started Now"), false);
    assert.equal(source.includes("UserDashboard"), false);
    assert.equal(source.includes("DashboardSkeleton"), false);
    assert.match(source, /router\.replace\("\/sign-in"\)/);
    assert.match(source, /HomeBoard/);
  });
});
