"use client";

import { Check, Link2, Loader2, Share2 } from "lucide-react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { resumeActions } from "@/store/resumeSlice";
import type { AppDispatch, RootState } from "@/store/store";

type ShareState = {
  slug: string;
  isPublic: boolean;
  version: number;
};

export default function ShareResumeSheet({ resumeId }: { resumeId: string }) {
  const dispatch = useDispatch<AppDispatch>();
  const version = useSelector((s: RootState) => s.resume.version);
  const title = useSelector((s: RootState) => s.resume.title);
  const [open, setOpen] = useState(false);
  const [share, setShare] = useState<ShareState | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  async function loadShare() {
    setLoading(true);
    try {
      const res = await fetch(`/api/resumes/${resumeId}`);
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || "Failed to load share settings");
      setShare({
        slug: body.resume.slug,
        isPublic: !!body.resume.isPublic,
        version: body.resume.version,
      });
      if (typeof body.resume.version === "number") {
        dispatch(resumeActions.setVersion(body.resume.version));
      }
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error ? error.message : "Failed to load share settings",
      );
    } finally {
      setLoading(false);
    }
  }

  async function updateShare(next: { isPublic: boolean; rotateSlug?: boolean }) {
    if (!share) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/resumes/${resumeId}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isPublic: next.isPublic,
          rotateSlug: next.rotateSlug ?? false,
          version: share.version,
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(body.error || "Failed to update share link");
      }
      const updated: ShareState = {
        slug: body.resume.slug,
        isPublic: !!body.resume.isPublic,
        version: body.resume.version,
      };
      setShare(updated);
      dispatch(resumeActions.setVersion(updated.version));
      toast.success(
        next.rotateSlug
          ? "New share link created"
          : updated.isPublic
            ? "Share link is on"
            : "Share link is off",
      );
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update share link",
      );
    } finally {
      setSaving(false);
    }
  }

  const publicUrl =
    share && typeof window !== "undefined"
      ? `${window.location.origin}/r/${share.slug}`
      : share
        ? `/r/${share.slug}`
        : "";

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="hidden gap-1.5 sm:inline-flex"
        onClick={() => {
          setOpen(true);
          void loadShare();
        }}
      >
        <Share2 className="h-4 w-4" />
        <span className="hidden md:inline">Share</span>
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="flex flex-col sm:max-w-md">
          <SheetHeader className="border-border border-b pb-4">
            <SheetTitle>Share resume</SheetTitle>
            <SheetDescription>
              A public link shows {title || "this resume"} read-only. Turn it
              off to make the link stop working.
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-5 p-4">
            {loading || !share ? (
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading share settings
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between gap-4 rounded-lg border border-border px-3 py-3">
                  <div>
                    <p className="font-medium text-sm">Public link</p>
                    <p className="text-muted-foreground text-xs">
                      Anyone with the link can view it. Version {version}.
                    </p>
                  </div>
                  <Switch
                    checked={share.isPublic}
                    disabled={saving}
                    onCheckedChange={(checked) => {
                      void updateShare({ isPublic: checked });
                    }}
                    aria-label="Public link"
                  />
                </div>

                <div className="space-y-2">
                  <p className="font-medium text-sm">Link</p>
                  <div className="flex gap-2">
                    <input
                      readOnly
                      value={publicUrl}
                      className="h-9 min-w-0 flex-1 rounded-lg border border-input bg-muted/40 px-3 text-sm"
                      aria-label="Public resume link"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="shrink-0 gap-1.5"
                      disabled={!share.isPublic}
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(publicUrl);
                          setCopied(true);
                          toast.success("Link copied");
                          window.setTimeout(() => setCopied(false), 2000);
                        } catch {
                          toast.error("Could not copy the link");
                        }
                      }}
                    >
                      {copied ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Link2 className="h-4 w-4" />
                      )}
                      Copy
                    </Button>
                  </div>
                  {!share.isPublic ? (
                    <p className="text-muted-foreground text-xs">
                      Turn the public link on before sharing it.
                    </p>
                  ) : null}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={saving}
                  onClick={() =>
                    void updateShare({
                      isPublic: share.isPublic,
                      rotateSlug: true,
                    })
                  }
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Generate a new link
                </Button>
                <p className="text-muted-foreground text-xs">
                  A new link replaces the old one. The previous address stops
                  opening this resume.
                </p>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
