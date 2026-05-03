"use client";

import {
  ArrowRight,
  Globe,
  Loader2,
  Map,
  Shield,
  Target,
  TrendingUp,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import PricingPlans from "@/components/PricingPlans";
import { Button } from "@/components/ui/button";
import { GridPattern } from "@/components/ui/file-upload";
import { WordFadeIn } from "@/components/ui/word-fade-in";
import { trackSavedProfileUsed } from "@/lib/analytics";
import { useSession } from "@/lib/auth-client";

const FEATURES = [
  {
    icon: Target,
    title: "AI Resume Parsing",
    description:
      "Our intelligence engine extracts every skill, project, and experience from your resume with surgical precision.",
  },
  {
    icon: Globe,
    title: "Real Job Search",
    description:
      "Live job listings from LinkedIn, Indeed, Google Jobs — matched to your exact skill profile.",
  },
  {
    icon: TrendingUp,
    title: "Skill Match Score",
    description:
      "See your compatibility percentage for each role. Know exactly where you stand before applying.",
  },
  {
    icon: Map,
    title: "Learning Roadmap",
    description:
      "Personalized action plan: skills to learn, resources to use, and timeline to get job-ready.",
  },
];

export default function HomePage() {
  const router = useRouter();
  const { data: session, isPending: sessionLoading } = useSession();

  const [profile, setProfile] = useState<any>(null);
  const [isFetchingProfile, setIsFetchingProfile] = useState(false);
  const [plans, setPlans] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/billing/plans")
      .then((res) => res.json())
      .then((data) => {
        if (data.plans) {
          setPlans(data.plans);
        }
      })
      .catch((err) => console.error("Failed to load plans", err));
  }, []);

  useEffect(() => {
    if (session?.user) {
      setIsFetchingProfile(true);
      fetch("/api/profile")
        .then((res) => res.json())
        .then((data) => {
          if (data.profile) {
            setProfile(data.profile);
          }
        })
        .catch((err) => console.error("Failed to load profile", err))
        .finally(() => setIsFetchingProfile(false));
    } else {
      setProfile(null);
    }
  }, [session?.user]);

  const handleUseSavedProfile = () => {
    if (profile?.resumeRaw) {
      trackSavedProfileUsed();
      sessionStorage.setItem(
        "ai_job_god_resume",
        JSON.stringify(profile.resumeRaw),
      );
      router.push("/analyze");
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
            ? undefined // render skeleton — no Sign In button while loading
            : session
              ? {
                  name: session.user.name,
                  email: session.user.email,
                  image: session.user.image,
                }
              : null // explicitly null = signed out → show Sign In
        }
        sessionLoading={sessionLoading}
      />

      {/* Hero Section */}
      <section className="flex-1 pt-40 pb-32 flex flex-col items-center text-center px-6 relative z-10 w-full max-w-6xl mx-auto">
        <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-bold text-primary uppercase tracking-[0.2em]">
            <Zap className="h-3 w-3 fill-current" />
            AI-Powered Career Intelligence
          </span>
        </div>

        <WordFadeIn
          words="Find the job you actually deserve."
          className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] max-w-5xl mb-8 text-foreground"
        />

        <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl leading-relaxed mb-12 font-medium animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-200">
          We decode your professional DNA to match you with roles where you'll
          actually thrive. No more keyword guessing, just pure data-driven
          career growth.
        </p>

        {/* Primary Action Area */}
        <div className="w-full max-w-2xl flex flex-col items-center animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500">
          {isFetchingProfile ? (
            <div className="h-20 flex items-center justify-center gap-3 text-muted-foreground font-bold">
              <Loader2 className="h-6 w-6 animate-spin" />
              Syncing career profile...
            </div>
          ) : session ? (
            profile?.onboardingStatus === "completed" ? (
              <div className="flex flex-col items-center gap-6 w-full">
                <Button
                  size="lg"
                  className="group relative h-20 px-12 rounded-2xl text-xl font-black shadow-2xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98] w-full sm:w-auto"
                  onClick={handleUseSavedProfile}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="relative flex items-center gap-3">
                    Search Jobs for{" "}
                    {profile.resumeRaw?.basics?.name?.split(" ")[0] ||
                      session.user.name.split(" ")[0]}
                    <ArrowRight className="h-6 w-6 transition-transform group-hover:translate-x-1" />
                  </span>
                </Button>
                <div className="flex items-center gap-2 text-muted-foreground font-bold text-xs uppercase tracking-widest">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  Profile Ready & Analyzed
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-6 w-full">
                <Link href="/onboarding" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    className="h-20 px-12 rounded-2xl text-xl font-black shadow-2xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98] w-full group relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-90 group-hover:opacity-100 transition-opacity" />
                    <span className="relative flex items-center gap-3">
                      Complete Your Onboarding
                      <ArrowRight className="h-6 w-6 transition-transform group-hover:translate-x-1" />
                    </span>
                  </Button>
                </Link>
                <p className="text-sm text-muted-foreground font-bold">
                  Just one step away from personalized job matches.
                </p>
              </div>
            )
          ) : (
            <div className="flex flex-col items-center gap-8 w-full">
              <Link href="/sign-in" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="h-20 px-12 rounded-2xl text-xl font-black shadow-2xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98] w-full"
                >
                  Get Started Now
                  <ArrowRight className="ml-3 h-6 w-6" />
                </Button>
              </Link>
              <div className="flex items-center gap-8 text-muted-foreground font-bold text-xs uppercase tracking-widest opacity-60">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  100% Private
                </div>
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  AI Precision
                </div>
              </div>
            </div>
          )}
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
                <div
                  key={feat.title}
                  className="flex flex-col p-6 rounded-xl border border-border bg-background shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="w-10 h-10 rounded border border-border bg-muted/50 flex items-center justify-center mb-6">
                    <Icon className="h-5 w-5 text-foreground" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">
                    {feat.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feat.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      {plans.length > 0 && (
        <section
          id="pricing"
          className="py-24 px-6 border-t border-border/50 relative z-10 w-full"
        >
          <div className="max-w-7xl mx-auto text-center">
            <div className="mb-16">
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4 text-foreground">
                Simple, Transparent Pricing
              </h2>
              <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                Choose the perfect plan for your career growth. No hidden fees,
                just pure AI power.
              </p>
            </div>
            <PricingPlans plans={plans} />
          </div>
        </section>
      )}

      <footer className="py-12 border-t border-border bg-background relative z-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-sm font-medium text-muted-foreground">
            Made with ❤️ by{" "}
            <span className="italic text-primary">Team Zaprill</span>
          </div>
          <div className="flex items-center gap-6 text-sm font-bold">
            <Link
              href="/#pricing"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Pricing
            </Link>
            <Link
              href="/history"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              History
            </Link>
            <Link
              href="/profile"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Profile
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
