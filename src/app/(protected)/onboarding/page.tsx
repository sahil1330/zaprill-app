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
      router.push("/resumes");
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex flex-col items-center justify-center p-4 overflow-hidden">
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
              className="text-4xl md:text-6xl font-bold text-neutral-900 dark:text-white mb-6"
            />
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-neutral-600 dark:text-neutral-400 text-lg mb-10"
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
                size="lg"
                onClick={handleStartOnboarding}
                disabled={isUpdatingStatus}
                className="group px-8 h-12 text-base rounded-full"
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
              <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-4">
                How would you like to start?
              </h2>
              <p className="text-neutral-600 dark:text-neutral-400">
                We need your professional history to analyze your career path.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ChoiceCard
                title="I have a resume"
                description="Upload your existing PDF or Word document. We'll parse it instantly."
                icon={<IconFileText className="h-8 w-8 text-blue-500" />}
                onClick={() => setStep("upload")}
              />
              <ChoiceCard
                title="I'll build one here"
                description="Use our AI-powered builder to create a professional resume from scratch."
                icon={<IconWand className="h-8 w-8 text-purple-500" />}
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
              <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">
                Upload your Resume
              </h2>
              <p className="text-neutral-600 dark:text-neutral-400">
                Supports PDF, DOCX, and TXT (Max 10MB)
              </p>
            </div>

            <Card
              className={cn(
                "p-1 border-2 border-dashed border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 transition-colors",
                isUploading && "opacity-50 pointer-events-none",
              )}
            >
              <FileUpload onChange={handleFileUpload} />
            </Card>

            {isUploading && (
              <div className="mt-8 flex flex-col items-center gap-4">
                <IconLoader2 className="h-10 w-10 text-blue-500 animate-spin" />
                <p className="text-neutral-600 dark:text-neutral-400 font-medium animate-pulse">
                  Our AI is analyzing your career history...
                </p>
              </div>
            )}

            {!isUploading && (
              <Button
                variant="ghost"
                onClick={() => setStep("choice")}
                className="mt-6 mx-auto flex items-center text-neutral-500"
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
            <div className="h-24 w-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl shadow-green-500/20">
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
                <IconCheck className="h-12 w-12 text-green-600 dark:text-green-400" />
              </motion.div>
            </div>
            <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-4">
              Profile Ready!
            </h2>
            <p className="text-neutral-600 dark:text-neutral-400 text-lg">
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
      <Card className="h-full p-8 border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-blue-500/50 dark:hover:border-blue-500/50 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-blue-500/5 group">
        <div className="mb-6 p-3 w-fit rounded-2xl bg-neutral-50 dark:bg-neutral-800 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 transition-colors">
          {icon}
        </div>
        <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-3">
          {title}
        </h3>
        <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
          {description}
        </p>
      </Card>
    </motion.button>
  );
}
