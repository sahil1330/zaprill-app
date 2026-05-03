"use client";

import { GripVertical, Plus, Trash2 } from "lucide-react";
import { nanoid } from "nanoid";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resumeActions } from "@/store/resumeSlice";
import type { AppDispatch, RootState } from "@/store/store";
import type { ResumeCertificationItem } from "@/types/resume";

export default function CertificationsForm() {
  const dispatch = useDispatch<AppDispatch>();
  const certifications = useSelector(
    (s: RootState) => s.resume.data.certifications || [],
  );

  const addItem = () => {
    const item: ResumeCertificationItem = {
      id: nanoid(),
      name: "",
      issuer: "",
      date: "",
      url: "",
    };
    dispatch(resumeActions.addCertificationItem(item));
  };

  const update = (id: string, field: string, value: string) => {
    dispatch(
      resumeActions.updateCertificationItem({ id, data: { [field]: value } }),
    );
  };

  return (
    <div className="space-y-5">
      {certifications.length === 0 && (
        <div className="text-center py-12 border-2 border-dashed border-border rounded-xl">
          <p className="text-muted-foreground font-medium mb-4">
            No certifications added yet
          </p>
          <Button variant="outline" onClick={addItem} className="gap-2">
            <Plus className="h-4 w-4" /> Add Certification
          </Button>
        </div>
      )}

      {certifications.map((item, idx) => (
        <Card key={item.id} className="border-border">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-muted-foreground">
                <GripVertical className="h-4 w-4 cursor-grab" />
                <span className="font-bold text-foreground text-sm">
                  Certification {idx + 1}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  dispatch(resumeActions.removeCertificationItem(item.id))
                }
                className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                  Certification Name *
                </Label>
                <Input
                  value={item.name}
                  onChange={(e) => update(item.id, "name", e.target.value)}
                  placeholder="AWS Solutions Architect"
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                  Issuing Organization
                </Label>
                <Input
                  value={item.issuer}
                  onChange={(e) => update(item.id, "issuer", e.target.value)}
                  placeholder="Amazon Web Services"
                  className="h-11"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                  Date Earned
                </Label>
                <Input
                  value={item.date}
                  onChange={(e) => update(item.id, "date", e.target.value)}
                  placeholder="2024-03"
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                  Credential URL
                </Label>
                <Input
                  value={item.url}
                  onChange={(e) => update(item.id, "url", e.target.value)}
                  placeholder="https://verify.aws/..."
                  className="h-11"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {certifications.length > 0 && (
        <Button
          variant="outline"
          onClick={addItem}
          className="w-full gap-2 border-dashed"
        >
          <Plus className="h-4 w-4" /> Add Another Certification
        </Button>
      )}
    </div>
  );
}
