import assert from "node:assert/strict";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { PageHeader } from "@/components/app/page-header";
import {
  PageEmpty,
  PageError,
  PageSkeleton,
} from "@/components/app/page-state";

test("PageHeader renders title and optional description", () => {
  const html = renderToStaticMarkup(
    <PageHeader title="Skill Coach" description="Practice the gaps." />,
  );
  assert.match(html, /<h1\b/);
  assert.match(html, /Skill Coach/);
  assert.match(html, /Practice the gaps\./);
  assert.match(html, /text-muted-foreground/);
});

test("PageHeader stacks the action under the title and aligns it on sm+", () => {
  const html = renderToStaticMarkup(
    <PageHeader
      title="Skill Coach"
      action={<button type="button">Start practice</button>}
    />,
  );
  assert.match(html, /Start practice/);
  assert.match(html, /flex-col/);
  assert.match(html, /sm:flex-row/);
  assert.match(html, /data-slot="page-header-action"/);
});

test("PageHeader still renders the existing eyebrow and actions slots", () => {
  const html = renderToStaticMarkup(
    <PageHeader
      title="Intelligence"
      eyebrow="Dashboard"
      actions={<button type="button">Sync</button>}
    />,
  );
  assert.match(html, /Dashboard/);
  assert.match(html, /Sync/);
  assert.match(html, /data-slot="page-header-action"/);
});

test("PageEmpty renders a muted hairline card with title, description, and action", () => {
  const html = renderToStaticMarkup(
    <PageEmpty
      title="No programs yet"
      description="Add a target role to start coaching."
      action={<button type="button">Add role</button>}
    />,
  );
  assert.match(html, /No programs yet/);
  assert.match(html, /Add a target role to start coaching\./);
  assert.match(html, /Add role/);
  assert.match(html, /data-slot="page-empty"/);
  assert.match(html, /rounded-lg/);
  assert.match(html, /border-border/);
  assert.match(html, /text-muted-foreground/);
});

test("PageError shows a destructive-soft message and an optional Retry button", () => {
  const withRetry = renderToStaticMarkup(
    <PageError
      message="Could not load your career file."
      onRetry={() => undefined}
    />,
  );
  assert.match(withRetry, /Could not load your career file\./);
  assert.match(withRetry, /Retry/);
  assert.match(withRetry, /data-slot="page-error"/);
  assert.match(withRetry, /destructive/);
  assert.match(withRetry, /role="alert"/);

  const withoutRetry = renderToStaticMarkup(
    <PageError message="Could not load your career file." />,
  );
  assert.doesNotMatch(withoutRetry, /Retry/);
});

test("PageSkeleton renders the requested rows inside a hairline card", () => {
  const html = renderToStaticMarkup(<PageSkeleton rows={3} />);
  const rows = html.match(/data-slot="skeleton"/g) ?? [];
  assert.equal(rows.length, 3);
  assert.match(html, /data-slot="page-skeleton"/);
  assert.match(html, /rounded-lg/);
  assert.match(html, /border-border/);
});

test("PageSkeleton defaults to three rows", () => {
  const html = renderToStaticMarkup(<PageSkeleton />);
  const rows = html.match(/data-slot="skeleton"/g) ?? [];
  assert.equal(rows.length, 3);
});
