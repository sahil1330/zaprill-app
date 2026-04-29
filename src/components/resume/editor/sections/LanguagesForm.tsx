"use client";

import { Plus, Trash2 } from "lucide-react";
import { nanoid } from "nanoid";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { resumeActions } from "@/store/resumeSlice";
import type { AppDispatch, RootState } from "@/store/store";
import type { ResumeLanguageItem } from "@/types/resume";

const FLUENCY_LEVELS = [
  "Native",
  "Fluent",
  "Advanced",
  "Intermediate",
  "Beginner",
];

export default function LanguagesForm() {
  const dispatch = useDispatch<AppDispatch>();
  const languages = useSelector((s: RootState) => s.resume.data.languages);

  const addItem = () => {
    const item: ResumeLanguageItem = {
      id: nanoid(),
      language: "",
      fluency: "Fluent",
    };
    dispatch(resumeActions.addLanguageItem(item));
  };

  const update = (id: string, field: string, value: string) => {
    dispatch(
      resumeActions.updateLanguageItem({ id, data: { [field]: value } }),
    );
  };

  return (
    <div className="space-y-5">
      {languages.length === 0 && (
        <div className="text-center py-12 border-2 border-dashed border-border rounded-xl">
          <p className="text-muted-foreground font-medium mb-4">
            No languages added yet
          </p>
          <Button variant="outline" onClick={addItem} className="gap-2">
            <Plus className="h-4 w-4" /> Add Language
          </Button>
        </div>
      )}

      {languages.map((item, idx) => (
        <Card key={item.id} className="border-border">
          <CardContent className="p-4">
            <div className="flex items-end gap-4">
              <div className="flex-1 space-y-2">
                <Label className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                  Language {idx + 1}
                </Label>
                <Input
                  value={item.language}
                  onChange={(e) => update(item.id, "language", e.target.value)}
                  placeholder="English"
                  className="h-11"
                />
              </div>
              <div className="w-40 space-y-2">
                <Label className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                  Fluency
                </Label>
                <Select
                  value={item.fluency}
                  onValueChange={(v) => {
                    if (v) update(item.id, "fluency", v);
                  }}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    {FLUENCY_LEVELS.map((level) => (
                      <SelectItem key={level} value={level}>
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  dispatch(resumeActions.removeLanguageItem(item.id))
                }
                className="h-11 w-11 p-0 text-muted-foreground hover:text-destructive shrink-0"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      {languages.length > 0 && (
        <Button
          variant="outline"
          onClick={addItem}
          className="w-full gap-2 border-dashed"
        >
          <Plus className="h-4 w-4" /> Add Another Language
        </Button>
      )}
    </div>
  );
}
