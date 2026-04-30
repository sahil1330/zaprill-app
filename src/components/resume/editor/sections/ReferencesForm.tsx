"use client";

import { Plus, Trash2 } from "lucide-react";
import { nanoid } from "nanoid";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { resumeActions } from "@/store/resumeSlice";
import type { AppDispatch, RootState } from "@/store/store";
import type { ResumeReferenceItem } from "@/types/resume";

export default function ReferencesForm() {
  const dispatch = useDispatch<AppDispatch>();
  const references = useSelector((s: RootState) => s.resume.data.references);

  const addItem = () => {
    const item: ResumeReferenceItem = {
      id: nanoid(),
      name: "",
      reference: "",
    };
    dispatch(resumeActions.addReferenceItem(item));
  };

  const update = (id: string, field: string, value: string) => {
    dispatch(
      resumeActions.updateReferenceItem({ id, data: { [field]: value } }),
    );
  };

  return (
    <div className="space-y-5">
      {references.length === 0 && (
        <div className="text-center py-12 border-2 border-dashed border-border rounded-xl">
          <p className="text-muted-foreground font-medium mb-4">
            No references added yet
          </p>
          <Button variant="outline" onClick={addItem} className="gap-2">
            <Plus className="h-4 w-4" /> Add Reference
          </Button>
        </div>
      )}

      {references.map((item, idx) => (
        <Card key={item.id} className="border-border">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-bold text-foreground text-sm">
                Reference {idx + 1}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  dispatch(resumeActions.removeReferenceItem(item.id))
                }
                className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-2">
              <Label className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                Name *
              </Label>
              <Input
                value={item.name}
                onChange={(e) => update(item.id, "name", e.target.value)}
                placeholder="Jane Smith, Engineering Manager"
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                Reference Text
              </Label>
              <Textarea
                value={item.reference}
                onChange={(e) => update(item.id, "reference", e.target.value)}
                placeholder="Reference description or 'Available upon request'"
                className="min-h-[80px] resize-y"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>
      ))}

      {references.length > 0 && (
        <Button
          variant="outline"
          onClick={addItem}
          className="w-full gap-2 border-dashed"
        >
          <Plus className="h-4 w-4" /> Add Another Reference
        </Button>
      )}
    </div>
  );
}
