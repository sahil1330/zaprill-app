"use client";

import {
  ExternalLink,
  Link as LinkIcon,
  Loader2,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import type { LearningResource } from "../../_types";

interface Props {
  resources: LearningResource[];
  loading: boolean;
  onMutate: (action: string, data: Record<string, any>) => Promise<any>;
  onRefresh: () => void;
}

const EMPTY_FORM = {
  skill: "",
  type: "documentation" as any,
  name: "",
  url: "",
  isAffiliate: false,
  isFree: true,
  estimatedTime: "",
  isActive: true,
};

export function ResourcesContent({
  resources,
  loading,
  onMutate,
  onRefresh,
}: Props) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [editTarget, setEditTarget] = useState<LearningResource | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  function openCreate() {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setOpen(true);
  }

  function openEdit(resource: LearningResource) {
    setEditTarget(resource);
    setForm({
      skill: resource.skill,
      type: resource.type as any,
      name: resource.name,
      url: resource.url,
      isAffiliate: resource.isAffiliate,
      isFree: resource.isFree,
      estimatedTime: resource.estimatedTime ?? "",
      isActive: resource.isActive,
    });
    setOpen(true);
  }

  async function handleSave() {
    if (!form.skill || !form.name || !form.url) {
      toast.error("Skill, name, and URL are required");
      return;
    }
    setSaving(true);
    try {
      if (editTarget) {
        await onMutate("update_resource", { id: editTarget.id, ...form });
        toast.success("Resource updated");
      } else {
        await onMutate("create_resource", { ...form });
        toast.success("Resource created");
      }
      setOpen(false);
      onRefresh();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete resource "${name}"?`)) return;
    setDeleting(id);
    try {
      await onMutate("delete_resource", { id });
      toast.success("Resource deleted");
      onRefresh();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setDeleting(null);
    }
  }

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-muted-foreground text-sm">
            {resources.length} resource{resources.length !== 1 ? "s" : ""}{" "}
            configured
          </p>
        </div>
        <Button onClick={openCreate} size="sm">
          <Plus className="mr-2 h-4 w-4" /> New Resource
        </Button>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {["s1", "s2", "s3"].map((slot) => (
            <Skeleton key={slot} className="h-[200px] rounded-xl" />
          ))}
        </div>
      ) : resources.length === 0 ? (
        <div className="flex h-48 items-center justify-center rounded-xl border border-dashed">
          <p className="text-muted-foreground text-sm">
            No resources yet. Create one above to override AI hallucinated
            links.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {resources.map((resource) => (
            <Card
              key={resource.id}
              className={!resource.isActive ? "opacity-60" : ""}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="overflow-hidden">
                    <CardTitle
                      className="truncate text-base"
                      title={resource.name}
                    >
                      {resource.name}
                    </CardTitle>
                    <CardDescription className="mt-0.5 font-mono text-xs">
                      {resource.skill}
                    </CardDescription>
                  </div>
                  <div className="flex shrink-0 flex-wrap justify-end gap-1">
                    <Badge variant="outline" className="text-xs capitalize">
                      {resource.type}
                    </Badge>
                    {resource.isAffiliate && (
                      <Badge
                        variant="secondary"
                        className="border-indigo-500/20 bg-indigo-500/10 text-indigo-500 text-xs"
                      >
                        Affiliate
                      </Badge>
                    )}
                    {resource.isFree ? (
                      <Badge
                        variant="outline"
                        className="border-emerald-500/30 text-emerald-500 text-xs"
                      >
                        Free
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="border-amber-500/30 text-amber-500 text-xs"
                      >
                        Paid
                      </Badge>
                    )}
                    {!resource.isActive && (
                      <Badge variant="secondary" className="text-xs">
                        Inactive
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4 flex flex-col space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground text-xs">
                    <LinkIcon className="h-3 w-3 shrink-0" />
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="truncate transition-colors hover:text-foreground hover:underline"
                      title={resource.url}
                    >
                      {resource.url}
                    </a>
                    <ExternalLink className="h-3 w-3 shrink-0 opacity-50" />
                  </div>
                  <div className="flex items-center justify-between rounded-md bg-muted/30 p-2 text-muted-foreground text-xs">
                    <span>Clicks Tracked:</span>
                    <span className="font-medium text-foreground">
                      {resource.clickCount}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => openEdit(resource)}
                  >
                    <Pencil className="mr-1.5 h-3 w-3" /> Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="shrink-0 text-destructive hover:text-destructive"
                    onClick={() => handleDelete(resource.id, resource.name)}
                    disabled={deleting === resource.id}
                  >
                    {deleting === resource.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editTarget ? "Edit Resource" : "Add Predefined Resource"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="space-y-1.5">
              <Label>Skill Key</Label>
              <Input
                value={form.skill}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    skill: e.target.value.toLowerCase().trim(),
                  }))
                }
                placeholder="e.g. react, nodejs, python"
              />
              <p className="text-[10px] text-muted-foreground">
                This MUST match the exact skill name the AI generates.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Resource Type</Label>
                <Select
                  value={form.type}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, type: v as any }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="course">Course</SelectItem>
                    <SelectItem value="book">Book</SelectItem>
                    <SelectItem value="tutorial">Tutorial</SelectItem>
                    <SelectItem value="documentation">Documentation</SelectItem>
                    <SelectItem value="practice">Practice</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Estimated Time</Label>
                <Input
                  value={form.estimatedTime}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, estimatedTime: e.target.value }))
                  }
                  placeholder="e.g. 2-3 hours"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Resource Name</Label>
              <Input
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder="React Official Documentation"
              />
            </div>

            <div className="space-y-1.5">
              <Label>URL</Label>
              <Input
                value={form.url}
                onChange={(e) =>
                  setForm((f) => ({ ...f, url: e.target.value }))
                }
                placeholder="https://..."
              />
              <p className="text-[10px] text-muted-foreground">
                If using GA4, append UTMs here:
                ?utm_source=zaprill&utm_medium=affiliate
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="flex items-center gap-3">
                <Switch
                  checked={form.isAffiliate}
                  onCheckedChange={(v) =>
                    setForm((f) => ({ ...f, isAffiliate: v }))
                  }
                />
                <Label
                  className="cursor-pointer"
                  onClick={() =>
                    setForm((f) => ({ ...f, isAffiliate: !f.isAffiliate }))
                  }
                >
                  Is Affiliate
                </Label>
              </div>
              <div className="flex items-center gap-3">
                <Switch
                  checked={form.isFree}
                  onCheckedChange={(v) => setForm((f) => ({ ...f, isFree: v }))}
                />
                <Label
                  className="cursor-pointer"
                  onClick={() => setForm((f) => ({ ...f, isFree: !f.isFree }))}
                >
                  Is Free
                </Label>
              </div>
              <div className="col-span-2 mt-2 flex items-center gap-3">
                <Switch
                  checked={form.isActive}
                  onCheckedChange={(v) =>
                    setForm((f) => ({ ...f, isActive: v }))
                  }
                />
                <Label
                  className="cursor-pointer"
                  onClick={() =>
                    setForm((f) => ({ ...f, isActive: !f.isActive }))
                  }
                >
                  Active
                </Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editTarget ? "Save Changes" : "Create Resource"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
