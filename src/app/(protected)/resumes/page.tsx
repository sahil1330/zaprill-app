"use client";

import {
  IconActivity,
  IconAward,
  IconBolt,
  IconCopy,
  IconDotsVertical,
  IconDownload,
  IconEdit,
  IconEye,
  IconFileText,
  IconLoader2,
  IconPlus,
  IconSearch,
  IconSparkles,
  IconTarget,
  IconTrash,
} from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { PageHeader } from "@/components/app/page-header";
import CreativePortfolioTemplate from "@/components/resume/templates/CreativePortfolioTemplate";
import ExecutiveProTemplate from "@/components/resume/templates/ExecutiveProTemplate";
import MinimalistTemplate from "@/components/resume/templates/MinimalistTemplate";
import ModernSplitTemplate from "@/components/resume/templates/ModernSplitTemplate";
import { TEMPLATE_REGISTRY } from "@/components/resume/templates/registry";
import TechStackTemplate from "@/components/resume/templates/TechStackTemplate";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  DEFAULT_RESUME_DATA,
  DEFAULT_RESUME_METADATA,
  type ResumeListItem,
} from "@/types/resume";
import "@/components/resume/templates/resume-templates.css";

const TEMPLATE_COMPONENTS: Record<string, any> = {
  minimalist: MinimalistTemplate,
  "tech-stack": TechStackTemplate,
  "executive-pro": ExecutiveProTemplate,
  "creative-portfolio": CreativePortfolioTemplate,
  "modern-split": ModernSplitTemplate,
};

function ResumeThumbnail({ resume }: { resume: ResumeListItem }) {
  const TemplateComponent =
    TEMPLATE_COMPONENTS[resume.templateSlug] ?? MinimalistTemplate;

  // Safety check: ensure data and metadata are present
  // Even if they are null in the DB, we pass fallbacks to the template
  const resumeData = resume.data || DEFAULT_RESUME_DATA;
  const resumeMetadata = resume.metadata || DEFAULT_RESUME_METADATA;

  return (
    <div className="relative h-[452px] w-[320px] overflow-hidden rounded-md border border-border/10 bg-white shadow-2xl transition-all duration-500 group-hover:shadow-primary/20">
      <div className="pointer-events-none absolute top-0 left-0 h-[1130px] w-[800px] origin-top-left scale-[0.4]">
        <div className="h-full w-full p-10">
          <TemplateComponent data={resumeData} metadata={resumeMetadata} />
        </div>
      </div>
    </div>
  );
}

export default function ResumesPage() {
  const router = useRouter();
  const [resumes, setResumes] = useState<ResumeListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  const fetchResumes = useCallback(async () => {
    try {
      const res = await fetch("/api/resumes");
      if (res.ok) {
        const data = await res.json();
        setResumes(data.resumes);
      }
    } catch (err) {
      console.error("Failed to fetch resumes:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchResumes();
  }, [fetchResumes]);

  const handleCreate = async () => {
    setIsCreating(true);
    try {
      const res = await fetch("/api/resumes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (res.ok) {
        const data = await res.json();
        router.push(`/resumes/${data.resume.id}`);
      }
    } catch (err) {
      console.error("Failed to create resume:", err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      const res = await fetch(`/api/resumes/${id}/duplicate`, {
        method: "POST",
      });
      if (res.ok) {
        fetchResumes();
      }
    } catch (err) {
      console.error("Failed to duplicate resume:", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (
      !confirm(
        "Are you sure you want to delete your resume? This cannot be undone.",
      )
    )
      return;
    try {
      const res = await fetch(`/api/resumes/${id}`, { method: "DELETE" });
      if (res.ok) {
        setResumes([]);
      }
    } catch (err) {
      console.error("Failed to delete resume:", err);
    }
  };

  const activeResume = resumes[0]; // Primary resume for the one-resume dashboard

  const getTemplateName = (slug: string) =>
    TEMPLATE_REGISTRY.find((t) => t.slug === slug)?.name ?? slug;

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-6">
      <PageHeader
        title="Resumes"
        description="Upload, edit, and export your professional resume."
      />

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-10">
          <IconLoader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !activeResume && (
        <div className="py-20 text-center">
          <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-3xl bg-primary/10 shadow-primary/5 shadow-xl">
            <IconSparkles className="h-12 w-12 text-primary" />
          </div>
          <h2 className="mb-4 font-black text-4xl tracking-tight">
            Build your professional identity
          </h2>
          <p className="mx-auto mb-10 max-w-lg font-medium text-lg text-muted-foreground leading-relaxed">
            Create a stunning, ATS-optimized resume that gets you noticed by top
            companies. Our AI handles the complexity while you focus on your
            career.
          </p>
          <Button
            onClick={handleCreate}
            disabled={isCreating}
            variant="gradient"
            size="lg"
            className="h-14 gap-2 rounded-full px-10 font-black text-lg transition-all"
          >
            {isCreating ? (
              <IconLoader2 className="h-6 w-6 animate-spin" />
            ) : (
              <IconPlus className="h-6 w-6" />
            )}
            Create Your Resume
          </Button>
        </div>
      )}

      {/* Dashboard Content */}
      {!isLoading && activeResume && (
        <div className="fade-in slide-in-from-bottom-8 animate-in duration-700">
          <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <h1 className="font-black text-5xl text-foreground tracking-tighter">
                Your Resume
              </h1>
              <p className="mt-2 font-bold text-lg text-muted-foreground">
                Optimized for {activeResume.industry} • Last updated{" "}
                {new Date(activeResume.updatedAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-12 w-12 rounded-xl"
                  >
                    <IconDotsVertical className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem
                    onClick={() => handleDuplicate(activeResume.id)}
                  >
                    <IconCopy className="mr-2 h-4 w-4" /> Duplicate
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => handleDelete(activeResume.id)}
                  >
                    <IconTrash className="mr-2 h-4 w-4" /> Delete Resume
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Featured Preview */}
            <div className="group lg:col-span-2">
              <Card
                className="cursor-pointer overflow-hidden rounded-3xl border-2 border-border/50 shadow-sm transition-all duration-500 hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/5"
                onClick={() => router.push(`/resumes/${activeResume.id}`)}
              >
                <div className="relative flex aspect-4/3 items-center justify-center overflow-hidden bg-linear-to-br from-muted/30 to-muted/80">
                  <div className="absolute inset-0 bg-grid-white/10" />

                  <div className="group-hover:-translate-y-2 mt-12 transition-all duration-700 group-hover:scale-105">
                    <ResumeThumbnail resume={activeResume} />
                  </div>

                  <div className="absolute inset-0 bg-black/0 transition-colors duration-500 group-hover:bg-black/5" />

                  <div className="-translate-x-1/2 absolute bottom-6 left-1/2 translate-y-4 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                    <Button className="h-12 rounded-full px-8 font-black shadow-xl">
                      Open Resume Editor
                    </Button>
                  </div>
                </div>
                <CardContent className="border-border/50 border-t p-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="font-black text-2xl tracking-tight">
                        {activeResume.title}
                      </h2>
                      <div className="mt-2 flex items-center gap-3">
                        <Badge
                          variant="secondary"
                          className="font-bold text-xs uppercase tracking-widest"
                        >
                          {getTemplateName(activeResume.templateSlug)}
                        </Badge>
                        <span className="font-bold text-muted-foreground text-xs">
                          •
                        </span>
                        <span className="flex items-center gap-1 font-bold text-muted-foreground text-xs">
                          <IconActivity className="h-3 w-3" />
                          {activeResume.status}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="mb-1 font-bold text-muted-foreground text-xs uppercase tracking-[0.2em]">
                        Created
                      </div>
                      <div className="font-bold text-xs">
                        {new Date(activeResume.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Stats & Actions */}
            <div className="space-y-6">
              {/* ATS Score Card */}
              <Card className="rounded-3xl border-2 border-primary/5 bg-primary/2 p-8 shadow-sm">
                <h3 className="mb-6 font-black text-primary text-xs uppercase tracking-[0.2em]">
                  ATS Intelligence
                </h3>
                <div className="flex items-center gap-6">
                  <div className="relative flex h-20 w-20 items-center justify-center">
                    <svg className="-rotate-90 h-full w-full">
                      <circle
                        cx="40"
                        cy="40"
                        r="36"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="8"
                        className="text-primary/10"
                      />
                      <circle
                        cx="40"
                        cy="40"
                        r="36"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="8"
                        strokeDasharray={226}
                        strokeDashoffset={
                          226 - (226 * (activeResume.lastAtsScore ?? 0)) / 100
                        }
                        className="text-primary transition-all duration-1000 ease-out"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="font-black text-2xl tracking-tighter">
                        {activeResume.lastAtsScore ?? 0}%
                      </span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="mb-1 font-bold text-foreground text-sm">
                      Global Score
                    </div>
                    <p className="font-medium text-muted-foreground text-xs leading-relaxed">
                      Your resume is {activeResume.lastAtsScore ?? 0}% optimized
                      for search algorithms.
                    </p>
                  </div>
                </div>
              </Card>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4">
                <Card className="rounded-2xl border-border/50 p-5 text-center">
                  <div className="mb-2 font-bold text-muted-foreground text-xs uppercase tracking-widest">
                    Views
                  </div>
                  <div className="font-black text-2xl">
                    {activeResume.viewCount}
                  </div>
                </Card>
                <Card className="rounded-2xl border-border/50 p-5 text-center">
                  <div className="mb-2 font-bold text-muted-foreground text-xs uppercase tracking-widest">
                    Downloads
                  </div>
                  <div className="font-black text-2xl">
                    {activeResume.downloadCount}
                  </div>
                </Card>
              </div>

              {/* Main Actions */}
              <div className="space-y-3 pt-2">
                <Button
                  className="h-14 w-full gap-3 rounded-2xl font-black text-lg shadow-lg"
                  onClick={() => router.push(`/resumes/${activeResume.id}`)}
                >
                  <IconEdit className="h-5 w-5" /> Edit Content
                </Button>
                <Button
                  variant="outline"
                  className="h-14 w-full gap-3 rounded-2xl border-2 font-black text-lg transition-all hover:border-primary/30 hover:bg-primary/5"
                  onClick={() => {
                    sessionStorage.setItem(
                      "ai_job_god_resume",
                      JSON.stringify(activeResume.data),
                    );
                    router.push("/analyze");
                  }}
                >
                  <IconBolt className="h-5 w-5 text-primary" /> Analyze & Tailor
                </Button>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <Button
                    variant="ghost"
                    className="h-12 gap-2 rounded-xl font-bold text-muted-foreground hover:text-foreground"
                    onClick={() =>
                      window.open(
                        `/resumes/${activeResume.id}/export`,
                        "_blank",
                      )
                    }
                  >
                    <IconDownload className="h-4 w-4" /> PDF
                  </Button>
                  <Button
                    variant="ghost"
                    className="h-12 gap-2 rounded-xl font-bold text-muted-foreground hover:text-foreground"
                    onClick={() =>
                      window.open(
                        `/resumes/${activeResume.id}/export?preview=true`,
                        "_blank",
                      )
                    }
                  >
                    <IconEye className="h-4 w-4" /> Preview
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
