import { expect, test } from "@playwright/test";

test.describe("resume library and pdf", () => {
  test("lists every resume, refetches after duplicate and delete, and downloads a PDF", async ({
    page,
    request,
  }) => {
    const stamp = Date.now();
    const alphaTitle = `Library Alpha ${stamp}`;
    const betaTitle = `Library Beta ${stamp}`;

    const alphaRes = await request.post("/api/resumes", {
      data: { title: alphaTitle, templateSlug: "executive-pro" },
    });
    expect(alphaRes.status()).toBe(201);
    const alpha = (await alphaRes.json()).resume;

    const betaRes = await request.post("/api/resumes", {
      data: { title: betaTitle, templateSlug: "modern-split" },
    });
    expect(betaRes.status()).toBe(201);
    const beta = (await betaRes.json()).resume;
    expect(beta.id).not.toBe(alpha.id);

    await page.goto("/resumes");
    await expect(
      page.getByRole("heading", { name: alphaTitle, exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: betaTitle, exact: true }),
    ).toBeVisible();

    const alphaCard = page.locator(`[data-resume-id="${alpha.id}"]`);
    await alphaCard
      .getByRole("button", { name: `Actions for ${alphaTitle}` })
      .click();
    await page.getByRole("menuitem", { name: "Duplicate" }).click();
    await expect(
      page.getByRole("heading", { name: `Copy of ${alphaTitle}`, exact: true }),
    ).toBeVisible();

    page.once("dialog", (dialog) => dialog.accept());
    const betaCard = page.locator(`[data-resume-id="${beta.id}"]`);
    await betaCard
      .getByRole("button", { name: `Actions for ${betaTitle}` })
      .click();
    await page.getByRole("menuitem", { name: "Delete" }).click();
    await expect(
      page.getByRole("heading", { name: betaTitle, exact: true }),
    ).toHaveCount(0);
    await expect(
      page.getByRole("heading", { name: alphaTitle, exact: true }),
    ).toBeVisible();

    const listed = await request.get("/api/resumes");
    const titles = (
      (await listed.json()).resumes as Array<{ title: string }>
    ).map((item) => item.title);
    expect(titles).toContain(alphaTitle);
    expect(titles).toContain(`Copy of ${alphaTitle}`);
    expect(titles).not.toContain(betaTitle);

    const firstSnap = await request.post(`/api/resumes/${alpha.id}/versions`, {
      data: { changeDescription: "First snapshot" },
    });
    const secondSnap = await request.post(`/api/resumes/${alpha.id}/versions`, {
      data: { changeDescription: "Second snapshot of the same save" },
    });
    expect(firstSnap.ok()).toBeTruthy();
    expect(secondSnap.ok()).toBeTruthy();
    const firstVersion = (await firstSnap.json()).version.version;
    const secondVersion = (await secondSnap.json()).version.version;
    expect(secondVersion).not.toBe(firstVersion);

    const downloadPromise = page.waitForEvent("download");
    await alphaCard.getByRole("button", { name: "PDF" }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/\.pdf$/);
    const path = await download.path();
    expect(path).toBeTruthy();
    const bytes = await download.createReadStream();
    const chunks: Buffer[] = [];
    for await (const chunk of bytes) chunks.push(Buffer.from(chunk));
    const pdf = Buffer.concat(chunks);
    expect(pdf.subarray(0, 5).toString()).toBe("%PDF-");

    const afterDownload = await request.get(`/api/resumes/${alpha.id}`);
    expect((await afterDownload.json()).resume.downloadCount).toBeGreaterThan(
      0,
    );
  });
});
