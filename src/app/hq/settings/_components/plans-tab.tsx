"use client";

import { IndianRupee, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import type { Plan } from "./settings-content";

interface Props {
  plans: Plan[];
  loading: boolean;
  onMutate: (action: string, data: Record<string, any>) => Promise<any>;
  onRefresh: () => void;
}

const EMPTY_FORM = {
  name: "",
  slug: "",
  description: "",
  amount: "",
  originalAmount: "",
  billingCycle: "monthly" as "monthly" | "quarterly" | "yearly",
  category: "pro" as string,
  features: [] as { text: string; info: string }[],
  isActive: true,
  sortOrder: 0,
};

export function PlansTab({ plans, loading, onMutate, onRefresh }: Props) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [editTarget, setEditTarget] = useState<Plan | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  function openCreate() {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setOpen(true);
  }

  function openEdit(plan: Plan) {
    setEditTarget(plan);
    setForm({
      name: plan.name,
      slug: plan.slug,
      description: plan.description ?? "",
      amount: plan.amount,
      originalAmount: plan.originalAmount ?? "",
      billingCycle: plan.billingCycle,
      category: plan.category || "pro",
      features: Array.isArray(plan.features)
        ? plan.features.map((f: any) =>
            typeof f === "string" ? { text: f, info: "" } : f,
          )
        : [],
      isActive: plan.isActive,
      sortOrder: plan.sortOrder,
    });
    setOpen(true);
  }

  async function handleSave() {
    if (!form.name || !form.slug || !form.amount) {
      toast.error("Name, slug and amount are required");
      return;
    }
    setSaving(true);
    try {
      const features = form.features
        .filter((f) => f.text.trim())
        .map((f) => ({
          text: f.text.trim(),
          info: f.info.trim() || null,
        }));

      if (editTarget) {
        await onMutate("update_plan", { id: editTarget.id, ...form, features });
        toast.success("Plan updated");
      } else {
        await onMutate("create_plan", { ...form, features });
        toast.success("Plan created");
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
    if (
      !confirm(`Delete plan "${name}"? This may affect active subscriptions.`)
    )
      return;
    setDeleting(id);
    try {
      await onMutate("delete_plan", { id });
      toast.success("Plan deleted");
      onRefresh();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setDeleting(null);
    }
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm text-muted-foreground">
            {plans.length} plan{plans.length !== 1 ? "s" : ""} configured
          </p>
        </div>
        <Button onClick={openCreate} size="sm">
          <Plus className="mr-2 h-4 w-4" /> New Plan
        </Button>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-[200px] rounded-xl" />
          ))}
        </div>
      ) : plans.length === 0 ? (
        <div className="flex h-48 items-center justify-center rounded-xl border border-dashed">
          <p className="text-muted-foreground text-sm">
            No plans yet. Create one above.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <Card key={plan.id} className={!plan.isActive ? "opacity-60" : ""}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-base">{plan.name}</CardTitle>
                    <CardDescription className="text-xs mt-0.5">
                      {plan.slug}
                    </CardDescription>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Badge variant="outline" className="capitalize text-xs">
                      {plan.category}
                    </Badge>
                    <Badge variant="outline" className="capitalize text-xs">
                      {plan.billingCycle}
                    </Badge>
                    {!plan.isActive && (
                      <Badge variant="secondary" className="text-xs">
                        Inactive
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col mb-3">
                  <div className="flex items-baseline gap-1">
                    <IndianRupee className="h-4 w-4 text-muted-foreground" />
                    <span className="text-2xl font-bold">
                      {Number(plan.amount).toLocaleString("en-IN")}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      / {plan.billingCycle}
                    </span>
                  </div>
                  {plan.originalAmount &&
                    Number(plan.originalAmount) > Number(plan.amount) && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground line-through ml-5">
                        <IndianRupee className="h-3 w-3" />
                        {Number(plan.originalAmount).toLocaleString("en-IN")}
                      </div>
                    )}
                </div>
                {Array.isArray(plan.features) && plan.features.length > 0 && (
                  <ul className="text-xs text-muted-foreground space-y-1 mb-4">
                    {plan.features.slice(0, 3).map((f: any, i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <span className="h-1 w-1 rounded-full bg-primary shrink-0" />
                        <span className="truncate">
                          {typeof f === "string" ? f : f.text}
                        </span>
                      </li>
                    ))}
                    {plan.features.length > 3 && (
                      <li className="text-xs text-muted-foreground">
                        +{plan.features.length - 3} more
                      </li>
                    )}
                  </ul>
                )}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => openEdit(plan)}
                  >
                    <Pencil className="mr-1.5 h-3 w-3" /> Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDelete(plan.id, plan.name)}
                    disabled={deleting === plan.id}
                  >
                    {deleting === plan.id ? (
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
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editTarget ? "Edit Plan" : "Create Plan"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Name</Label>
                <Input
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  placeholder="Pro Monthly"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Slug</Label>
                <Input
                  value={form.slug}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      slug: e.target.value.toLowerCase().replace(/\s+/g, "-"),
                    }))
                  }
                  placeholder="pro-monthly"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Selling Price (INR)</Label>
                <Input
                  type="number"
                  value={form.amount}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, amount: e.target.value }))
                  }
                  placeholder="49"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Original Price (INR)</Label>
                <Input
                  type="number"
                  value={form.originalAmount}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, originalAmount: e.target.value }))
                  }
                  placeholder="99"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Billing Cycle</Label>
                <Select
                  value={form.billingCycle}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, billingCycle: v as any }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Category</Label>
                <Select
                  value={form.category}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, category: v as any }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="pro">Pro</SelectItem>
                    <SelectItem value="max">Max</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Sort Order</Label>
                <Input
                  type="number"
                  value={form.sortOrder}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      sortOrder: Number(e.target.value),
                    }))
                  }
                />
              </div>
              <div className="flex items-center gap-3 pt-6">
                <Switch
                  checked={form.isActive}
                  onCheckedChange={(v) =>
                    setForm((f) => ({ ...f, isActive: v }))
                  }
                />
                <Label>Active</Label>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Input
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                placeholder="Optional description"
              />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Features</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 text-[10px]"
                  onClick={() =>
                    setForm((f) => ({
                      ...f,
                      features: [...f.features, { text: "", info: "" }],
                    }))
                  }
                >
                  <Plus className="mr-1 h-3 w-3" /> Add Feature
                </Button>
              </div>
              <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                {form.features.map((feat, index) => (
                  <div key={index} className="flex gap-2 items-start group">
                    <div className="grid flex-1 gap-1.5">
                      <Input
                        placeholder="Feature name"
                        value={feat.text}
                        className="h-8 text-xs"
                        onChange={(e) => {
                          const newFeats = [...form.features];
                          newFeats[index].text = e.target.value;
                          setForm((f) => ({ ...f, features: newFeats }));
                        }}
                      />
                      <Input
                        placeholder="Info (optional)"
                        value={feat.info}
                        className="h-8 text-[10px] opacity-70 focus:opacity-100"
                        onChange={(e) => {
                          const newFeats = [...form.features];
                          newFeats[index].info = e.target.value;
                          setForm((f) => ({ ...f, features: newFeats }));
                        }}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => {
                        const newFeats = [...form.features];
                        newFeats.splice(index, 1);
                        setForm((f) => ({ ...f, features: newFeats }));
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
                {form.features.length === 0 && (
                  <p className="text-[10px] text-muted-foreground text-center py-4 border border-dashed rounded-lg">
                    No features added.
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <Switch
                checked={form.isActive}
                onCheckedChange={(v) => setForm((f) => ({ ...f, isActive: v }))}
              />
              <Label>Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editTarget ? "Save Changes" : "Create Plan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
