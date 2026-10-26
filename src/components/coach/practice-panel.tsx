"use client";

import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

export function PracticePanel({
  coachEnabled,
  busy,
  task,
  answer,
  grade,
  onAnswerChange,
  onStart,
  onSubmit,
}: {
  coachEnabled: boolean;
  busy: string | null;
  task: { taskId: string; prompt: string } | null;
  answer: string;
  grade: string | null;
  onAnswerChange: (value: string) => void;
  onStart: () => void;
  onSubmit: () => void;
}) {
  const blocked = busy !== null || !coachEnabled;

  return (
    <div data-slot="practice-panel">
      <Card>
        <CardHeader>
          <CardTitle>Practice test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button variant="outline" onClick={onStart} disabled={blocked}>
            {busy === "test" && <Loader2 className="animate-spin" />}
            Start test
          </Button>
          {task ? (
            <>
              <p className="text-sm">{task.prompt}</p>
              <Textarea
                value={answer}
                onChange={(event) => onAnswerChange(event.target.value)}
                placeholder="Write the answer in the language you want feedback in."
              />
              <Button onClick={onSubmit} disabled={busy !== null}>
                {busy === "grade" && <Loader2 className="animate-spin" />}
                Submit answer
              </Button>
            </>
          ) : null}
          {grade ? (
            <p className="whitespace-pre-wrap text-sm">{grade}</p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
