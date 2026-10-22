"use client";

import {
  IconCopy,
  IconDotsVertical,
  IconDownload,
  IconEdit,
  IconEye,
  IconLoader2,
  IconPlus,
  IconTrash,
} from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app/page-header";
import CreativePortfolioTemplate from "@/components/resume/templates/CreativePortfolioTemplate";
import ExecutiveProTemplate from "@/components/resume/templates/ExecutiveProTemplate";
import MinimalistTemplate from "@/components/resume/templates/MinimalistTemplate";
import ModernSplitTemplate from "@/components/resume/templates/ModernSplitTemplate";
import { TEMPLATE_REGISTRY } from "@/components/resume/templates/registry";
import TechStackTemplate from "@/components/resume/templates/TechStackTemplate";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { normalizeResumeData, normalizeResumeMetadata } from "@/lib/resume";
import { downloadResumePdf } from "@/lib/resume/download-pdf";
import type {
  ResumeData,
  ResumeListItem,
  ResumeMetadata,
} from "@/types/resume";
import "@/components/resume/templates/resume-templates.css";

const TEMPLATE_COMPONENTS: Record<
  string,
  React.ComponentType<{ data: ResumeData; metadata: ResumeMetadata }>
> = {
  minimalist: MinimalistTemplate,
  "tech-stack": TechStackTemplate,
  "executive-pro": ExecutiveProTemplate,
  "creative-portfolio": CreativePortfolioTemplate,
  "modern-split": ModernSplitTemplate,
};

function ResumeThumbnail({ resume }: { resume: ResumeListItem }) {
  const TemplateComponent =
    TEMPLATE_COMPONENTS[resume.templateSlug] ?? MinimalistTemplate;

  return (
    <div className="relative h-56 overflow-hidden border-border/60 border-b bg-muted/30">
      <div className="-translate-x-1/2 pointer-events-none absolute top-3 left-1/2 h-[1100px] w-[800px] origin-top scale-[0.28]">
        <div className="h-full w-full bg-white p-8 shadow-sm">
          <TemplateComponent
            data={normalizeResumeData(resume.data)}
            metadata={normalizeResumeMetadata(resume.metadata)}
          />
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
  const [busyId, setBusyId] = useState<string | null>(null);

  const fetchResumes = useCallback(async () => {
    try {
      const res = await fetch("/api/resumes");
      if (!res.ok) {
        throw new Error("Failed to fetch resumes");
      }
      const data = await res.json();
      setResumes(Array.isArray(data.resumes) ? data.resumes : []);
    } catch (err) {
      console.error("Failed to fetch resumes:", err);
      toast.error("Couldn't load your resumes.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchResumes();
  }, [fetchResumes]);

  const handleCreate = async () => {
    setIsCreating(true);
    try {
      const res = await fetch("/api/resumes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (!res.ok) {
        throw new Error("Failed to create resume");
      }
      const data = await res.json();
      router.push(`/resumes/${data.resume.id}`);
    } catch (err) {
      console.error("Failed to create resume:", err);
      toast.error("Couldn't create a resume.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDuplicate = async (id: string) => {
    setBusyId(id);
    try {
      const res = await fetch(`/api/resumes/${id}/duplicate`, {
        method: "POST",
      });
      if (!res.ok) {
        throw new Error("Failed to duplicate resume");
      }
      await fetchResumes();
    } catch (err) {
      console.error("Failed to duplicate resume:", err);
      toast.error("Couldn't duplicate this resume.");
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this resume? This cannot be undone.")) return;
    setBusyId(id);
    try {
      const res = await fetch(`/api/resumes/${id}`, { method: "DELETE" });
      if (!res.ok) {
        throw new Error("Failed to delete resume");
      }
      await fetchResumes();
    } catch (err) {
      console.error("Failed to delete resume:", err);
      toast.error("Couldn't delete this resume.");
    } finally {
      setBusyId(null);
    }
  };

  const handleDownload = async (id: string) => {
    setBusyId(id);
    try {
      await downloadResumePdf(id);
      await fetchResumes();
    } catch (err) {
      console.error("Failed to export resume:", err);
      toast.error("Couldn't download the PDF.");
    } finally {
      setBusyId(null);
    }
  };

  const getTemplateName = (slug: string) =>
    TEMPLATE_REGISTRY.find((template) => template.slug === slug)?.name ?? slug;

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-6">
      <PageHeader
        title="Resumes"
        description="Keep a resume for each role. Duplicate one, tailor it, and the others stay in the library."
        actions={
          resumes.length > 0 ? (
            <Button
              onClick={handleCreate}
              disabled={isCreating}
              className="gap-2"
            >
              {isCreating ? (
                <IconLoader2 className="h-4 w-4 animate-spin" />
              ) : (
                <IconPlus className="h-4 w-4" />
              )}
              New resume
            </Button>
          ) : null
        }
      />

      {isLoading && (
        <div className="flex items-center justify-center py-10">
          <IconLoader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {!isLoading && resumes.length === 0 && (
        <div className="py-20 text-center">
          <h2 className="mb-4 font-black text-4xl tracking-tight">
            Build your professional identity
          </h2>
          <p className="mx-auto mb-10 max-w-lg font-medium text-lg text-muted-foreground leading-relaxed">
            Create a resume for the role you want, then duplicate it when the
            next job asks for a different story.
          </p>
          <Button
            onClick={handleCreate}
            disabled={isCreating}
            variant="gradient"
            size="lg"
            className="h-14 gap-2 rounded-full px-10 font-black text-lg"
          >
            {isCreating ? (
              <IconLoader2 className="h-6 w-6 animate-spin" />
            ) : (
              <IconPlus className="h-6 w-6" />
            )}
            Create your resume
          </Button>
        </div>
      )}

      {!isLoading && resumes.length > 0 && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {resumes.map((item) => (
            <Card
              key={item.id}
              data-resume-id={item.id}
              className="overflow-hidden rounded-3xl border-border/60"
            >
              <button
                type="button"
                className="block w-full text-left"
                onClick={() => router.push(`/resumes/${item.id}`)}
              >
                <ResumeThumbnail resume={item} />
              </button>
              <CardContent className="space-y-4 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="truncate font-black text-xl tracking-tight">
                      {item.title}
                    </h2>
                    <p className="mt-1 text-muted-foreground text-xs">
                      Updated {new Date(item.updatedAt).toLocaleDateString()}
                      {item.industry ? ` · ${item.industry}` : ""}
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        aria-label={`Actions for ${item.title}`}
                        disabled={busyId === item.id}
                      >
                        <IconDotsVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => handleDuplicate(item.id)}
                      >
                        <IconCopy className="mr-2 h-4 w-4" /> Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => handleDelete(item.id)}
                      >
                        <IconTrash className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">
                    {getTemplateName(item.templateSlug)}
                  </Badge>
                  <Badge variant="outline">{item.status}</Badge>
                  <span className="text-muted-foreground text-xs">
                    ATS {item.lastAtsScore ?? 0}
                  </span>
                  <span className="text-muted-foreground text-xs">
                    {item.viewCount} views
                  </span>
                  <span className="text-muted-foreground text-xs">
                    {item.downloadCount} downloads
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <Button
                    className="gap-1.5"
                    onClick={() => router.push(`/resumes/${item.id}`)}
                  >
                    <IconEdit className="h-4 w-4" /> Edit
                  </Button>
                  <Button
                    variant="outline"
                    className="gap-1.5"
                    disabled={busyId === item.id}
                    onClick={() => handleDownload(item.id)}
                  >
                    <IconDownload className="h-4 w-4" /> PDF
                  </Button>
                  <Button
                    variant="outline"
                    className="gap-1.5"
                    onClick={() =>
                      window.open(
                        `/resumes/${item.id}/export?preview=true`,
                        "_blank",
                        "noopener,noreferrer",
                      )
                    }
                  >
                    <IconEye className="h-4 w-4" /> Preview
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
