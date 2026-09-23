"use client";

import {
  Bookmark,
  BookmarkCheck,
  Briefcase,
  Building2,
  Clock,
  ExternalLink,
  History,
  Loader2,
  MapPin,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app/page-header";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSession } from "@/lib/auth-client";

interface TrackedJob {
  id: string;
  jobId: string;
  title: string;
  company: string;
  location: string;
  url: string;
  matchPercentage: number;
  createdAt: string;
}

export default function MyJobsPage() {
  const { data: session, isPending } = useSession();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    saved: TrackedJob[];
    visited: TrackedJob[];
  }>({ saved: [], visited: [] });
  const [selectedJobs, setSelectedJobs] = useState<Set<string>>(new Set());

  const handleUnsave = async (jobId: string) => {
    const jobToRemove = data.saved.find(
      (j) => j.jobId === jobId || j.id === jobId,
    );
    if (!jobToRemove) return;

    // High-priority synchronous update for instant UI feedback
    const previousSaved = data.saved;
    setData((prev) => ({
      ...prev,
      saved: prev.saved.filter((j) => j.jobId !== jobId && j.id !== jobId),
    }));

    let undoClicked = false;
    toast("Job removed from bookmarks", {
      action: {
        label: "Undo",
        onClick: () => {
          undoClicked = true;
          setData((prev) => ({ ...prev, saved: previousSaved }));
          fetch("/api/save-job", {
            method: "POST",
            body: JSON.stringify(jobToRemove),
          }).catch(console.error);
        },
      },
    });

    try {
      const res = await fetch("/api/save-job", {
        method: "DELETE",
        body: JSON.stringify({ jobId }),
      });

      if (!res.ok && !undoClicked) {
        // Revert on failure
        setData((prev) => ({
          ...prev,
          saved: previousSaved,
        }));
      }
    } catch (error) {
      if (!undoClicked) {
        console.error("Failed to unsave:", error);
        setData((prev) => ({
          ...prev,
          saved: previousSaved,
        }));
      }
    }
  };

  const handleBulkUnsave = async () => {
    if (selectedJobs.size === 0) return;

    const jobsToRemove = data.saved.filter((j) =>
      selectedJobs.has(j.jobId || j.id),
    );
    const previousSaved = data.saved;

    // Optimistic UI removal
    setData((prev) => ({
      ...prev,
      saved: prev.saved.filter((j) => !selectedJobs.has(j.jobId || j.id)),
    }));

    const idsToDelete = Array.from(selectedJobs);
    setSelectedJobs(new Set());

    let undoClicked = false;
    toast(`${idsToDelete.length} job(s) removed`, {
      action: {
        label: "Undo",
        onClick: () => {
          undoClicked = true;
          setData((prev) => ({ ...prev, saved: previousSaved }));
          Promise.all(
            jobsToRemove.map((job) =>
              fetch("/api/save-job", {
                method: "POST",
                body: JSON.stringify(job),
              }),
            ),
          ).catch(console.error);
        },
      },
    });

    try {
      await Promise.all(
        idsToDelete.map((jobId) =>
          fetch("/api/save-job", {
            method: "DELETE",
            body: JSON.stringify({ jobId }),
          }),
        ),
      );
    } catch (error) {
      if (!undoClicked) {
        console.error("Failed to bulk unsave:", error);
        setData((prev) => ({
          ...prev,
          saved: previousSaved,
        }));
      }
    }
  };

  useEffect(() => {
    if (!session) return;

    const fetchJobs = async () => {
      try {
        const res = await fetch("/api/user-jobs");
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error("Failed to fetch jobs:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [session]);

  if (isPending || (session && loading)) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session) {
    return null; // Handle via middleware/router
  }

  return (
    <>
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <PageHeader
          title="My Jobs"
          description="Track your application history and bookmarked opportunities."
        />

        <Tabs defaultValue="visited" className="space-y-8">
          <TabsList className="h-14 rounded-2xl border border-border/50 bg-muted p-1 shadow-sm">
            <TabsTrigger
              value="visited"
              className="rounded-xl px-8 font-black text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <History className="mr-2 h-4 w-4" />
              Visited ({data.visited.length})
            </TabsTrigger>
            <TabsTrigger
              value="saved"
              className="rounded-xl px-8 font-black text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Bookmark className="mr-2 h-4 w-4" />
              Bookmarked ({data.saved.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="visited"
            className="fade-in slide-in-from-bottom-4 animate-in duration-500"
          >
            {data.visited.length === 0 ? (
              <EmptyState
                title="No applications yet"
                description="Jobs you apply for will show up here automatically."
              />
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {data.visited.map((job) => (
                  <JobListItem key={job.id} job={job} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent
            value="saved"
            className="fade-in slide-in-from-bottom-4 animate-in duration-500"
          >
            {data.saved.length === 0 ? (
              <EmptyState
                title="No bookmarks"
                description="Save jobs during analysis to track them here."
              />
            ) : (
              <div className="grid grid-cols-1 gap-4 pb-20">
                {data.saved.map((job) => (
                  <JobListItem
                    key={job.id}
                    job={job}
                    isSaved
                    selected={selectedJobs.has(job.jobId || job.id)}
                    onSelect={(checked) => {
                      const id = job.jobId || job.id;
                      setSelectedJobs((prev) => {
                        const next = new Set(prev);
                        if (checked) next.add(id);
                        else next.delete(id);
                        return next;
                      });
                    }}
                    onUnsave={() => handleUnsave(job.jobId || job.id)}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Floating Bulk Action Bar */}
      {selectedJobs.size > 0 && (
        <div className="-translate-x-1/2 slide-in-from-bottom-10 fade-in fixed bottom-6 left-1/2 z-50 animate-in duration-300">
          <div className="flex items-center gap-6 rounded-full border border-border/20 bg-foreground px-6 py-3 text-background shadow-2xl">
            <span className="whitespace-nowrap font-bold text-sm">
              {selectedJobs.size} selected
            </span>
            <div className="h-4 w-px bg-background/20" />
            <button
              onClick={handleBulkUnsave}
              className="whitespace-nowrap font-black text-destructive-foreground text-sm transition-colors hover:text-red-400"
            >
              Remove Selected
            </button>
            <button
              onClick={() => setSelectedJobs(new Set())}
              className="whitespace-nowrap font-medium text-background/60 text-sm transition-colors hover:text-background"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function JobListItem({
  job,
  isSaved,
  selected,
  onSelect,
  onUnsave,
}: {
  job: TrackedJob;
  isSaved?: boolean;
  selected?: boolean;
  onSelect?: (checked: boolean) => void;
  onUnsave?: () => void;
}) {
  return (
    <Card className="group overflow-hidden border-none bg-card shadow-sm transition-all hover:shadow-md">
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div className="flex min-w-0 flex-1 items-start gap-4">
            {isSaved && onSelect && (
              <div className="shrink-0 pt-1.5">
                <Checkbox
                  checked={selected}
                  onCheckedChange={onSelect}
                  className="h-5 w-5 rounded-md border-border/60 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="mb-2 flex items-center gap-3">
                <h3 className="truncate font-black text-foreground text-lg transition-colors group-hover:text-primary">
                  {job.title}
                </h3>
                <Badge
                  variant="secondary"
                  className="border-none bg-primary/5 px-2 font-black text-[10px] text-primary uppercase"
                >
                  {job.matchPercentage}% Match
                </Badge>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 font-semibold text-muted-foreground text-sm">
                <div className="flex items-center gap-1.5 text-foreground/80">
                  <Building2 className="h-3.5 w-3.5" />
                  <span>{job.company}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" />
                  <span>{job.location}</span>
                </div>
                <div className="flex items-center gap-1.5 opacity-70">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{new Date(job.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex w-full items-center gap-3 sm:w-auto">
            {isSaved && (
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.preventDefault();
                  if (onUnsave) onUnsave();
                }}
                className="h-9 w-9 rounded-xl border-border/60 p-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                title="Remove bookmark"
              >
                <BookmarkCheck className="h-4 w-4 fill-current" />
              </Button>
            )}

            <a
              href={job.url}
              target="_blank"
              rel="noopener noreferrer"
              className={
                buttonVariants({ variant: "default", size: "sm" }) +
                "flex-1 rounded-xl px-6 font-black sm:flex-none"
              }
            >
              View Listing
              <ExternalLink className="ml-2 h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-3xl border-2 border-border/60 border-dashed bg-card/50 py-24 text-center">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
        <Briefcase className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="mb-1 font-black text-xl">{title}</h3>
      <p className="font-medium text-muted-foreground">{description}</p>
    </div>
  );
}
