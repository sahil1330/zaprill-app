import assert from "node:assert/strict";
import test from "node:test";
import { toAnnualInr, usesMonthlyStipend } from "@/lib/career/pay";

test("monthly stipend is stored as twelve times the entered amount", () => {
  assert.equal(toAnnualInr("monthly", 25_000), 300_000);
  assert.equal(toAnnualInr("annual", 1_200_000), 1_200_000);
  assert.equal(toAnnualInr("monthly", null), null);
  assert.equal(toAnnualInr("annual", null), null);
});

test("students and current interns use a monthly stipend", () => {
  assert.equal(
    usesMonthlyStipend({ segment: "student", experience: [] }),
    true,
  );
  assert.equal(
    usesMonthlyStipend({
      segment: "fresher",
      experience: [{ employmentType: "internship", isCurrent: true }],
    }),
    true,
  );
  assert.equal(
    usesMonthlyStipend({
      segment: "fresher",
      experience: [{ employmentType: "internship", isCurrent: false }],
    }),
    false,
  );
  assert.equal(
    usesMonthlyStipend({
      segment: "professional",
      experience: [{ employmentType: "full_time", isCurrent: true }],
    }),
    false,
  );
  assert.equal(
    usesMonthlyStipend({
      segment: "professional",
      experience: [{ employmentType: "apprenticeship", isCurrent: true }],
    }),
    true,
  );
});
