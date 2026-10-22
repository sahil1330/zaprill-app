import { Loader2 } from "lucide-react";
import { useState } from "react";
import type { AnalysisStep } from "@/types";

const JOB_MEMES = [
  "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbnZqemZqemZqemZqemZqemZqemZqemZqemZqemZqemZqemZqemZqJmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/3o7TKSjPQC1Id89MME/giphy.gif",
  "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbnZqemZqemZqemZqemZqemZqemZqemZqemZqemZqemZqemZqemZqJmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/BmmfETghGOPrW/giphy.gif",
  "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbnZqemZqemZqemZqemZqemZqemZqemZqemZqemZqemZqemZqemZqJmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/12vVAGu9q7Y9S/giphy.gif",
  "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbnZqemZqemZqemZqemZqemZqemZqemZqemZqemZqemZqemZqemZqJmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/l41lTfuxVpB3P0p3O/giphy.gif",
];

const JOB_MESSAGES = [
  "Calculating how many desk plants you'll need...",
  "Persuading the recruiter that 'Netflix' is a technical skill...",
  "Searching for your boss's replacement...",
  "Bribing the match engine with digital coffee...",
  "Applying to 100 jobs while you wait (just kidding)...",
  "Negotiating with the algorithms for a higher match score...",
];

export function MemeLoader({ step }: { step: AnalysisStep }) {
  const [memeIdx] = useState(() =>
    Math.floor(Math.random() * JOB_MEMES.length),
  );
  const [msgIdx] = useState(() =>
    Math.floor(Math.random() * JOB_MESSAGES.length),
  );

  return (
    <div className="fade-in slide-in-from-bottom-8 mx-auto flex max-w-xl animate-in flex-col items-center py-2 text-center duration-1000">
      <div className="group relative mb-5 aspect-video w-full overflow-hidden rounded-2xl border-4 border-foreground/10 shadow-2xl">
        <img
          src={JOB_MEMES[memeIdx]}
          alt="Job Meme"
          className="h-full w-full object-cover grayscale-[0.2] transition-all duration-500 group-hover:grayscale-0"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />
        <div className="-translate-x-1/2 absolute bottom-6 left-1/2 flex items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-white" />
          <span className="font-black text-sm text-white uppercase tracking-widest">
            {step === "searching"
              ? "Scanning Universe..."
              : "Analyzing Data..."}
          </span>
        </div>
      </div>

      <h3 className="mb-2 font-black text-2xl text-foreground tracking-tight">
        {JOB_MESSAGES[msgIdx]}
      </h3>
      <p className="mx-auto max-w-md font-semibold text-lg text-muted-foreground leading-relaxed">
        Our AI is working hard behind the scenes to find your perfect job match.
        Sit tight, this won't take long!
      </p>

      <div className="mt-5 flex gap-4">
        <div
          className={`h-1.5 w-16 rounded-full ${step === "searching" ? "animate-pulse bg-foreground" : "bg-muted"}`}
        />
        <div
          className={`h-1.5 w-16 rounded-full ${step === "analyzing" ? "animate-pulse bg-foreground" : "bg-muted"}`}
        />
      </div>
    </div>
  );
}
