"use client";

import { format } from "date-fns";
import { Archive, Loader2, Pencil, Plus, Tag } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Coupon } from "./settings-content";

interface Props {
  coupons: Coupon[];
  loading: boolean;
  onMutate: (action: string, data: Record<string, any>) => Promise<any>;
  onRefresh: () => void;
}

const EMPTY_FORM = {
  code: "",
  type: "percentage" as "percentage" | "flat",
  value: "",
  maxDiscount: "",
  minOrderValue: "0",
  endTime: "",
  usageLimitGlobal: "",
  usageLimitPerUser: "1",
  newUserOnly: false,
  status: "active" as "active" | "expired" | "disabled",
};

const STATUS_VARIANT: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  active: "default",
  expired: "secondary",
  disabled: "outline",
};

export function CouponsTab({ coupons, loading, onMutate, onRefresh }: Props) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [editTarget, setEditTarget] = useState<Coupon | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [currentFilter, setCurrentFilter] = useState<string>("active");

  const filteredCoupons = coupons.filter((c) => {
    if (currentFilter === "all") return true;
    return c.status === currentFilter;
  });

  function openCreate() {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setOpen(true);
  }

  function openEdit(coupon: Coupon) {
    setEditTarget(coupon);
    setForm({
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      maxDiscount: coupon.maxDiscount ?? "",
      minOrderValue: coupon.minOrderValue,
      endTime: coupon.endTime
        ? new Date(coupon.endTime).toISOString().slice(0, 16)
        : "",
      usageLimitGlobal:
        coupon.usageLimitGlobal != null ? String(coupon.usageLimitGlobal) : "",
      usageLimitPerUser: String(coupon.usageLimitPerUser),
      newUserOnly: coupon.newUserOnly,
      status: coupon.status,
    });
    setOpen(true);
  }

  async function handleSave() {
    if (!form.code || !form.value) {
      toast.error("Code and value are required");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        code: form.code.toUpperCase(),
        usageLimitGlobal: form.usageLimitGlobal
          ? Number(form.usageLimitGlobal)
          : null,
        usageLimitPerUser: Number(form.usageLimitPerUser),
        maxDiscount: form.maxDiscount || null,
        endTime: form.endTime || null,
      };

      if (editTarget) {
        await onMutate("update_coupon", { id: editTarget.id, ...payload });
        toast.success("Coupon updated");
      } else {
        await onMutate("create_coupon", payload);
        toast.success("Coupon created");
      }
      setOpen(false);
      onRefresh();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string, code: string) {
    if (
      !confirm(`Archive coupon "${code}"? This will disable it for new users.`)
    )
      return;
    setDeleting(id);
    try {
      await onMutate("delete_coupon", { id });
      toast.success("Coupon archived");
      onRefresh();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setDeleting(null);
    }
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <Tabs
          value={currentFilter}
          onValueChange={setCurrentFilter}
          className="w-full sm:w-auto"
        >
          <TabsList className="grid w-full grid-cols-3 sm:w-[300px]">
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="disabled">Disabled</TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex items-center gap-4">
          <p className="text-sm text-muted-foreground hidden md:block">
            {filteredCoupons.length} coupon
            {filteredCoupons.length !== 1 ? "s" : ""}
          </p>
          <Button onClick={openCreate} size="sm">
            <Plus className="mr-2 h-4 w-4" /> New Coupon
          </Button>
        </div>
      </div>

      {loading ? (
        <Skeleton className="h-[300px] rounded-xl" />
      ) : filteredCoupons.length === 0 ? (
        <div className="flex h-48 items-center justify-center rounded-xl border border-dashed">
          <div className="text-center">
            <Tag className="mx-auto h-8 w-8 text-muted-foreground opacity-30 mb-2" />
            <p className="text-muted-foreground text-sm">
              {currentFilter === "active"
                ? "No active coupons."
                : "No coupons found."}
            </p>
          </div>
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Usage</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCoupons.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-mono font-medium">
                      {c.code}
                    </TableCell>
                    <TableCell className="capitalize">{c.type}</TableCell>
                    <TableCell>
                      {c.type === "percentage"
                        ? `${c.value}%`
                        : `₹${Number(c.value).toLocaleString("en-IN")}`}
                      {c.maxDiscount && (
                        <span className="text-xs text-muted-foreground ml-1">
                          (max ₹{c.maxDiscount})
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {c.endTime
                        ? format(new Date(c.endTime), "dd MMM yyyy")
                        : "—"}
                    </TableCell>
                    <TableCell>
                      {c.usageLimitGlobal != null
                        ? `${c.usageLimitGlobal} total`
                        : "∞"}
                      {" / "}
                      {c.usageLimitPerUser}/user
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={STATUS_VARIANT[c.status]}
                        className="capitalize"
                      >
                        {c.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openEdit(c)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDelete(c.id, c.code)}
                          disabled={deleting === c.id}
                        >
                          {deleting === c.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Archive className="h-3.5 w-3.5" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editTarget ? "Edit Coupon" : "Create Coupon"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Code</Label>
                <Input
                  value={form.code}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      code: e.target.value.toUpperCase(),
                    }))
                  }
                  placeholder="SAVE20"
                  disabled={!!editTarget}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, status: v as any }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="disabled">Disabled</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Type</Label>
                <Select
                  value={form.type}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, type: v as any }))
                  }
                  disabled={!!editTarget}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                    <SelectItem value="flat">Flat (₹)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>
                  Value {form.type === "percentage" ? "(%)" : "(₹)"}
                </Label>
                <Input
                  type="number"
                  value={form.value}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, value: e.target.value }))
                  }
                  placeholder={form.type === "percentage" ? "20" : "100"}
                  disabled={!!editTarget}
                />
              </div>
            </div>

            {form.type === "percentage" && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Max Discount (₹)</Label>
                  <Input
                    type="number"
                    value={form.maxDiscount}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, maxDiscount: e.target.value }))
                    }
                    placeholder="500 (optional)"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Min Order Value (₹)</Label>
                  <Input
                    type="number"
                    value={form.minOrderValue}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, minOrderValue: e.target.value }))
                    }
                    placeholder="0"
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Expires At</Label>
                <Input
                  type="datetime-local"
                  value={form.endTime}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, endTime: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label>Global Usage Limit</Label>
                <Input
                  type="number"
                  value={form.usageLimitGlobal}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, usageLimitGlobal: e.target.value }))
                  }
                  placeholder="∞ (blank = unlimited)"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Per-User Limit</Label>
                <Input
                  type="number"
                  value={form.usageLimitPerUser}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      usageLimitPerUser: e.target.value,
                    }))
                  }
                  min={1}
                />
              </div>
              <div className="flex items-center gap-3 pt-6">
                <Switch
                  checked={form.newUserOnly}
                  onCheckedChange={(v) =>
                    setForm((f) => ({ ...f, newUserOnly: v }))
                  }
                />
                <Label>New users only</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editTarget ? "Save Changes" : "Create Coupon"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
