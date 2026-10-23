import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { PDFParse } from "pdf-parse";
import {
  enqueueResumeWrite,
  type ResumeArchitectContext,
} from "@/services/resume/architect.service";
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
import { isUniqueViolation } from "./slug";
import {
  nextSnapshotVersion,
  restoreIdentityPatch,
  snapshotIdentity,
} from "./version-snapshot";

describe("architect write queue", () => {
  it("runs parallel edits one after another", async () => {
    const ctx = {
      resumeId: "r",
      userId: "u",
    } as ResumeArchitectContext;
    const order: string[] = [];
    const first = enqueueResumeWrite(ctx, async () => {
      order.push("first-start");
      await new Promise((resolve) => setTimeout(resolve, 30));
      order.push("first-end");
      return "a";
    });
    const second = enqueueResumeWrite(ctx, async () => {
      order.push("second-start");
      order.push("second-end");
      return "b";
    });
    const [a, b] = await Promise.all([first, second]);
    assert.deepEqual(order, [
      "first-start",
      "first-end",
      "second-start",
      "second-end",
    ]);
    assert.equal(a, "a");
    assert.equal(b, "b");
  });
});

describe("unique violation detection", () => {
  it("walks a wrapped database cause", () => {
    const neon = Object.assign(
      new Error(
        'duplicate key value violates unique constraint "resume_version_unique"',
      ),
      {
        code: "23505",
      },
    );
    const wrapped = new Error("Failed query");
    wrapped.cause = neon;
    assert.equal(isUniqueViolation(wrapped), true);
    assert.equal(isUniqueViolation(new Error("resume not found")), false);
  });
});

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

  it("keeps a full fresher resume on one A4 page", async () => {
    const highlight =
      "Shipped a React and Node.js app used by 640 students during the March exam week.";
    const data = {
      ...DEFAULT_RESUME_DATA,
      basics: {
        ...DEFAULT_RESUME_DATA.basics,
        name: "Ananya Shah",
        label: "Software Engineer",
        email: "ananya.shah@example.com",
        phone: "+91 98450 11220",
        url: "https://github.com/ananya-shah",
        summary:
          "Software engineer who ships React and Node.js features for student products.",
        location: { city: "Bengaluru", region: "Karnataka", countryCode: "IN" },
      },
      work: [
        {
          id: "w1",
          company: "Razorpay",
          position: "Software Engineering Intern",
          website: "",
          startDate: "2025-05",
          endDate: "2025-07",
          summary: "",
          highlights: [highlight, highlight, highlight],
          location: "Bengaluru",
        },
      ],
      education: [
        {
          id: "e1",
          institution: "PES University",
          url: "",
          area: "Computer Science",
          studyType: "B.Tech",
          startDate: "2022-08",
          endDate: "2026-05",
          score: "8.6/10",
          courses: [],
        },
      ],
      projects: [
        {
          id: "p1",
          name: "CampusBus",
          description: "Full-stack bus tracker for the PES campus.",
          highlights: [highlight, highlight],
          keywords: ["React", "Node.js"],
          startDate: "",
          endDate: null,
          url: "https://github.com/ananya-shah/campusbus",
          githubUrl: "",
        },
      ],
      skills: [
        {
          id: "s1",
          name: "Languages",
          level: "",
          keywords: ["TypeScript", "JavaScript", "Python", "SQL"],
          category: "technical",
        },
      ],
      certifications: [
        {
          id: "c1",
          name: "AWS Cloud Practitioner",
          issuer: "Amazon Web Services",
          date: "2025-11",
          url: "",
        },
      ],
      languages: [
        { id: "l1", language: "English", fluency: "Professional" },
        { id: "l2", language: "Hindi", fluency: "Native" },
      ],
    };
    const metadata = {
      ...DEFAULT_RESUME_METADATA,
      sectionOrder: [
        "summary",
        "education",
        "projects",
        "work",
        "skills",
        "certifications",
        "languages",
      ],
      sectionVisibility: {
        ...DEFAULT_RESUME_METADATA.sectionVisibility,
        projects: true,
        certifications: true,
        languages: true,
      },
    };
    const pdf = await renderResumePdf({
      title: "Ananya Shah",
      templateSlug: "minimalist",
      data,
      metadata,
    });
    const parser = new PDFParse({ data: new Uint8Array(pdf) });
    const info = await parser.getInfo();
    await parser.destroy();
    assert.equal(info.total, 1);
  });
});
