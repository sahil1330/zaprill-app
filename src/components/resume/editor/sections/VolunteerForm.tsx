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
import type { ResumeVolunteerItem } from "@/types/resume";

export default function VolunteerForm() {
  const dispatch = useDispatch<AppDispatch>();
  const volunteer = useSelector((s: RootState) => s.resume.data.volunteer);

  const addItem = () => {
    const item: ResumeVolunteerItem = {
      id: nanoid(),
      organization: "",
      position: "",
      url: "",
      startDate: "",
      endDate: null,
      summary: "",
      highlights: [],
    };
    dispatch(resumeActions.addVolunteerItem(item));
  };

  const update = (id: string, field: string, value: string | null) => {
    dispatch(
      resumeActions.updateVolunteerItem({ id, data: { [field]: value } }),
    );
  };

  return (
    <div className="space-y-5">
      {volunteer.length === 0 && (
        <div className="text-center py-12 border-2 border-dashed border-border rounded-xl">
          <p className="text-muted-foreground font-medium mb-4">
            No volunteer experience added yet
          </p>
          <Button variant="outline" onClick={addItem} className="gap-2">
            <Plus className="h-4 w-4" /> Add Volunteer Experience
          </Button>
        </div>
      )}

      {volunteer.map((item, idx) => (
        <Card key={item.id} className="border-border">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-bold text-foreground text-sm">
                Volunteer {idx + 1}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  dispatch(resumeActions.removeVolunteerItem(item.id))
                }
                className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                  Organization *
                </Label>
                <Input
                  value={item.organization}
                  onChange={(e) =>
                    update(item.id, "organization", e.target.value)
                  }
                  placeholder="Red Cross"
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                  Position
                </Label>
                <Input
                  value={item.position}
                  onChange={(e) => update(item.id, "position", e.target.value)}
                  placeholder="Volunteer Coordinator"
                  className="h-11"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                  Start Date
                </Label>
                <Input
                  value={item.startDate}
                  onChange={(e) => update(item.id, "startDate", e.target.value)}
                  placeholder="2023-01"
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                  End Date
                </Label>
                <Input
                  value={item.endDate ?? ""}
                  onChange={(e) =>
                    update(item.id, "endDate", e.target.value || null)
                  }
                  placeholder="Present"
                  className="h-11"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                Website URL
              </Label>
              <Input
                value={item.url}
                onChange={(e) => update(item.id, "url", e.target.value)}
                placeholder="https://..."
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
                placeholder="Briefly describe your volunteer work..."
                className="min-h-[80px] resize-y"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>
      ))}

      {volunteer.length > 0 && (
        <Button
          variant="outline"
          onClick={addItem}
          className="w-full gap-2 border-dashed"
        >
          <Plus className="h-4 w-4" /> Add Another Volunteer Experience
        </Button>
      )}
    </div>
  );
}
