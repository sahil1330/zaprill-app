"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import ResumeUploader from "@/components/ResumeUploader";
import {
  Target,
  TrendingUp,
  Map,
  ArrowRight,
  Shield,
  Globe,
  Loader2,
  Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { GridPattern } from "@/components/ui/file-upload";
import { WordFadeIn } from "@/components/ui/word-fade-in";
import { useSession } from "@/lib/auth-client";
import Navbar from "@/components/Navbar";
import {
  trackResumeFileSelected,
  trackResumeUploadStart,
  trackResumeParseSuccess,
  trackResumeParseFailure,
  trackSavedProfileUsed,
  trackResumeReplaced,
} from "@/lib/analytics";

const FEATURES = [
  {
    icon: Target,
    title: "AI Resume Parsing",
    description: "Our intelligence engine extracts every skill, project, and experience from your resume with surgical precision.",
  },
  {
    icon: Globe,
    title: "Real Job Search",
    description: "Live job listings from LinkedIn, Indeed, Google Jobs — matched to your exact skill profile.",
  },
  {
    icon: TrendingUp,
    title: "Skill Match Score",
    description: "See your compatibility percentage for each role. Know exactly where you stand before applying.",
  },
  {
    icon: Map,
    title: "Learning Roadmap",
    description: "Personalized action plan: skills to learn, resources to use, and timeline to get job-ready.",
  },
];

const STATS = [
  { value: "200+", label: "Skills tracked" },
  { value: "10k+", label: "Jobs searched" },
  { value: "< 60s", label: "Full analysis" },
];

export default function HomePage() {
  const router = useRouter();
  const { data: session, isPending: sessionLoading } = useSession();
  
  const [profile, setProfile] = useState<any>(null);
  const [isFetchingProfile, setIsFetchingProfile] = useState(false);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (session?.user) {
      setIsFetchingProfile(true);
      fetch('/api/profile')
        .then(res => res.json())
        .then(data => {
          if (data.profile) {
            setProfile(data.profile);
          }
        })
        .catch(err => console.error("Failed to load profile", err))
        .finally(() => setIsFetchingProfile(false));
    } else {
      setProfile(null);
    }
  }, [session?.user]);

  const handleUseSavedProfile = () => {
    if (profile?.resumeRaw) {
      trackSavedProfileUsed();
      sessionStorage.setItem("ai_job_god_resume", JSON.stringify(profile.resumeRaw));
      router.push("/analyze");
    }
  };

  const handleUpload = useCallback((file: File) => {
    setSelectedFile(file);
    setError(null);
    trackResumeFileSelected({
      file_type: file.name.split(".").pop()?.toLowerCase() ?? "unknown",
      file_size_kb: Math.round(file.size / 1024),
    });
  }, []);

  const handleAnalyze = async () => {
    if (!selectedFile) return;
    setIsAnalyzing(true);
    setError(null);

    const fileType = selectedFile.name.split(".").pop()?.toLowerCase() ?? "unknown";
    const fileSizeKb = Math.round(selectedFile.size / 1024);
    const startTime = performance.now();

    trackResumeUploadStart({ file_type: fileType, file_size_kb: fileSizeKb });

    try {
      const formData = new FormData();
      formData.append("resume", selectedFile);

      const parseRes = await fetch("/api/parse-resume", {
        method: "POST",
        body: formData,
      });
      if (!parseRes.ok) {
        const err = await parseRes.json();
        throw new Error(err.error ?? "Failed to parse resume");
      }
      const resume = await parseRes.json();

      trackResumeParseSuccess({
        file_type: fileType,
        file_size_kb: fileSizeKb,
        skill_count: resume.skills?.length ?? 0,
        has_location: Boolean(resume.location),
        experience_count: resume.experience?.length ?? 0,
        duration_ms: Math.round(performance.now() - startTime),
      });

      sessionStorage.setItem("ai_job_god_resume", JSON.stringify(resume));
      router.push("/analyze");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      trackResumeParseFailure({ error_message: message, file_type: fileType });
      setError(message);
      setIsAnalyzing(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 z-0 pointer-events-none [mask-image:linear-gradient(to_bottom,white,transparent)] opacity-50 dark:opacity-20">
        <GridPattern />
      </div>

      <Navbar
        sticky={false}
        user={
          sessionLoading
            ? undefined
            : session
            ? { name: session.user.name, email: session.user.email, image: session.user.image }
            : null
        }
      />

      {/* Hero Section */}
      <section className="flex-1 pt-32 pb-20 flex flex-col items-center text-center px-6 relative z-10 w-full max-w-6xl mx-auto">
        <div className="mb-6">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted border border-border text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Not just an ATS checker
          </span>
        </div>

        <WordFadeIn 
          words="Your Resume, Decoded by AI." 
          className="text-5xl md:text-7xl font-black tracking-tighter leading-tight max-w-4xl mb-6 text-foreground"
        />

        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed mb-12">
          Upload your resume. We'll find real jobs matching your skills, show
          you exactly where you fall short, and build a personalized roadmap to
          get you hired.
        </p>

        {/* Form area / Upload */}
        <div className="w-full max-w-3xl flex flex-col items-center border border-border/50 bg-background/50 backdrop-blur-xl rounded-2xl shadow-sm p-4 mb-20">
          {isFetchingProfile ? (
            <div className="w-full py-12 flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mr-2" />
              <span className="text-muted-foreground font-medium text-sm">Checking for saved profile...</span>
            </div>
          ) : profile ? (
            <div className="w-full flex flex-col items-center pt-4 pb-8 px-4">
              <div className="h-16 w-16 bg-muted border border-border rounded-2xl flex items-center justify-center mb-4">
                <Target className="h-8 w-8 text-foreground" />
              </div>
              <h3 className="text-2xl font-black mb-2">Saved Profile Found</h3>
              <p className="text-muted-foreground text-center mb-8 font-medium">
                We have <span className="font-bold text-foreground">{profile.resumeRaw?.name}</span>'s resume saved in your profile. You can start analyzing right away or upload a new one to replace it.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
                <Button 
                  size="lg" 
                  className="font-bold w-full sm:w-auto h-12 px-8"
                  onClick={handleUseSavedProfile}
                >
                  <Zap className="mr-2 h-4 w-4 fill-current" />
                  Analyze Saved Resume
                </Button>
                <div className="relative overflow-hidden group">
                  <Button variant="outline" size="lg" className="font-bold w-full sm:w-auto h-12 bg-background">
                    Upload New Resume
                  </Button>
                  <input
                    type="file"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        trackResumeReplaced();
                        handleUpload(e.target.files[0]);
                      }
                    }}
                  />
                </div>
              </div>
              <div className="mt-4 text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60 font-bold">
                Supports PDF, DOCX, DOC, TXT (Max 10MB)
              </div>
            </div>
          ) : (
            <ResumeUploader onUpload={handleUpload} disabled={isAnalyzing} />
          )}
          
          {(!profile || selectedFile) && (
          <div className="w-full mt-4 flex flex-col md:flex-row items-center justify-between gap-4 px-4 bg-muted/30 py-3 rounded-lg border border-border/50">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Shield className="h-4 w-4" />
              <span className="text-xs font-medium">
                100% private — processed on request, never saved without permission.
              </span>
            </div>

            <Button
              id="analyze-resume-btn"
              onClick={handleAnalyze}
              disabled={!selectedFile || isAnalyzing}
              className="w-full md:w-auto transition-all"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  Analyze Request
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
          )}
          {error && (
            <div className="w-full mt-3 p-3 bg-destructive/10 border border-destructive/20 rounded-md text-destructive text-sm font-medium">
              ⚠️ {error}
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-8 md:gap-16 pt-10 border-t border-border/50 w-full max-w-3xl">
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">
                {stat.value}
              </div>
              <div className="text-sm font-medium text-muted-foreground mt-1 uppercase tracking-wide">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6 bg-muted/20 border-t border-border/50 relative z-10 w-full">
        <div className="max-w-6xl mx-auto">
          <div className="mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4 text-foreground">
              Intelligent Career Trajectory
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl">
              We don't just scan keywords. We understand your experience deeply
              and build a quantifiable path forward.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((feat) => {
              const Icon = feat.icon;
              return (
                <div key={feat.title} className="flex flex-col p-6 rounded-xl border border-border bg-background shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 rounded border border-border bg-muted/50 flex items-center justify-center mb-6">
                    <Icon className="h-5 w-5 text-foreground" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">{feat.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feat.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border bg-background text-sm font-medium text-muted-foreground text-center relative z-10">
        Built with Next.js 16 · Vercel AI SDK · Gemini · Shadcn UI
      </footer>
    </main>
  );
}
