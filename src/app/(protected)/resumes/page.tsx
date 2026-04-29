"use client";

import {
  Copy,
  Download,
  Eye,
  FileText,
  Loader2,
  MoreVertical,
  Plus,
  Search,
  Sparkles,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { TEMPLATE_REGISTRY } from "@/components/resume/templates/registry";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import useAuth from "@/hooks/useAuth";
import type { ResumeListItem } from "@/types/resume";

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  complete: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  archived: "bg-zinc-500/10 text-zinc-500 border-zinc-500/20",
};

export default function ResumesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [resumes, setResumes] = useState<ResumeListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
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
    if (!confirm("Are you sure you want to delete this resume?")) return;
    try {
      const res = await fetch(`/api/resumes/${id}`, { method: "DELETE" });
      if (res.ok) {
        setResumes((prev) => prev.filter((r) => r.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete resume:", err);
    }
  };

  const filteredResumes = resumes.filter((r) =>
    r.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

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
              <FileText className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-extrabold text-lg tracking-tight">
              Resume Builder
            </span>
          </div>
        }
      />

      <div className="max-w-6xl mx-auto px-6 py-10 w-full flex-1">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black tracking-tight">My Resumes</h1>
            <p className="text-muted-foreground font-medium mt-1">
              Create, customize, and export professional resumes
            </p>
          </div>
          <Button
            onClick={handleCreate}
            disabled={isCreating}
            size="lg"
            className="gap-2 font-bold"
          >
            {isCreating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            New Resume
          </Button>
        </div>

        {/* Search */}
        {resumes.length > 0 && (
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search resumes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11"
            />
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* Empty state */}
        {!isLoading && resumes.length === 0 && (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Sparkles className="h-10 w-10 text-primary" />
            </div>
            <h2 className="text-2xl font-black tracking-tight mb-2">
              Build your first resume
            </h2>
            <p className="text-muted-foreground font-medium max-w-md mx-auto mb-8">
              Create a professional, ATS-optimized resume in minutes with our
              AI-powered builder.
            </p>
            <Button
              onClick={handleCreate}
              disabled={isCreating}
              size="lg"
              className="gap-2 font-bold"
            >
              {isCreating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              Create Resume
            </Button>
          </div>
        )}

        {/* Grid */}
        {!isLoading && filteredResumes.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredResumes.map((resume) => (
              <Card
                key={resume.id}
                className="group relative overflow-hidden border-border hover:border-primary/30 transition-all duration-200 cursor-pointer hover:shadow-lg"
                onClick={() => router.push(`/resumes/${resume.id}`)}
              >
                {/* Preview thumbnail placeholder */}
                <div className="h-40 bg-gradient-to-br from-muted/40 to-muted/80 flex items-center justify-center border-b border-border/50">
                  <FileText className="h-12 w-12 text-muted-foreground/30" />
                </div>

                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-sm tracking-tight truncate">
                        {resume.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {getTemplateName(resume.templateSlug)}
                      </p>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger
                        asChild
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/resumes/${resume.id}`);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-2" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDuplicate(resume.id);
                          }}
                        >
                          <Copy className="h-4 w-4 mr-2" /> Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download className="h-4 w-4 mr-2" /> Download PDF
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(resume.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Status + stats */}
                  <div className="flex items-center gap-2 mt-3">
                    <Badge
                      variant="outline"
                      className={`text-[10px] font-bold uppercase ${STATUS_COLORS[resume.status] ?? ""}`}
                    >
                      {resume.status}
                    </Badge>
                    {resume.lastAtsScore !== null && (
                      <Badge
                        variant="outline"
                        className="text-[10px] font-bold"
                      >
                        ATS: {resume.lastAtsScore}%
                      </Badge>
                    )}
                  </div>

                  <p className="text-[10px] text-muted-foreground mt-2">
                    Updated{" "}
                    {new Date(resume.updatedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
