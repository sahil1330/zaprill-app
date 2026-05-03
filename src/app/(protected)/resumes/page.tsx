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
import Navbar from "@/components/Navbar";
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
import useAuth from "@/hooks/useAuth";
import type { ResumeListItem } from "@/types/resume";
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

  return (
    <div className="w-[320px] h-[452px] relative overflow-hidden rounded-md border border-border/10 shadow-2xl bg-white group-hover:shadow-primary/20 transition-all duration-500">
      <div className="w-[800px] h-[1130px] absolute top-0 left-0 origin-top-left scale-[0.4] pointer-events-none">
        <div className="w-full h-full p-10">
          <TemplateComponent data={resume.data} metadata={resume.metadata} />
        </div>
      </div>
    </div>
  );
}

export default function ResumesPage() {
  const router = useRouter();
  const { user } = useAuth();
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
    <div className="min-h-screen flex flex-col bg-background text-foreground font-sans">
      <Navbar
        showBack
        backHref="/"
        backLabel="Home"
        user={
          user
            ? { name: user.name, email: user.email, image: user.image }
            : null
        }
        pageTitle={
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
              <IconFileText className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-extrabold text-lg tracking-tight">
              Resume Dashboard
            </span>
          </div>
        }
      />

      <div className="max-w-6xl mx-auto px-6 py-10 w-full flex-1">
        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <IconLoader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !activeResume && (
          <div className="text-center py-20">
            <div className="w-24 h-24 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto mb-8 shadow-xl shadow-primary/5">
              <IconSparkles className="h-12 w-12 text-primary" />
            </div>
            <h2 className="text-4xl font-black tracking-tight mb-4">
              Build your professional identity
            </h2>
            <p className="text-lg text-muted-foreground font-medium max-w-lg mx-auto mb-10 leading-relaxed">
              Create a stunning, ATS-optimized resume that gets you noticed by
              top companies. Our AI handles the complexity while you focus on
              your career.
            </p>
            <Button
              onClick={handleCreate}
              disabled={isCreating}
              variant="gradient"
              size="lg"
              className="gap-2 h-14 px-10 font-black text-lg rounded-full transition-all"
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
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
              <div>
                <h1 className="text-5xl font-black tracking-tighter text-foreground">
                  Your Resume
                </h1>
                <p className="text-lg text-muted-foreground font-bold mt-2">
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
                      <IconCopy className="h-4 w-4 mr-2" /> Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => handleDelete(activeResume.id)}
                    >
                      <IconTrash className="h-4 w-4 mr-2" /> Delete Resume
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Featured Preview */}
              <div className="lg:col-span-2 group">
                <Card
                  className="overflow-hidden border-2 border-border/50 hover:border-primary/30 transition-all duration-500 cursor-pointer shadow-sm hover:shadow-2xl hover:shadow-primary/5 rounded-3xl"
                  onClick={() => router.push(`/resumes/${activeResume.id}`)}
                >
                  <div className="aspect-[4/3] bg-gradient-to-br from-muted/30 to-muted/80 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-grid-white/10" />

                    <div className="mt-12 transition-all duration-700 group-hover:scale-105 group-hover:-translate-y-2">
                      <ResumeThumbnail resume={activeResume} />
                    </div>

                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500" />

                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                      <Button className="font-black h-12 px-8 rounded-full shadow-xl">
                        Open Resume Editor
                      </Button>
                    </div>
                  </div>
                  <CardContent className="p-8 border-t border-border/50">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-2xl font-black tracking-tight">
                          {activeResume.title}
                        </h2>
                        <div className="flex items-center gap-3 mt-2">
                          <Badge
                            variant="secondary"
                            className="font-bold uppercase tracking-widest text-[10px]"
                          >
                            {getTemplateName(activeResume.templateSlug)}
                          </Badge>
                          <span className="text-muted-foreground text-xs font-bold">
                            •
                          </span>
                          <span className="text-xs text-muted-foreground font-bold flex items-center gap-1">
                            <IconActivity className="h-3 w-3" />
                            {activeResume.status}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-1">
                          Created
                        </div>
                        <div className="text-xs font-bold">
                          {new Date(
                            activeResume.createdAt,
                          ).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Stats & Actions */}
              <div className="space-y-6">
                {/* ATS Score Card */}
                <Card className="p-8 rounded-3xl border-2 border-primary/5 bg-primary/[0.02] shadow-sm">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary mb-6">
                    ATS Intelligence
                  </h3>
                  <div className="flex items-center gap-6">
                    <div className="relative h-20 w-20 flex items-center justify-center">
                      <svg className="h-full w-full -rotate-90">
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
                        <span className="text-2xl font-black tracking-tighter">
                          {activeResume.lastAtsScore ?? 0}%
                        </span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-bold text-foreground mb-1">
                        Global Score
                      </div>
                      <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                        Your resume is {activeResume.lastAtsScore ?? 0}%
                        optimized for search algorithms.
                      </p>
                    </div>
                  </div>
                </Card>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <Card className="p-5 rounded-2xl border-border/50 text-center">
                    <div className="text-sm font-black text-muted-foreground uppercase tracking-widest text-[9px] mb-2">
                      Views
                    </div>
                    <div className="text-2xl font-black">
                      {activeResume.viewCount}
                    </div>
                  </Card>
                  <Card className="p-5 rounded-2xl border-border/50 text-center">
                    <div className="text-sm font-black text-muted-foreground uppercase tracking-widest text-[9px] mb-2">
                      Downloads
                    </div>
                    <div className="text-2xl font-black">
                      {activeResume.downloadCount}
                    </div>
                  </Card>
                </div>

                {/* Main Actions */}
                <div className="space-y-3 pt-2">
                  <Button
                    className="w-full h-14 font-black text-lg gap-3 rounded-2xl shadow-lg"
                    onClick={() => router.push(`/resumes/${activeResume.id}`)}
                  >
                    <IconEdit className="h-5 w-5" /> Edit Content
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full h-14 font-black text-lg gap-3 rounded-2xl border-2 hover:bg-primary/5 hover:border-primary/30 transition-all"
                    onClick={() => {
                      sessionStorage.setItem(
                        "ai_job_god_resume",
                        JSON.stringify(activeResume.data),
                      );
                      router.push("/analyze");
                    }}
                  >
                    <IconBolt className="h-5 w-5 text-primary" /> Analyze &
                    Tailor
                  </Button>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <Button
                      variant="ghost"
                      className="h-12 font-bold gap-2 rounded-xl text-muted-foreground hover:text-foreground"
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
                      className="h-12 font-bold gap-2 rounded-xl text-muted-foreground hover:text-foreground"
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
    </div>
  );
}
