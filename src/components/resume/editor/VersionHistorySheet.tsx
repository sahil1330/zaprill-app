"use client";

import { formatDistanceToNow } from "date-fns";
import { History, Loader2, RotateCcw } from "lucide-react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import ResumeDocument from "@/components/resume/templates/ResumeDocument";
import { getTemplateMeta } from "@/components/resume/templates/registry";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { normalizeResumeData, normalizeResumeMetadata } from "@/lib/resume";
import type { ResumeFlushResult } from "@/lib/resume/save-with-retry";
import { resumeActions } from "@/store/resumeSlice";
import type { AppDispatch, RootState } from "@/store/store";
import type { ResumeData, ResumeMetadata } from "@/types/resume";

type VersionRow = {
  id: string;
  version: number;
  data: unknown;
  metadata: unknown;
  templateSlug?: string | null;
  title?: string | null;
  industry?: string | null;
  changeDescription: string | null;
  createdAt: string;
};

function versionLabel(row: VersionRow): string {
  const description = row.changeDescription?.trim();
  if (description) return description;
  return `Snapshot ${row.version}`;
}

export default function VersionHistorySheet({
  resumeId,
  onFlushPendingSave,
}: {
  resumeId: string;
  onFlushPendingSave?: () => Promise<ResumeFlushResult>;
}) {
  const dispatch = useDispatch<AppDispatch>();
  const templateSlug = useSelector((s: RootState) => s.resume.templateSlug);
  const [open, setOpen] = useState(false);
  const [versions, setVersions] = useState<VersionRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [savingSnapshot, setSavingSnapshot] = useState(false);
  const [preview, setPreview] = useState<VersionRow | null>(null);
  const [pendingRestore, setPendingRestore] = useState<VersionRow | null>(null);
  const [restoring, setRestoring] = useState(false);

  async function loadVersions() {
    setLoading(true);
    try {
      const res = await fetch(`/api/resumes/${resumeId}/versions`);
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(body.error || "Failed to load versions");
      }
      setVersions(Array.isArray(body.versions) ? body.versions : []);
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error ? error.message : "Failed to load versions",
      );
    } finally {
      setLoading(false);
    }
  }

  async function saveSnapshot() {
    setSavingSnapshot(true);
    try {
      if (onFlushPendingSave) {
        const flushed = await onFlushPendingSave();
        if (!flushed.ok) {
          toast.error("Save the resume before taking a snapshot.");
          return;
        }
      }
      const res = await fetch(`/api/resumes/${resumeId}/versions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ changeDescription: "Manual snapshot" }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(body.error || "Failed to save snapshot");
      }
      toast.success("Snapshot saved");
      await loadVersions();
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error ? error.message : "Failed to save snapshot",
      );
    } finally {
      setSavingSnapshot(false);
    }
  }

  async function restore(row: VersionRow) {
    setRestoring(true);
    try {
      const res = await fetch(
        `/api/resumes/${resumeId}/versions/${row.id}/restore`,
        { method: "POST" },
      );
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(body.error || "Failed to restore snapshot");
      }

      const restored = body.resume;
      dispatch(
        resumeActions.loadResume({
          id: restored.id,
          data: normalizeResumeData(restored.data),
          metadata: normalizeResumeMetadata(restored.metadata),
          title: restored.title,
          templateSlug: restored.templateSlug ?? "minimalist",
          industry: restored.industry ?? "technology",
          targetRole: restored.targetRole,
          status: restored.status,
          version: restored.version,
        }),
      );
      toast.success("Snapshot restored");
      setPendingRestore(null);
      setPreview(null);
      setOpen(false);
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error ? error.message : "Failed to restore snapshot",
      );
    } finally {
      setRestoring(false);
    }
  }

  let previewData: {
    data: ResumeData;
    metadata: ResumeMetadata;
  } | null = null;
  let previewError: string | null = null;
  if (preview) {
    try {
      previewData = {
        data: normalizeResumeData(preview.data),
        metadata: normalizeResumeMetadata(preview.metadata),
      };
    } catch (error) {
      console.error(error);
      previewError = "This snapshot could not be rendered.";
    }
  }

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="gap-1.5"
        onClick={() => {
          setOpen(true);
          void loadVersions();
        }}
      >
        <History className="h-4 w-4" />
        <span className="hidden md:inline">History</span>
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="flex flex-col sm:max-w-md">
          <SheetHeader className="border-border border-b pb-4">
            <SheetTitle>Version history</SheetTitle>
            <SheetDescription>
              Snapshots of this resume. Preview one, or restore it into the
              editor.
            </SheetDescription>
          </SheetHeader>

          <div className="border-border border-b px-4 py-3">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              disabled={savingSnapshot}
              onClick={() => void saveSnapshot()}
            >
              {savingSnapshot ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : null}
              Save snapshot
            </Button>
          </div>

          <ScrollArea className="flex-1">
            <div className="space-y-2 p-4">
              {loading ? (
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading snapshots
                </div>
              ) : versions.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  No snapshots yet. Save one anytime, including before an edit.
                  Resume Architect also saves the resume before it changes it.
                  You can also save the current resume from here.
                </p>
              ) : (
                versions.map((row) => (
                  <div
                    key={row.id}
                    className="rounded-lg border border-border p-3"
                  >
                    <p className="font-medium text-sm">{versionLabel(row)}</p>
                    <p className="mt-1 text-muted-foreground text-xs">
                      Version {row.version}
                      {row.templateSlug
                        ? ` · ${getTemplateMeta(row.templateSlug)?.name ?? row.templateSlug}`
                        : ""}
                      {" · "}
                      {formatDistanceToNow(new Date(row.createdAt), {
                        addSuffix: true,
                      })}
                    </p>
                    <div className="mt-3 flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPreview(row)}
                      >
                        Preview
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5"
                        onClick={() => setPendingRestore(row)}
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        Restore
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>

      <Dialog
        open={preview !== null}
        onOpenChange={(next) => {
          if (!next) setPreview(null);
        }}
      >
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {preview ? versionLabel(preview) : "Snapshot"}
            </DialogTitle>
            <DialogDescription>
              Read-only preview. Restoring replaces the resume in the editor.
            </DialogDescription>
          </DialogHeader>
          {previewError ? (
            <p className="text-muted-foreground text-sm">{previewError}</p>
          ) : null}
          {previewData ? (
            <div className="max-h-[70vh] overflow-auto rounded-lg bg-muted/40 p-4">
              <ResumeDocument
                data={previewData.data}
                metadata={previewData.metadata}
                templateSlug={preview?.templateSlug || templateSlug}
              />
            </div>
          ) : null}
          {preview ? (
            <div className="flex justify-end">
              <Button onClick={() => setPendingRestore(preview)}>
                Restore this snapshot
              </Button>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={pendingRestore !== null}
        onOpenChange={(next) => {
          if (!next && !restoring) setPendingRestore(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restore this snapshot?</AlertDialogTitle>
            <AlertDialogDescription>
              The editor will switch to this version. Unsaved changes in the
              current draft are replaced. You can save a snapshot first if you
              want to keep them.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={restoring}>Cancel</AlertDialogCancel>
            <Button
              disabled={restoring || !pendingRestore}
              onClick={() => {
                if (pendingRestore) void restore(pendingRestore);
              }}
            >
              {restoring ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Restore snapshot
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
