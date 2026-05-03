"use client";

import {
  IconArrowRight,
  IconCheck,
  IconFileText,
  IconLoader2,
  IconWand,
} from "@tabler/icons-react";
import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FileUpload } from "@/components/ui/file-upload";
import { WordFadeIn } from "@/components/ui/word-fade-in";
import { cn } from "@/lib/utils";

type Step = "welcome" | "choice" | "upload" | "success";

export default function OnboardingPage() {
  const [step, setStep] = useState<Step>("welcome");
  const [isUploading, setIsUploading] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const router = useRouter();

  const handleFileUpload = async (files: File[]) => {
    if (files.length === 0) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("resume", files[0]);

    try {
      const response = await fetch("/api/parse-resume", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to parse resume");
      }

      setStep("success");
      toast.success("Resume parsed successfully!");

      // Short delay for the success animation
      setTimeout(() => {
        router.push("/analyze");
      }, 2000);
    } catch (error: any) {
      toast.error(error.message);
      setIsUploading(false);
    }
  };

  const handleStartOnboarding = async () => {
    setIsUpdatingStatus(true);
    try {
      await fetch("/api/profile", {
        method: "PATCH",
        body: JSON.stringify({ onboardingStatus: "in_progress" }),
      });
      setStep("choice");
    } catch (error) {
      toast.error("Failed to start onboarding");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleStartBuilding = async () => {
    setIsUpdatingStatus(true);
    try {
      await fetch("/api/profile", {
        method: "PATCH",
        body: JSON.stringify({ onboardingStatus: "in_progress" }),
      });

      // Create initial resume
      const res = await fetch("/api/resumes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "My Professional Resume" }),
      });

      if (res.ok) {
        const data = await res.json();
        router.push(`/resumes/${data.resume.id}`);
      } else {
        router.push("/resumes");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 overflow-hidden relative">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]" />
      </div>
      <AnimatePresence mode="wait">
        {step === "welcome" && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center max-w-2xl"
          >
            <WordFadeIn
              words="Welcome to Career Intelligence"
              className="text-4xl md:text-6xl font-bold text-foreground mb-6"
            />
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-muted-foreground text-lg mb-10"
            >
              Let&apos;s get your profile ready to find your dream job and
              bridge your skill gaps.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.2 }}
            >
              <Button
                variant="gradient"
                size="lg"
                onClick={handleStartOnboarding}
                disabled={isUpdatingStatus}
                className="group px-8 h-12 text-base rounded-full transition-all duration-300"
              >
                {isUpdatingStatus ? (
                  <IconLoader2 className="h-5 w-5 animate-spin mr-2" />
                ) : (
                  <>
                    Get Started
                    <IconArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </Button>
            </motion.div>
          </motion.div>
        )}

        {step === "choice" && (
          <motion.div
            key="choice"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="w-full max-w-4xl"
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">
                How would you like to start?
              </h2>
              <p className="text-muted-foreground">
                We need your professional history to analyze your career path.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ChoiceCard
                title="I have a resume"
                description="Upload your existing PDF or Word document. We'll parse it instantly."
                icon={<IconFileText className="h-8 w-8 text-primary" />}
                onClick={() => setStep("upload")}
              />
              <ChoiceCard
                title="I'll build one here"
                description="Use our AI-powered builder to create a professional resume from scratch."
                icon={<IconWand className="h-8 w-8 text-primary" />}
                onClick={handleStartBuilding}
              />
            </div>
          </motion.div>
        )}

        {step === "upload" && (
          <motion.div
            key="upload"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="w-full max-w-2xl"
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-foreground mb-2">
                Upload your Resume
              </h2>
              <p className="text-muted-foreground">
                Supports PDF, DOCX, and TXT (Max 10MB)
              </p>
            </div>

            <Card
              className={cn(
                "p-1 border-2 border-dashed border-border bg-card transition-colors",
                isUploading && "opacity-50 pointer-events-none",
              )}
            >
              <FileUpload onChange={handleFileUpload} />
            </Card>

            {isUploading && (
              <div className="mt-8 flex flex-col items-center gap-4">
                <IconLoader2 className="h-10 w-10 text-primary animate-spin" />
                <p className="text-muted-foreground font-medium animate-pulse">
                  Our AI is analyzing your career history...
                </p>
              </div>
            )}

            {!isUploading && (
              <Button
                variant="ghost"
                onClick={() => setStep("choice")}
                className="mt-6 mx-auto flex items-center text-muted-foreground hover:text-foreground"
              >
                Go back
              </Button>
            )}
          </motion.div>
        )}

        {step === "success" && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="h-24 w-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8 shadow-[var(--shadow-glow)]">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 200,
                  damping: 10,
                  delay: 0.2,
                }}
              >
                <IconCheck className="h-12 w-12 text-primary" />
              </motion.div>
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Profile Ready!
            </h2>
            <p className="text-muted-foreground text-lg">
              We&apos;ve analyzed your resume. Redirecting you to your career
              insights...
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ChoiceCard({
  title,
  description,
  icon,
  onClick,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <motion.button
      whileHover={{ y: -5, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="text-left"
    >
      <Card className="h-full p-8 border-border bg-card hover:border-primary/50 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-primary/5 group">
        <div className="mb-6 p-3 w-fit rounded-2xl bg-muted group-hover:bg-primary/10 transition-colors">
          {icon}
        </div>
        <h3 className="text-xl font-bold text-foreground mb-3">{title}</h3>
        <p className="text-muted-foreground leading-relaxed">{description}</p>
      </Card>
    </motion.button>
  );
}
