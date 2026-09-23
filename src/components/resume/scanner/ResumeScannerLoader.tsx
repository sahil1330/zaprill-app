"use client";

import { Zap } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";

const SCAN_PHASES = [
  {
    label: "Extract",
    messages: [
      "Extracting text from your document...",
      "Identifying sections and structure...",
      "Detecting contact information...",
      "Reading your professional DNA...",
    ],
  },
  {
    label: "Parse",
    messages: [
      "Mapping your work experience...",
      "Cataloging technical skills...",
      "Parsing education history...",
      "Identifying certifications...",
    ],
  },
  {
    label: "Analyze",
    messages: [
      "Running ATS compatibility check...",
      "Analyzing keyword density...",
      "Scoring action verb impact...",
      "Evaluating formatting quality...",
    ],
  },
  {
    label: "Score",
    messages: [
      "Computing ATS score...",
      "Generating optimization suggestions...",
      "Building your improvement roadmap...",
      "Finalizing analysis report...",
    ],
  },
];

const FUN_FACTS = [
  "Did you know? 75% of resumes are rejected by ATS before a human ever sees them.",
  "Fact: Resumes with quantified achievements get 40% more interview calls.",
  "Tip: Tailoring your resume to each job description increases callback rates by 3x.",
  "Data: The average recruiter spends just 6-7 seconds on an initial resume scan.",
  "Insight: Action verbs like 'Orchestrated' and 'Spearheaded' outperform 'Responsible for' by 2x.",
  "Stat: Resumes with a professional summary section score 21% higher on ATS.",
  "Fact: Including metrics and numbers in bullet points boosts ATS scores by up to 15 points.",
  "Tip: PDF formatting preserves your layout better than DOCX for ATS parsing.",
];

function ResumeDocumentSkeleton() {
  const skillWidths = useMemo(() => [44, 56, 38, 60, 48, 52, 42, 64], []);

  return (
    <div className="mx-auto w-full max-w-95 overflow-hidden rounded-lg border border-border bg-card shadow-2xl">
      {/* Paper texture top */}
      <div className="h-1 bg-linear-to-b from-muted/50 to-transparent" />

      <div className="space-y-3 px-5 py-4">
        {/* Name + title header */}
        <div className="space-y-2 text-center">
          <div className="mx-auto h-4 w-3/5 rounded bg-muted/60" />
          <div className="mx-auto h-2.5 w-2/5 rounded bg-muted/40" />
        </div>

        {/* Contact row */}
        <div className="flex justify-center gap-3">
          <div className="h-2 w-16 rounded bg-muted/30" />
          <div className="h-2 w-14 rounded bg-muted/30" />
          <div className="h-2 w-20 rounded bg-muted/30" />
        </div>

        {/* Divider */}
        <div className="h-px bg-border/50" />

        {/* Summary section */}
        <div className="space-y-1.5">
          <div className="h-2.5 w-16 rounded bg-muted/50" />
          <div className="h-2 w-full rounded bg-muted/20" />
          <div className="h-2 w-full rounded bg-muted/20" />
          <div className="h-2 w-3/4 rounded bg-muted/20" />
        </div>

        {/* Divider */}
        <div className="h-px bg-border/50" />

        {/* Experience section */}
        <div className="space-y-1.5">
          <div className="h-2.5 w-20 rounded bg-muted/50" />
          {/* Job 1 */}
          <div className="space-y-1">
            <div className="flex justify-between">
              <div className="h-2 w-28 rounded bg-muted/40" />
              <div className="h-2 w-14 rounded bg-muted/20" />
            </div>
            <div className="h-2 w-24 rounded bg-muted/20" />
            <div className="h-2 w-full rounded bg-muted/20" />
            <div className="h-2 w-5/6 rounded bg-muted/20" />
            <div className="h-2 w-4/6 rounded bg-muted/20" />
          </div>
          {/* Job 2 */}
          <div className="space-y-1 pt-1">
            <div className="flex justify-between">
              <div className="h-2 w-24 rounded bg-muted/40" />
              <div className="h-2 w-14 rounded bg-muted/20" />
            </div>
            <div className="h-2 w-20 rounded bg-muted/20" />
            <div className="h-2 w-full rounded bg-muted/20" />
            <div className="h-2 w-3/4 rounded bg-muted/20" />
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-border/50" />

        {/* Education section */}
        <div className="space-y-1.5">
          <div className="h-2.5 w-20 rounded bg-muted/50" />
          <div className="flex justify-between">
            <div className="h-2 w-32 rounded bg-muted/40" />
            <div className="h-2 w-14 rounded bg-muted/20" />
          </div>
          <div className="h-2 w-24 rounded bg-muted/20" />
        </div>

        {/* Skills section */}
        <div className="space-y-2 pt-1">
          <div className="h-2.5 w-14 rounded bg-muted/50" />
          <div className="flex flex-wrap gap-1.5">
            {skillWidths.map((w) => (
              <div
                key={`skill-pill-${w}`}
                className="h-2 rounded bg-muted/30"
                style={{ width: `${w}px` }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Paper texture bottom */}
      <div className="h-1 bg-linear-to-t from-muted/50 to-transparent" />
    </div>
  );
}

export default function ResumeScannerLoader({ file }: { file?: File | null }) {
  const [phase, setPhase] = useState(0);
  const [msgIndex, setMsgIndex] = useState(0);
  const [funFact, setFunFact] = useState(0);
  const documentUrl = useMemo(
    () => (file ? URL.createObjectURL(file) : null),
    [file],
  );

  useEffect(() => {
    const phaseInterval = setInterval(() => {
      setPhase((p) => (p + 1) % SCAN_PHASES.length);
      setMsgIndex(0);
    }, 5000);

    const msgInterval = setInterval(() => {
      setMsgIndex((m) => {
        const max = SCAN_PHASES[phase]?.messages.length ?? 4;
        return (m + 1) % max;
      });
    }, 2500);

    const factInterval = setInterval(() => {
      setFunFact((f) => (f + 1) % FUN_FACTS.length);
    }, 6000);

    return () => {
      clearInterval(phaseInterval);
      clearInterval(msgInterval);
      clearInterval(factInterval);
    };
  }, [phase]);

  useEffect(() => {
    return () => {
      if (documentUrl) URL.revokeObjectURL(documentUrl);
    };
  }, [documentUrl]);

  const activePhase = SCAN_PHASES[phase];

  return (
    <div className="mx-auto w-full max-w-xl px-2 py-1">
      {/* Document scan area */}
      <div className="relative mb-4">
        {/* Glow behind the document */}
        <motion.div
          className="absolute inset-0 rounded-2xl bg-primary/5 blur-3xl"
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          style={{ top: -20, bottom: -20, left: -20, right: -20 }}
        />

        <div className="relative">
          {/* Scanner border frame */}
          <div className="-inset-1 pointer-events-none absolute rounded-xl border border-primary/10" />
          <div className="-inset-2 pointer-events-none absolute rounded-xl border border-primary/5" />

          {/* Document preview */}
          <div className="relative overflow-hidden rounded-lg shadow-2xl">
            {documentUrl && file?.type === "application/pdf" ? (
              <div className="mx-auto w-full max-w-95 bg-white">
                <iframe
                  src={documentUrl}
                  className="h-[min(36vh,280px)] w-full border-0"
                  title="Resume preview"
                />
              </div>
            ) : (
              <ResumeDocumentSkeleton />
            )}

            {/* Scanning line */}
            <motion.div
              className="pointer-events-none absolute right-0 left-0 z-10"
              style={{ height: 3, top: 0 }}
              animate={{ top: ["0%", "100%"] }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              {/* Main bright line */}
              <div className="absolute inset-0 bg-primary shadow-[0_0_20px_4px_rgba(var(--primary),0.6)]" />

              {/* Upper glow spread */}
              <div className="absolute right-0 bottom-full left-0 h-8 bg-linear-to-b from-transparent via-primary/20 to-primary/40" />

              {/* Lower glow spread */}
              <div className="absolute top-full right-0 left-0 h-12 bg-linear-to-b from-primary/40 via-primary/15 to-transparent" />
            </motion.div>

            {/* Overlay that darkens unscanned area - top portion */}
            <motion.div
              className="pointer-events-none absolute right-0 left-0 z-5 bg-background/60"
              style={{ top: 0, height: "100%" }}
              animate={{ height: ["100%", "0%"] }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </div>

          {/* Corner accents */}
          <div className="-top-1 -left-1 pointer-events-none absolute h-6 w-6 rounded-tl-lg border-primary/30 border-t-2 border-l-2" />
          <div className="-top-1 -right-1 pointer-events-none absolute h-6 w-6 rounded-tr-lg border-primary/30 border-t-2 border-r-2" />
          <div className="-bottom-1 -left-1 pointer-events-none absolute h-6 w-6 rounded-bl-lg border-primary/30 border-b-2 border-l-2" />
          <div className="-bottom-1 -right-1 pointer-events-none absolute h-6 w-6 rounded-br-lg border-primary/30 border-r-2 border-b-2" />
        </div>
      </div>

      {/* Title */}
      <h2 className="mb-3 text-center font-black text-foreground text-xl tracking-tight">
        Scanning Your Resume
      </h2>

      {/* Progress bar */}
      <div className="mb-3">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <motion.div
            className="h-full rounded-full bg-linear-to-r from-primary/60 via-primary to-primary/60"
            animate={{
              width: ["20%", "45%", "65%", "85%"],
            }}
            transition={{
              duration: 17,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>
        <div className="mt-2 flex justify-between">
          {SCAN_PHASES.map((p, i) => (
            <span
              key={p.label}
              className={`font-bold text-[10px] uppercase tracking-widest transition-colors ${
                i <= phase ? "text-primary" : "text-muted-foreground/40"
              }`}
            >
              {p.label}
            </span>
          ))}
        </div>
      </div>

      {/* Current message */}
      <div className="mb-3 flex min-h-8 items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.p
            key={`${phase}-${msgIndex}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="text-center font-semibold text-base text-muted-foreground"
          >
            {activePhase.messages[msgIndex]}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Fun fact */}
      <div className="mb-3">
        <AnimatePresence mode="wait">
          <motion.div
            key={funFact}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.4 }}
            className="flex items-start gap-3 rounded-xl border border-primary/10 bg-primary/5 p-4"
          >
            <Zap className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <p className="font-medium text-primary/80 text-sm">
              {FUN_FACTS[funFact]}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Sections", value: "--" },
          { label: "Skills Found", value: "--" },
          { label: "Keywords", value: "--" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-border/50 bg-muted/50 p-3 text-center"
          >
            <motion.span
              className="block font-black text-foreground text-lg"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              {stat.value}
            </motion.span>
            <span className="font-bold text-[10px] text-muted-foreground uppercase tracking-widest">
              {stat.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
