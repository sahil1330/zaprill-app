import { expect, type Page } from "@playwright/test";

export async function waitForEditorReady(page: Page) {
  await expect(page.getByText("Loading resume...")).toBeHidden({
    timeout: 25_000,
  });
  // Header title input is always present once the editor shell loads
  await expect(page.locator("header input").first()).toBeVisible({
    timeout: 15_000,
  });
}

export async function openResumeEditor(page: Page, resumeId: string) {
  await page.goto(`/resumes/${resumeId}`);
  await waitForEditorReady(page);
}

export async function navigateToSection(page: Page, sectionLabel: string) {
  await page.getByRole("button", { name: sectionLabel, exact: true }).click();
  await expect(
    page.getByRole("heading", { name: sectionLabel, exact: true }),
  ).toBeVisible();
}

export async function fillBasicsName(page: Page, name: string) {
  await page.getByPlaceholder("John Doe").fill(name);
}

export async function fillBasicsEmail(page: Page, email: string) {
  await page.getByPlaceholder("john@example.com").fill(email);
}

export async function fillPersonalWebsite(page: Page, url: string) {
  await page.getByPlaceholder("https://johndoe.dev").fill(url);
}

export async function clickSave(page: Page) {
  const saveBtn = page.getByRole("button", { name: "Save", exact: true });
  await expect(saveBtn).toBeEnabled({ timeout: 10_000 });
  await saveBtn.click();
}

export async function triggerServerSave(page: Page) {
  // Prefer manual save; fall back to waiting for auto-save debounce (5s)
  const saveBtn = page.getByRole("button", { name: "Save", exact: true });
  if (await saveBtn.isEnabled()) {
    await saveBtn.click();
  } else {
    await page.waitForTimeout(6_500);
  }
}

export async function waitForSaveComplete(page: Page) {
  // Saved state shows a check icon near the title (no "Unsaved" label)
  await expect(page.getByText("Unsaved")).toBeHidden({ timeout: 20_000 });
}

export async function waitForAutoSave(page: Page) {
  const patchResponse = page
    .waitForResponse(
      (resp) =>
        /\/api\/resumes\/[^/]+$/.test(resp.url()) &&
        resp.request().method() === "PATCH" &&
        resp.status() === 200,
      { timeout: 20_000 },
    )
    .catch(() => null);

  // Server auto-save debounce is 5s; 409 retries issue a later 200
  await page.waitForTimeout(6_500);
  const response = await patchResponse;

  if (response) {
    await expect(page.getByText("Unsaved")).toBeHidden({ timeout: 5_000 });
    return;
  }

  // Fallback: allow extra time for slow saves
  await expect(page.getByText("Unsaved")).toBeHidden({ timeout: 25_000 });
}

export async function expectValidationDialog(page: Page) {
  const dialog = page.getByRole("alertdialog");
  await expect(dialog).toBeVisible({ timeout: 15_000 });
  await expect(dialog.getByText("Validation Failed")).toBeVisible();
  return dialog;
}

/** Accept either inline RHF/Zod errors or the server validation dialog. */
export async function expectValidationFeedback(
  page: Page,
  message: string | RegExp,
) {
  const dialog = page.getByRole("alertdialog");
  const inline = page.getByText(message).first();

  await expect(dialog.or(inline).first()).toBeVisible({ timeout: 15_000 });

  if (await dialog.isVisible()) {
    return "dialog" as const;
  }
  return "inline" as const;
}

export async function dismissValidationDialog(page: Page) {
  await page.getByRole("button", { name: "Got it, I'll fix it" }).click();
  await expect(page.getByRole("alertdialog")).toBeHidden();
}

export async function openSettings(page: Page) {
  await page.getByRole("button", { name: "Resume settings" }).click();
  await expect(page.getByText("Resume Settings")).toBeVisible();
}

export async function addWorkExperience(page: Page) {
  await navigateToSection(page, "Experience");
  const addBtn = page.getByRole("button", { name: /Add Experience/i });
  if (await addBtn.isVisible()) {
    await addBtn.click();
  }
  await expect(page.getByText("Position 1")).toBeVisible();
}

function workCard(page: Page, index: number) {
  return page
    .getByText(`Position ${index + 1}`, { exact: true })
    .locator("xpath=ancestor::div[contains(@class,'border-border')][1]");
}

export async function fillWorkPosition(
  page: Page,
  index: number,
  position: string,
  company: string,
) {
  await page.locator(`input[name="work.${index}.position"]`).fill(position);
  await page.locator(`input[name="work.${index}.company"]`).fill(company);
}

export async function fillWorkStartDate(
  page: Page,
  index: number,
  date: string,
) {
  await page.locator(`input[name="work.${index}.startDate"]`).fill(date);
}

export async function addSocialProfile(page: Page) {
  await page.getByRole("button", { name: "Add Profile" }).click();
}

export async function fillSocialProfileUrl(page: Page, url: string) {
  await page
    .getByPlaceholder("https://linkedin.com/in/johndoe")
    .last()
    .fill(url);
}

export async function getPreviewText(page: Page): Promise<string> {
  const preview = page.locator(".resume-preview-paper");
  await expect(preview).toBeVisible();
  return preview.innerText();
}
