"use client";

import { closestCenter, DndContext, type DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Plus, Trash2, X } from "lucide-react";
import { nanoid } from "nanoid";
import { useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import SortableItem from "@/components/resume/editor/SortableItem";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resumeActions } from "@/store/resumeSlice";
import type { AppDispatch, RootState } from "@/store/store";
import type { ResumeSkillItem } from "@/types/resume";

export default function SkillsForm() {
  const dispatch = useDispatch<AppDispatch>();
  const skills = useSelector((s: RootState) => s.resume.data.skills || []);
  const [newKeywords, setNewKeywords] = useState<Record<string, string>>({});

  const addGroup = () => {
    const item: ResumeSkillItem = {
      id: nanoid(),
      name: "",
      level: "",
      keywords: [],
      category: "technical",
    };
    dispatch(resumeActions.addSkillItem(item));
  };

  const update = (id: string, field: string, value: unknown) => {
    dispatch(resumeActions.updateSkillItem({ id, data: { [field]: value } }));
  };

  const addKeyword = (groupId: string) => {
    const kw = (newKeywords[groupId] ?? "").trim();
    if (!kw) return;
    const group = skills.find((s) => s.id === groupId);
    if (group && !group.keywords.includes(kw)) {
      update(groupId, "keywords", [...group.keywords, kw]);
      setNewKeywords((prev) => ({ ...prev, [groupId]: "" }));
    }
  };

  const removeKeyword = (groupId: string, keyword: string) => {
    const group = skills.find((s) => s.id === groupId);
    if (group) {
      update(
        groupId,
        "keywords",
        group.keywords.filter((k) => k !== keyword),
      );
    }
  };

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (over && active.id !== over.id) {
        const from = skills.findIndex((s) => s.id === active.id);
        const to = skills.findIndex((s) => s.id === over.id);
        if (from !== -1 && to !== -1) {
          dispatch(resumeActions.reorderSkillItems({ from, to }));
        }
      }
    },
    [skills, dispatch],
  );

  return (
    <div className="space-y-5">
      {skills.length === 0 && (
        <div className="text-center py-12 border-2 border-dashed border-border rounded-xl">
          <p className="text-muted-foreground font-medium mb-4">
            No skill groups added yet
          </p>
          <Button variant="outline" onClick={addGroup} className="gap-2">
            <Plus className="h-4 w-4" /> Add Skill Group
          </Button>
        </div>
      )}

      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext
          items={skills.map((s) => s.id)}
          strategy={verticalListSortingStrategy}
        >
          {skills.map((group) => (
            <SortableItem key={group.id} id={group.id}>
              <Card className="border-border">
                <CardContent className="p-5 pl-10 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2 flex-1 mr-4">
                      <Label className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                        Group Name *
                      </Label>
                      <Input
                        value={group.name}
                        onChange={(e) =>
                          update(group.id, "name", e.target.value)
                        }
                        placeholder="Frontend Development"
                        className="h-11"
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        dispatch(resumeActions.removeSkillItem(group.id))
                      }
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive mt-6"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Keywords */}
                  <div className="space-y-2">
                    <Label className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                      Skills / Keywords
                    </Label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {group.keywords.map((kw) => (
                        <Badge
                          key={kw}
                          variant="secondary"
                          className="gap-1 pr-1 font-medium"
                        >
                          {kw}
                          <button
                            type="button"
                            onClick={() => removeKeyword(group.id, kw)}
                            className="ml-1 hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        value={newKeywords[group.id] ?? ""}
                        onChange={(e) =>
                          setNewKeywords((prev) => ({
                            ...prev,
                            [group.id]: e.target.value,
                          }))
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addKeyword(group.id);
                          }
                        }}
                        placeholder="Type a skill and press Enter"
                        className="h-9 text-sm"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addKeyword(group.id)}
                        className="h-9 px-3"
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </SortableItem>
          ))}
        </SortableContext>
      </DndContext>
      {skills.length > 0 && (
        <Button
          variant="outline"
          onClick={addGroup}
          className="w-full gap-2 border-dashed"
        >
          <Plus className="h-4 w-4" /> Add Another Skill Group
        </Button>
      )}
    </div>
  );
}
