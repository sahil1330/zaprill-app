import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { sanitizeResumeHtml } from "./html";
import { exportPageStyle } from "./print-page";
import { restoreIdentityPatch, snapshotIdentity } from "./version-snapshot";

describe("resume version snapshots", () => {
  it("stores the live template, title, and industry", () => {
    assert.deepEqual(
      snapshotIdentity({
        templateSlug: "tech-stack",
        title: "Sahil Mane",
        industry: "technology",
      }),
      {
        templateSlug: "tech-stack",
        title: "Sahil Mane",
        industry: "technology",
      },
    );
  });

  it("does not invent identity for snapshots written before the columns existed", () => {
    assert.deepEqual(
      restoreIdentityPatch({
        templateSlug: null,
        title: null,
        industry: null,
      }),
      {},
    );
  });

  it("restores a stored template instead of the editor's current one", () => {
    assert.deepEqual(
      restoreIdentityPatch({
        templateSlug: "executive-pro",
        title: "  Product resume  ",
        industry: "business",
      }),
      {
        templateSlug: "executive-pro",
        title: "Product resume",
        industry: "business",
      },
    );
  });
});

describe("resume html for public share and export", () => {
  it("keeps TipTap formatting and drops scripts and event handlers", () => {
    const clean = sanitizeResumeHtml(
      '<p>Led <strong onclick="alert(1)">payments</strong></p><script>alert(1)</script>',
    );
    assert.equal(clean.includes("<strong>"), true);
    assert.equal(clean.includes("onclick"), false);
    assert.equal(clean.includes("<script"), false);
    assert.equal(clean.includes("alert(1)"), false);
  });

  it("drops javascript urls on links", () => {
    const clean = sanitizeResumeHtml(
      '<a href="javascript:alert(1)">site</a><a href="https://zaprill.com">ok</a>',
    );
    assert.equal(clean.includes("javascript:"), false);
    assert.equal(clean.includes("https://zaprill.com"), true);
  });
});

describe("resume export page css", () => {
  it("clamps page size and margin", () => {
    assert.equal(
      exportPageStyle({ page: { format: "letter", margin: 12 } }),
      "@page { size: letter; margin: 12mm; }",
    );
    assert.equal(
      exportPageStyle({
        page: { format: "a4; } body { display:none", margin: "99</style>" },
      }),
      "@page { size: A4; margin: 20mm; }",
    );
  });
});
