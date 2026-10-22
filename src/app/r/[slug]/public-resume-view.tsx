"use client";

import { Loader2 } from "lucide-react";
import Link from "next/link";
import { use, useEffect, useState } from "react";
import ResumeDocument from "@/components/resume/templates/ResumeDocument";
import { Button } from "@/components/ui/button";
import { normalizeResumeData, normalizeResumeMetadata } from "@/lib/resume";
import type { ResumeData, ResumeMetadata } from "@/types/resume";
import "@/components/resume/templates/resume-templates.css";

type PublicResume = {
  title: string;
  templateSlug: string;
  data: ResumeData;
  metadata: ResumeMetadata;
};

export default function PublicResumeView({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [resume, setResume] = useState<PublicResume | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch(`/api/resumes/public/${encodeURIComponent(slug)}`);
        const body = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(
            res.status === 404
              ? "This resume is not shared."
              : body.error || "Failed to load resume",
          );
        }
        if (cancelled) return;
        setResume({
          title: body.resume.title,
          templateSlug: body.resume.templateSlug ?? "minimalist",
          data: normalizeResumeData(body.resume.data),
          metadata: normalizeResumeMetadata(body.resume.metadata),
        });
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load resume");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  return (
    <div className="min-h-screen bg-muted/40">
      <header className="sticky top-0 z-10 border-border border-b bg-background/95 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <Link href="/" className="font-heading font-semibold tracking-tight">
            Zaprill
          </Link>
          <p className="text-muted-foreground text-sm">Shared resume</p>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-24 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading resume
          </div>
        ) : error || !resume ? (
          <div className="mx-auto max-w-md py-24 text-center">
            <h1 className="font-heading font-semibold text-xl">
              Resume unavailable
            </h1>
            <p className="mt-2 text-muted-foreground text-sm">
              {error ?? "This link does not open a shared resume."}
            </p>
            <Button className="mt-6" render={<Link href="/" />}>
              Go to Zaprill
            </Button>
          </div>
        ) : (
          <ResumeDocument
            data={resume.data}
            metadata={resume.metadata}
            templateSlug={resume.templateSlug}
          />
        )}
      </main>
    </div>
  );
}
