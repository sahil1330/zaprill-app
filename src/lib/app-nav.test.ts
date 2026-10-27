import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  APP_NAV_LINKED,
  APP_NAV_PRIMARY,
  APP_NAV_SECONDARY,
  getNavTitle,
} from "@/lib/app-nav";

describe("APP_NAV_PRIMARY", () => {
  it("is Home, Skill Coach, and Resumes, all mobile primary", () => {
    assert.deepEqual(
      APP_NAV_PRIMARY.map((item) => item.title),
      ["Home", "Skill Coach", "Resumes"],
    );
    assert.deepEqual(
      APP_NAV_PRIMARY.map((item) => item.url),
      ["/", "/skill-coach", "/resumes"],
    );
    assert.deepEqual(
      APP_NAV_PRIMARY.map((item) => item.mobilePrimary),
      [true, true, true],
    );
  });

  it("does not list Intelligence, Analyze, My Jobs, or Career Insights", () => {
    const urls = APP_NAV_PRIMARY.map((item) => item.url);
    for (const url of ["/intelligence", "/analyze", "/jobs", "/history"]) {
      assert.equal(urls.includes(url), false);
    }
  });
});

describe("APP_NAV_SECONDARY", () => {
  it("stays Profile, Billing, Referrals", () => {
    assert.deepEqual(
      APP_NAV_SECONDARY.map((item) => [item.title, item.url]),
      [
        ["Profile", "/profile"],
        ["Billing", "/billing"],
        ["Referrals", "/referrals"],
      ],
    );
  });
});

describe("APP_NAV_LINKED", () => {
  it("is the Home strip, not a sidebar list", () => {
    assert.deepEqual(
      APP_NAV_LINKED.map((item) => [item.title, item.url]),
      [
        ["Analyze", "/analyze"],
        ["My Jobs", "/jobs"],
        ["Career Insights", "/history"],
      ],
    );
  });
});

describe("getNavTitle", () => {
  it("names linked routes and account routes", () => {
    assert.equal(getNavTitle("/"), "Home");
    assert.equal(getNavTitle("/analyze"), "Analyze");
    assert.equal(getNavTitle("/jobs"), "My Jobs");
    assert.equal(getNavTitle("/history"), "Career Insights");
    assert.equal(getNavTitle("/profile"), "Profile");
    assert.equal(getNavTitle("/billing"), "Billing");
    assert.equal(getNavTitle("/skill-coach"), "Skill Coach");
  });
});
