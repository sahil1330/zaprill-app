"use client";

import { FileText, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function AnalyzeNeedsResume() {
  const router = useRouter();

  return (
    <div className="mx-auto my-16 max-w-xl rounded-2xl border bg-card p-10 text-center shadow-sm">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-xl border border-border bg-muted/80">
        <FileText className="h-8 w-8 text-foreground" />
      </div>
      <h2 className="mb-3 font-black text-3xl text-foreground tracking-tight">
        Add a resume to analyze
      </h2>
      <p className="mb-8 font-semibold text-base text-muted-foreground leading-relaxed">
        Job matches and skill gaps need a resume. Upload one or open the
        builder.
      </p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          size="lg"
          className="h-12 flex-1 font-bold"
          onClick={() => router.push("/onboarding")}
        >
          <Upload className="mr-2 h-4 w-4" />
          Upload a resume
        </Button>
        <Button
          size="lg"
          variant="outline"
          className="h-12 flex-1 font-bold"
          onClick={() => router.push("/resumes")}
        >
          <FileText className="mr-2 h-4 w-4" />
          Open resume builder
        </Button>
      </div>
    </div>
  );
}
