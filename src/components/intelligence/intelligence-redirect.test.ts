import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { intelligenceRedirectTarget } from "@/components/intelligence/intelligence-redirect";

describe("intelligenceRedirectTarget", () => {
  it("keeps pay and path hashes and drops everything else", () => {
    assert.equal(intelligenceRedirectTarget("#pay"), "/#pay");
    assert.equal(intelligenceRedirectTarget("#path"), "/#path");
    assert.equal(intelligenceRedirectTarget(""), "/");
    assert.equal(intelligenceRedirectTarget("#score"), "/");
  });
});

describe("intelligence route", () => {
  it("renders the client redirect instead of IntelligenceDashboard", () => {
    const source = readFileSync(
      new URL("../../app/(protected)/intelligence/page.tsx", import.meta.url),
      "utf8",
    );
    assert.match(source, /IntelligenceRedirect/);
    assert.equal(source.includes("IntelligenceDashboard"), false);
  });
});
