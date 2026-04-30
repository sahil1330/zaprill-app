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
import type { ResumePublicationItem } from "@/types/resume";

export default function PublicationsForm() {
  const dispatch = useDispatch<AppDispatch>();
  const publications = useSelector(
    (s: RootState) => s.resume.data.publications,
  );

  const addItem = () => {
    const item: ResumePublicationItem = {
      id: nanoid(),
      name: "",
      publisher: "",
      releaseDate: "",
      url: "",
      summary: "",
    };
    dispatch(resumeActions.addPublicationItem(item));
  };

  const update = (id: string, field: string, value: string) => {
    dispatch(
      resumeActions.updatePublicationItem({ id, data: { [field]: value } }),
    );
  };

  return (
    <div className="space-y-5">
      {publications.length === 0 && (
        <div className="text-center py-12 border-2 border-dashed border-border rounded-xl">
          <p className="text-muted-foreground font-medium mb-4">
            No publications added yet
          </p>
          <Button variant="outline" onClick={addItem} className="gap-2">
            <Plus className="h-4 w-4" /> Add Publication
          </Button>
        </div>
      )}

      {publications.map((item, idx) => (
        <Card key={item.id} className="border-border">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-bold text-foreground text-sm">
                Publication {idx + 1}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  dispatch(resumeActions.removePublicationItem(item.id))
                }
                className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                  Title *
                </Label>
                <Input
                  value={item.name}
                  onChange={(e) => update(item.id, "name", e.target.value)}
                  placeholder="Research Paper Title"
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                  Publisher
                </Label>
                <Input
                  value={item.publisher}
                  onChange={(e) => update(item.id, "publisher", e.target.value)}
                  placeholder="IEEE, ACM, etc."
                  className="h-11"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                  Release Date
                </Label>
                <Input
                  value={item.releaseDate}
                  onChange={(e) =>
                    update(item.id, "releaseDate", e.target.value)
                  }
                  placeholder="2024-01"
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                  URL
                </Label>
                <Input
                  value={item.url}
                  onChange={(e) => update(item.id, "url", e.target.value)}
                  placeholder="https://doi.org/..."
                  className="h-11"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                Summary
              </Label>
              <Textarea
                value={item.summary}
                onChange={(e) => update(item.id, "summary", e.target.value)}
                placeholder="Brief description of the publication..."
                className="min-h-[80px] resize-y"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>
      ))}

      {publications.length > 0 && (
        <Button
          variant="outline"
          onClick={addItem}
          className="w-full gap-2 border-dashed"
        >
          <Plus className="h-4 w-4" /> Add Another Publication
        </Button>
      )}
    </div>
  );
}
