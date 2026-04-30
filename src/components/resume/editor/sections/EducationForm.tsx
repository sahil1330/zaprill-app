"use client";

import { closestCenter, DndContext, type DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Plus, Trash2 } from "lucide-react";
import { nanoid } from "nanoid";
import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import SortableItem from "@/components/resume/editor/SortableItem";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resumeActions } from "@/store/resumeSlice";
import type { AppDispatch, RootState } from "@/store/store";
import type { ResumeEducationItem } from "@/types/resume";

export default function EducationForm() {
  const dispatch = useDispatch<AppDispatch>();
  const education = useSelector((s: RootState) => s.resume.data.education);

  const addItem = () => {
    const item: ResumeEducationItem = {
      id: nanoid(),
      institution: "",
      url: "",
      area: "",
      studyType: "",
      startDate: "",
      endDate: null,
      score: "",
      courses: [],
    };
    dispatch(resumeActions.addEducationItem(item));
  };

  const update = (id: string, field: string, value: string | null) => {
    dispatch(
      resumeActions.updateEducationItem({ id, data: { [field]: value } }),
    );
  };

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (over && active.id !== over.id) {
        const from = education.findIndex((e) => e.id === active.id);
        const to = education.findIndex((e) => e.id === over.id);
        if (from !== -1 && to !== -1) {
          dispatch(resumeActions.reorderEducationItems({ from, to }));
        }
      }
    },
    [education, dispatch],
  );

  return (
    <div className="space-y-5">
      {education.length === 0 && (
        <div className="text-center py-12 border-2 border-dashed border-border rounded-xl">
          <p className="text-muted-foreground font-medium mb-4">
            No education added yet
          </p>
          <Button variant="outline" onClick={addItem} className="gap-2">
            <Plus className="h-4 w-4" /> Add Education
          </Button>
        </div>
      )}

      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext
          items={education.map((e) => e.id)}
          strategy={verticalListSortingStrategy}
        >
          {education.map((item, idx) => (
            <SortableItem key={item.id} id={item.id}>
              <Card className="border-border">
                <CardContent className="p-5 pl-10 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground text-sm">
                      Education {idx + 1}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        dispatch(resumeActions.removeEducationItem(item.id))
                      }
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                        Institution *
                      </Label>
                      <Input
                        value={item.institution}
                        onChange={(e) =>
                          update(item.id, "institution", e.target.value)
                        }
                        placeholder="MIT"
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                        Degree
                      </Label>
                      <Input
                        value={item.studyType}
                        onChange={(e) =>
                          update(item.id, "studyType", e.target.value)
                        }
                        placeholder="B.S."
                        className="h-11"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                        Field
                      </Label>
                      <Input
                        value={item.area}
                        onChange={(e) =>
                          update(item.id, "area", e.target.value)
                        }
                        placeholder="Computer Science"
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                        Start
                      </Label>
                      <Input
                        value={item.startDate}
                        onChange={(e) =>
                          update(item.id, "startDate", e.target.value)
                        }
                        placeholder="2018"
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                        End
                      </Label>
                      <Input
                        value={item.endDate ?? ""}
                        onChange={(e) =>
                          update(item.id, "endDate", e.target.value || null)
                        }
                        placeholder="2022"
                        className="h-11"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </SortableItem>
          ))}
        </SortableContext>
      </DndContext>

      {education.length > 0 && (
        <Button
          variant="outline"
          onClick={addItem}
          className="w-full gap-2 border-dashed"
        >
          <Plus className="h-4 w-4" /> Add Another Education
        </Button>
      )}
    </div>
  );
}
