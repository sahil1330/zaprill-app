import assert from "node:assert/strict";
import test from "node:test";
import { APP_SHELL_CONTENT_CLASS } from "@/components/app/app-shell";
import { mobileNavLinkClass } from "@/components/app/mobile-bottom-nav";

test("mobile nav links keep a 44px hit area and a readable label", () => {
  const inactive = mobileNavLinkClass(false);
  const active = mobileNavLinkClass(true);

  for (const className of [inactive, active]) {
    assert.match(className, /\bmin-h-14\b/);
    assert.match(className, /\bmin-w-11\b/);
    assert.match(className, /\btext-xs\b/);
    assert.match(className, /min-\[360px\]:text-sm/);
    assert.doesNotMatch(className, /text-\[10px\]/);
    assert.doesNotMatch(className, /uppercase/);
    assert.doesNotMatch(className, /purple|violet|fuchsia/);
  }

  assert.match(active, /text-primary/);
  assert.match(inactive, /text-muted-foreground/);
});

test("app shell content column has paper padding and clears the mobile bar", () => {
  assert.match(APP_SHELL_CONTENT_CLASS, /\bpx-4\b/);
  assert.match(APP_SHELL_CONTENT_CLASS, /\bpt-4\b/);
  assert.match(
    APP_SHELL_CONTENT_CLASS,
    /pb-\[calc\(5rem\+env\(safe-area-inset-bottom\)\)\]/,
  );
  assert.match(APP_SHELL_CONTENT_CLASS, /\bmd:px-6\b/);
  assert.match(APP_SHELL_CONTENT_CLASS, /\bmd:py-6\b/);
  assert.doesNotMatch(APP_SHELL_CONTENT_CLASS, /purple|violet|fuchsia/);
});
