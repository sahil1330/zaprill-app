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
import type { ResumeAwardItem } from "@/types/resume";

export default function AwardsForm() {
  const dispatch = useDispatch<AppDispatch>();
  const awards = useSelector((s: RootState) => s.resume.data.awards);

  const addItem = () => {
    const item: ResumeAwardItem = {
      id: nanoid(),
      title: "",
      date: "",
      awarder: "",
      summary: "",
    };
    dispatch(resumeActions.addAwardItem(item));
  };

  const update = (id: string, field: string, value: string) => {
    dispatch(resumeActions.updateAwardItem({ id, data: { [field]: value } }));
  };

  return (
    <div className="space-y-5">
      {awards.length === 0 && (
        <div className="text-center py-12 border-2 border-dashed border-border rounded-xl">
          <p className="text-muted-foreground font-medium mb-4">
            No awards added yet
          </p>
          <Button variant="outline" onClick={addItem} className="gap-2">
            <Plus className="h-4 w-4" /> Add Award
          </Button>
        </div>
      )}

      {awards.map((item, idx) => (
        <Card key={item.id} className="border-border">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-bold text-foreground text-sm">
                Award {idx + 1}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => dispatch(resumeActions.removeAwardItem(item.id))}
                className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                  Award Title *
                </Label>
                <Input
                  value={item.title}
                  onChange={(e) => update(item.id, "title", e.target.value)}
                  placeholder="Employee of the Year"
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                  Awarded By
                </Label>
                <Input
                  value={item.awarder}
                  onChange={(e) => update(item.id, "awarder", e.target.value)}
                  placeholder="Company Name"
                  className="h-11"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                Date
              </Label>
              <Input
                value={item.date}
                onChange={(e) => update(item.id, "date", e.target.value)}
                placeholder="2024-06"
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                Summary
              </Label>
              <Textarea
                value={item.summary}
                onChange={(e) => update(item.id, "summary", e.target.value)}
                placeholder="Briefly describe the award..."
                className="min-h-[80px] resize-y"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>
      ))}

      {awards.length > 0 && (
        <Button
          variant="outline"
          onClick={addItem}
          className="w-full gap-2 border-dashed"
        >
          <Plus className="h-4 w-4" /> Add Another Award
        </Button>
      )}
    </div>
  );
}
