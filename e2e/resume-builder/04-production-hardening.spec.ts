import { expect, test } from "@playwright/test";
import {
  ensureResume,
  getResume,
  patchResume,
  type ResumeRecord,
  resetResumeToBaseline,
  VALID_BASELINE_DATA,
  VALID_BASELINE_METADATA,
} from "./helpers/resume-api";
import {
  addWorkExperience,
  clickSave,
  fillBasicsName,
  fillWorkPosition,
  navigateToSection,
  openResumeEditor,
  waitForAutoSave,
  waitForSaveComplete,
} from "./helpers/resume-editor";

test.describe("Resume builder — production hardening", () => {
  test.describe.configure({ mode: "serial" });

  let resume: ResumeRecord;

  test.beforeEach(async ({ request }) => {
    resume = await ensureResume(request);
    resume = await resetResumeToBaseline(request, resume);
  });

  test("auto-save does not fail when a blank experience row is added", async ({
    page,
  }) => {
    await openResumeEditor(page, resume.id);
    await addWorkExperience(page);
    await waitForAutoSave(page);
    await expect(page.getByRole("alertdialog")).toBeHidden();
    await expect(page.getByText("Unsaved")).toBeHidden({ timeout: 10_000 });
  });

  test("auto-save ignores incomplete experience (position without company)", async ({
    page,
  }) => {
    await openResumeEditor(page, resume.id);
    await addWorkExperience(page);
    await fillWorkPosition(page, 0, "Engineer", "");
    await waitForAutoSave(page);
    await expect(page.getByRole("alertdialog")).toBeHidden();
  });

  test("save retries after another session bumps version", async ({
    page,
    request,
  }) => {
    await openResumeEditor(page, resume.id);
    await fillBasicsName(page, "Retry User");
    await expect(page.getByPlaceholder("John Doe")).toHaveValue("Retry User");
    await expect(page.getByText("Unsaved")).toBeVisible();

    const latest = await getResume(request, resume.id);
    if (!latest) throw new Error("Resume disappeared");
    const bump = await patchResume(request, latest.id, {
      version: latest.version,
      title: latest.title,
    });
    expect(bump.ok()).toBeTruthy();
    const { resume: bumped } = await bump.json();

    const patchStatuses: number[] = [];
    page.on("response", (resp) => {
      if (
        /\/api\/resumes\/[^/]+$/.test(resp.url()) &&
        resp.request().method() === "PATCH"
      ) {
        patchStatuses.push(resp.status());
      }
    });

    const savedOk = page.waitForResponse(
      (resp) =>
        /\/api\/resumes\/[^/]+$/.test(resp.url()) &&
        resp.request().method() === "PATCH" &&
        resp.status() === 200,
      { timeout: 20_000 },
    );
    await clickSave(page);
    expect((await savedOk).ok()).toBeTruthy();
    await waitForSaveComplete(page);
    await expect(page.getByText(/Someone else updated/i)).toBeHidden();
    await expect(page.getByText(/Couldn't sync this tab/i)).toBeHidden();
    expect(patchStatuses).toContain(409);
    expect(patchStatuses).toContain(200);

    const saved = await getResume(request, resume.id);
    expect(saved?.data.basics.name).toBe("Retry User");
    expect(saved?.version).toBeGreaterThan(bumped.version);
  });

  test("API clamps oversized skill keywords instead of 400", async ({
    request,
  }) => {
    const longKeyword = "K".repeat(80);
    const res = await patchResume(request, resume.id, {
      version: resume.version,
      data: {
        ...VALID_BASELINE_DATA,
        skills: [
          {
            id: "skill-clamp-1",
            name: "Languages",
            level: "Expert",
            keywords: [longKeyword, "TypeScript"],
            category: "technical",
          },
        ],
      },
    });

    expect(res.ok()).toBeTruthy();
    const { resume: saved } = await res.json();
    expect(saved.data.skills[0].keywords[0]).toHaveLength(50);
    expect(saved.data.skills[0].keywords).toContain("TypeScript");
  });

  test("Tech Stack pills show level once per group, not on every chip", async ({
    page,
    request,
  }) => {
    const patched = await patchResume(request, resume.id, {
      version: resume.version,
      templateSlug: "tech-stack",
      data: {
        ...VALID_BASELINE_DATA,
        skills: [
          {
            id: "skill-pills-1",
            name: "Frontend",
            level: "Expert",
            keywords: ["React", "TypeScript", "Next.js"],
            category: "technical",
          },
        ],
      },
      metadata: {
        ...VALID_BASELINE_METADATA,
        sectionVisibility: {
          ...VALID_BASELINE_METADATA.sectionVisibility,
          skills: true,
        },
      },
    });
    expect(patched.ok()).toBeTruthy();

    await openResumeEditor(page, resume.id);
    const preview = page.locator(".resume-preview-paper");
    await expect(preview).toBeVisible();
    await expect(preview.getByText("Frontend")).toBeVisible();
    await expect(preview.locator(".ts-skill-level")).toHaveText("Expert");
    await expect(preview.locator(".ts-tag")).toHaveCount(3);
    await expect(preview.locator(".ts-tag").first()).toHaveText("React");
    await expect(
      preview.locator(".ts-tag").filter({ hasText: "Expert" }),
    ).toHaveCount(0);
  });

  test("preview shows a page-count badge", async ({ page }) => {
    await openResumeEditor(page, resume.id);
    await expect(page.getByText("1 page")).toBeVisible();
  });

  test("Design and ATS Score nav controls open the matching sheets", async ({
    page,
  }) => {
    await openResumeEditor(page, resume.id);

    await page.getByRole("button", { name: "Design", exact: true }).click();
    await expect(page.getByText("Resume Settings")).toBeVisible();
    await page.keyboard.press("Escape");

    await page.getByRole("button", { name: "ATS Score", exact: true }).click();
    await expect(
      page.getByText("Score your resume against a job description"),
    ).toBeVisible();
  });

  test("skill keywords longer than 50 characters are rejected in the form", async ({
    page,
  }) => {
    await openResumeEditor(page, resume.id);
    await navigateToSection(page, "Skills");
    await page.getByRole("button", { name: /Add Skill Group/i }).click();
    await page.getByPlaceholder("Frontend Development").fill("Frontend");

    const skillInput = page.getByPlaceholder("Type a skill and press Enter");
    await expect(skillInput).toHaveAttribute("maxlength", "50");
    await expect(page.getByText(/Max 50 characters per skill/i)).toBeVisible();
  });
});
