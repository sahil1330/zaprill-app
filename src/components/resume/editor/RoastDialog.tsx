"use client";

import { Flame, Loader2, RefreshCw } from "lucide-react";
import { useState } from "react";
import { useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { RootState } from "@/store/store";

/**
 * RoastDialog — Sheet dialog that triggers an AI roast of the current resume.
 * Comedy-style critique with actionable advice baked in.
 */
export default function RoastDialog() {
  const resumeId = useSelector((s: RootState) => s.resume.resumeId);
  const resumeData = useSelector((s: RootState) => s.resume.data);
  const [isRoasting, setIsRoasting] = useState(false);
  const [roast, setRoast] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const handleRoast = async () => {
    if (!resumeId) return;
    setIsRoasting(true);
    try {
      const res = await fetch(`/api/resumes/${resumeId}/ai/roast`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: resumeData }),
      });
      if (res.ok) {
        const data = await res.json();
        setRoast(data.roast);
      }
    } catch {
      setRoast(
        "Couldn't roast your resume right now. Even the AI was speechless. 💀",
      );
    } finally {
      setIsRoasting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-orange-500 hover:text-orange-400 hover:bg-orange-500/10"
          />
        }
      >
        <Flame className="h-4 w-4" />
        <span className="hidden sm:inline">Roast</span>
      </SheetTrigger>
      <SheetContent className="sm:max-w-lg w-full p-0 flex flex-col">
        <SheetHeader className="p-6 pb-4 border-b border-border">
          <SheetTitle className="flex items-center gap-2 text-lg">
            <Flame className="h-5 w-5 text-orange-500" />
            Resume Roast 🔥
          </SheetTitle>
          <SheetDescription>
            Brutally honest (but funny) AI feedback on your resume
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 min-h-0 overflow-y-auto px-6 py-4">
          {!roast && !isRoasting && (
            <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
              <div className="text-5xl">🔥</div>
              <p className="text-muted-foreground text-sm max-w-xs">
                Ready to get roasted? Click below and the AI will give you
                brutally honest feedback — with a side of comedy.
              </p>
              <Button
                onClick={handleRoast}
                disabled={!resumeId}
                className="gap-2 bg-orange-500 hover:bg-orange-600 text-white"
              >
                <Flame className="h-4 w-4" />
                Roast My Resume
              </Button>
            </div>
          )}

          {isRoasting && (
            <div className="flex flex-col items-center justify-center py-16 space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
              <p className="text-muted-foreground text-sm animate-pulse">
                Preparing the burn... 🔥
              </p>
            </div>
          )}

          {roast && !isRoasting && (
            <div className="space-y-4 animate-in fade-in-0 slide-in-from-bottom-3 duration-500">
              {/* Render each line as a chat bubble */}
              <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl rounded-tl-sm p-4">
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  {roast.split("\n").map((line, i) => {
                    if (!line.trim()) return null;
                    return (
                      <p
                        key={`roast-line-${i}`}
                        className="mb-2 last:mb-0 text-sm leading-relaxed"
                      >
                        {line}
                      </p>
                    );
                  })}
                </div>
              </div>

              <Button
                variant="outline"
                onClick={handleRoast}
                className="w-full gap-2 border-orange-500/30 text-orange-500 hover:bg-orange-500/10"
              >
                <RefreshCw className="h-4 w-4" />
                Roast Again
              </Button>
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
