import { describe, expect, it } from "vitest";
import { APP_NAV_PRIMARY } from "@/lib/app-nav";

describe("APP_NAV_PRIMARY mobile destinations", () => {
  it("marks Intelligence, Skill Coach, and Resumes as mobile primary", () => {
    const urls = APP_NAV_PRIMARY.filter((i) => i.mobilePrimary).map(
      (i) => i.url,
    );
    expect(urls).toContain("/intelligence");
    expect(urls).toContain("/skill-coach");
    expect(urls).toContain("/resumes");
    expect(urls.length).toBeLessThanOrEqual(5);
  });
});
