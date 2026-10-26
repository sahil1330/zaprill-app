import { expect, test } from "@playwright/test";
import {
  captureScreen,
  getVisibleNavLinks,
  recordFinding,
  waitForAuthenticatedHome,
} from "./helpers/audit";

test.describe("Mobile navigation", () => {
  test("core nav items hidden on mobile viewport", async ({ page }) => {
    await page.goto("/");
    await waitForAuthenticatedHome(page);
    await captureScreen(page, "11-mobile-dashboard", "mobile");

    const navLinks = await getVisibleNavLinks(page);
    const desktopOnlyItems = ["Resume Architect", "Insights", "My Jobs"];
    const visibleDesktopItems = desktopOnlyItems.filter((label) =>
      navLinks.some((l) => l.includes(label)),
    );

    if (visibleDesktopItems.length === 0) {
      recordFinding({
        severity: "P0",
        route: "/",
        title: "Main nav items hidden on mobile — no hamburger menu",
        description:
          "Resume Architect, Insights, and My Jobs use `hidden sm:inline-flex` and are only in the avatar dropdown. Mobile users must discover features via the user menu.",
        heuristic: "Flexibility and efficiency of use",
        viewport: "mobile",
      });
    }

    const userMenu = page.getByRole("button", { name: "Account menu" });
    if (await userMenu.isVisible()) {
      await userMenu.click();
      await captureScreen(page, "12-mobile-user-menu", "mobile");
    }
  });

  test("bottom nav hit targets are at least 44px with readable labels", async ({
    page,
  }) => {
    await page.goto("/");
    await waitForAuthenticatedHome(page);

    const nav = page.getByRole("navigation", { name: "Main navigation" });
    await expect(nav).toBeVisible();

    const expected = ["Home", "Intelligence", "Skill Coach", "Resumes"];
    for (const label of expected) {
      const link = nav.getByRole("link", { name: label });
      await expect(link).toBeVisible();
      const box = await link.boundingBox();
      expect(box).not.toBeNull();
      expect(box?.width).toBeGreaterThanOrEqual(44);
      expect(box?.height).toBeGreaterThanOrEqual(44);

      const fontSize = await link.evaluate((el) => {
        const labelEl = el.querySelector("span");
        return Number.parseFloat(getComputedStyle(labelEl ?? el).fontSize);
      });
      expect(fontSize).toBeGreaterThanOrEqual(12);
    }

    const content = page.locator("[data-slot='app-shell-content']");
    await expect(content).toBeVisible();
    const padding = await content.evaluate((el) => {
      const style = getComputedStyle(el);
      return {
        left: Number.parseFloat(style.paddingLeft),
        top: Number.parseFloat(style.paddingTop),
        bottom: Number.parseFloat(style.paddingBottom),
      };
    });
    expect(padding.left).toBeGreaterThanOrEqual(16);
    expect(padding.top).toBeGreaterThanOrEqual(16);
    expect(padding.bottom).toBeGreaterThanOrEqual(44);
  });

  test("mobile dashboard still exposes primary action", async ({ page }) => {
    await page.goto("/");
    await waitForAuthenticatedHome(page);

    const bodyText = await page.locator("body").innerText();
    const hasPrimaryAction =
      /start new analysis|start.*analysis|new analysis|analyze|gap analysis/i.test(
        bodyText,
      );

    if (!hasPrimaryAction) {
      recordFinding({
        severity: "P0",
        route: "/",
        title: "No primary action visible on mobile dashboard",
        description:
          "Mobile users cannot easily start the core analysis workflow.",
        heuristic: "Recognition rather than recall",
        viewport: "mobile",
      });
    }
  });
});
