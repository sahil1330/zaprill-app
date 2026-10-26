"use client";

import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

export interface MockQuestion {
  id: string;
  prompt: string;
}

export function MockPanel({
  coachEnabled,
  busy,
  questions,
  answers,
  feedback,
  onAnswerChange,
  onStart,
  onSubmit,
}: {
  coachEnabled: boolean;
  busy: string | null;
  questions: MockQuestion[];
  answers: Record<string, string>;
  feedback: string | null;
  onAnswerChange: (questionId: string, value: string) => void;
  onStart: () => void;
  onSubmit: () => void;
}) {
  return (
    <div data-slot="mock-panel">
      <Card>
        <CardHeader>
          <CardTitle>Mock interview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-muted-foreground text-sm">
            A mock is practice only. It does not verify a skill.
          </p>
          <Button
            variant="outline"
            onClick={onStart}
            disabled={busy !== null || !coachEnabled}
          >
            {busy === "mock" && <Loader2 className="animate-spin" />}
            Start mock
          </Button>
          {questions.map((question) => (
            <div key={question.id} className="space-y-2 text-sm">
              <p>{question.prompt}</p>
              <Textarea
                aria-label={question.prompt}
                value={answers[question.id] ?? ""}
                onChange={(event) =>
                  onAnswerChange(question.id, event.target.value)
                }
              />
            </div>
          ))}
          {questions.length > 0 ? (
            <Button onClick={onSubmit} disabled={busy !== null}>
              {busy === "mock-review" && <Loader2 className="animate-spin" />}
              Submit mock
            </Button>
          ) : null}
          {feedback ? (
            <p className="whitespace-pre-wrap text-sm">{feedback}</p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
