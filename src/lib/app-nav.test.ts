import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { APP_NAV_PRIMARY } from "@/lib/app-nav";

describe("APP_NAV_PRIMARY mobile destinations", () => {
  it("marks Intelligence, Skill Coach, and Resumes as mobile primary", () => {
    const urls = APP_NAV_PRIMARY.filter((i) => i.mobilePrimary).map(
      (i) => i.url,
    );
    assert.ok(urls.includes("/intelligence"));
    assert.ok(urls.includes("/skill-coach"));
    assert.ok(urls.includes("/resumes"));
    assert.ok(urls.length <= 5);
  });
});
