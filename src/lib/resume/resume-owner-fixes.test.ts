import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { PDFParse } from "pdf-parse";
import {
  DEFAULT_RESUME_DATA,
  DEFAULT_RESUME_METADATA,
} from "../../types/resume";
import { resumePayloadForAi } from "./ai-payload";
import { sanitizeResumeHtml } from "./html";
import { renderResumePdf } from "./pdf/render";
import { htmlToPlain, pdfDownloadFilename, safeHex } from "./pdf/text";
import { exportPageStyle } from "./print-page";
import { shouldCountPublicView } from "./public-view";
import {
  nextSnapshotVersion,
  restoreIdentityPatch,
  snapshotIdentity,
} from "./version-snapshot";

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

describe("snapshot sequence", () => {
  it("allocates the next number after the highest snapshot, independent of the resume lock", () => {
    assert.equal(nextSnapshotVersion([]), 1);
    assert.equal(nextSnapshotVersion([1]), 2);
    assert.equal(nextSnapshotVersion([1, 4, 2]), 5);
  });
});

describe("public view counting", () => {
  it("counts the first visit and skips a repeat with the same cookie", () => {
    assert.equal(shouldCountPublicView(undefined, "asha-rao"), true);
    assert.equal(shouldCountPublicView("someone-else", "asha-rao"), true);
    assert.equal(shouldCountPublicView("asha-rao", "asha-rao"), false);
  });
});

describe("resume ai payload", () => {
  it("fills missing sections instead of throwing before the model runs", () => {
    const data = resumePayloadForAi({ data: { basics: { name: "Asha Rao" } } });
    assert.ok(data);
    assert.equal(data?.basics.name, "Asha Rao");
    assert.deepEqual(data?.work, []);
    assert.equal(resumePayloadForAi({}), null);
    assert.equal(resumePayloadForAi({ data: null }), null);
  });
});

describe("resume pdf text", () => {
  it("turns TipTap html into plain text and a safe filename", () => {
    assert.equal(
      htmlToPlain("<p>Led <strong>payments</strong></p><script>x</script>"),
      "Led payments",
    );
    assert.equal(
      pdfDownloadFilename("Asha Rao / Backend"),
      "Asha-Rao-Backend.pdf",
    );
    assert.equal(safeHex("red", "#111111"), "#111111");
    assert.equal(safeHex("#2563eb", "#111111"), "#2563eb");
  });
});

describe("server resume pdf", () => {
  it("renders a real PDF that keeps the candidate name and executive heading", async () => {
    const data = {
      ...DEFAULT_RESUME_DATA,
      basics: {
        ...DEFAULT_RESUME_DATA.basics,
        name: "Asha Rao",
        label: "Backend Engineer",
        email: "asha@example.com",
        summary: "<p>Builds reliable payment systems.</p>",
      },
      work: [
        {
          id: "work-1",
          company: "Zaprill",
          position: "Engineer",
          website: "",
          startDate: "2022-01",
          endDate: null,
          summary: "",
          highlights: ["Shipped checkout"],
          location: "Pune",
        },
      ],
      skills: [
        {
          id: "skill-1",
          name: "Languages",
          level: "Expert",
          keywords: ["TypeScript"],
          category: "technical",
        },
      ],
    };
    const metadata = {
      ...DEFAULT_RESUME_METADATA,
      sectionVisibility: {
        ...DEFAULT_RESUME_METADATA.sectionVisibility,
        skills: true,
      },
    };

    const minimal = await renderResumePdf({
      title: "Asha Rao",
      templateSlug: "minimalist",
      data,
      metadata,
    });
    const executive = await renderResumePdf({
      title: "Asha Rao",
      templateSlug: "executive-pro",
      data,
      metadata,
    });
    const split = await renderResumePdf({
      title: "Asha Rao",
      templateSlug: "modern-split",
      data,
      metadata,
    });

    assert.equal(minimal.subarray(0, 5).toString(), "%PDF-");
    assert.ok(executive.byteLength > 500);
    assert.ok(split.byteLength > 500);

    const parser = new PDFParse({ data: new Uint8Array(executive) });
    const text = await parser.getText();
    await parser.destroy();
    assert.match(text.text, /Asha Rao/);
    assert.match(text.text, /EXECUTIVE SUMMARY/);
    assert.match(text.text, /Shipped checkout/);
  });
});
