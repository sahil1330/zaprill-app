"use client";

import { ArrowRight, Shield, Target, Zap } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app/app-shell";
import UserDashboard from "@/components/dashboard/UserDashboard";
import { DashboardSkeleton } from "@/components/loading/PageLoaders";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { GridPattern } from "@/components/ui/file-upload";
import { WordFadeIn } from "@/components/ui/word-fade-in";
import { trackSavedProfileUsed } from "@/lib/analytics";
import { useSession } from "@/lib/auth-client";

export default function HomePage() {
  const router = useRouter();
  const { data: session, isPending: sessionLoading } = useSession();

  // undefined = not fetched yet. null = fetched, no/empty profile.
  // Treating "null profile" as still-loading was trapping new users on the skeleton.
  const [profile, setProfile] = useState<any>(undefined);
  const [isFetchingProfile, setIsFetchingProfile] = useState(false);

  useEffect(() => {
    if (!session?.user) {
      setProfile(undefined);
      setIsFetchingProfile(false);
      return;
    }

    let cancelled = false;
    setIsFetchingProfile(true);

    const timeoutId = window.setTimeout(() => {
      if (!cancelled) {
        setProfile((current: unknown) =>
          current === undefined ? null : current,
        );
        setIsFetchingProfile(false);
      }
    }, 12_000);

    fetch("/api/profile")
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (!res.ok) {
          throw new Error(data.error || "Failed to load profile");
        }
        setProfile(data.profile ?? null);
      })
      .catch((err) => {
        console.error("Failed to load profile", err);
        if (!cancelled) setProfile(null);
      })
      .finally(() => {
        window.clearTimeout(timeoutId);
        if (!cancelled) setIsFetchingProfile(false);
      });

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
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

  const shellUser = session?.user
    ? {
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
      }
    : null;

  // 1. Initial Auth Loading - Show Skeleton
  if (sessionLoading) {
    return (
      <main className="relative flex min-h-screen flex-col overflow-hidden bg-background">
        <div className="pointer-events-none absolute inset-0 z-0 opacity-50 dark:opacity-20">
          <GridPattern />
        </div>
        <Navbar sticky={true} user={undefined} sessionLoading={true} />
        <DashboardSkeleton />
      </main>
    );
  }

  // 2. Fetching Profile for Logged In User - Show Skeleton
  // Only while the request is in flight or has not resolved. A resolved
  // `null` profile means the user has not onboarded — do NOT keep spinning.
  if (session && (isFetchingProfile || profile === undefined)) {
    return (
      <AppShell user={shellUser!}>
        <DashboardSkeleton />
      </AppShell>
    );
  }

  // 3. User logged in and completed onboarding - Show Dashboard
  if (session && profile?.onboardingStatus === "completed") {
    return (
      <AppShell user={shellUser!}>
        <UserDashboard profile={profile} session={session} />
      </AppShell>
    );
  }

  // 4. Logged in but not onboarded — app shell + onboarding CTA
  if (session) {
    return (
      <AppShell user={shellUser!}>
        <section className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center px-6 py-16 text-center md:py-24">
          <div className="fade-in slide-in-from-bottom-4 mb-8 animate-in duration-700">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 font-bold text-primary text-xs uppercase tracking-[0.2em]">
              <Zap className="h-3 w-3 fill-current" />
              AI-Powered Career Intelligence
            </span>
          </div>

          <WordFadeIn
            words="Find the job you actually deserve."
            className="mb-8 max-w-5xl font-black font-heading text-5xl text-foreground leading-[0.9] tracking-tighter md:text-7xl"
          />

          <p className="fade-in slide-in-from-bottom-6 mb-12 max-w-2xl animate-in font-medium text-lg text-muted-foreground leading-relaxed delay-200 duration-1000 md:text-xl">
            Complete onboarding to unlock personalized job matches and resume
            analysis.
          </p>

          <Link href="/onboarding" className="w-full sm:w-auto">
            <Button
              size="lg"
              className="group relative h-16 w-full overflow-hidden rounded-2xl px-10 font-black text-lg shadow-2xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98] sm:h-20 sm:px-12 sm:text-xl"
            >
              <div className="absolute inset-0 bg-(--gradient-primary) opacity-90 transition-opacity group-hover:opacity-100" />
              <span className="relative flex items-center gap-3">
                Complete Your Onboarding
                <ArrowRight className="h-6 w-6 transition-transform group-hover:translate-x-1" />
              </span>
            </Button>
          </Link>
        </section>
      </AppShell>
    );
  }

  // 5. Guest View
  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden bg-background">
      {/* Background Grid Pattern */}
      <div className="mask-[linear-gradient(to_bottom,white,transparent)] pointer-events-none absolute inset-0 z-0 opacity-50 dark:opacity-20">
        <GridPattern />
      </div>

      <Navbar sticky={false} user={null} sessionLoading={false} />

      {/* Hero Section */}
      <section className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col items-center px-6 pt-40 pb-32 text-center">
        <div className="fade-in slide-in-from-bottom-4 mb-8 animate-in duration-700">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 font-bold text-primary text-xs uppercase tracking-[0.2em]">
            <Zap className="h-3 w-3 fill-current" />
            AI-Powered Career Intelligence
          </span>
        </div>

        <WordFadeIn
          words="Find the job you actually deserve."
          className="mb-8 max-w-5xl font-black font-heading text-6xl text-foreground leading-[0.9] tracking-tighter md:text-8xl"
        />

        <p className="fade-in slide-in-from-bottom-6 mb-12 max-w-2xl animate-in font-medium text-muted-foreground text-xl leading-relaxed delay-200 duration-1000 md:text-2xl">
          We decode your professional DNA to match you with roles where you'll
          actually thrive. No more keyword guessing, just pure data-driven
          career growth.
        </p>

        {/* Primary Action Area */}
        <div className="fade-in slide-in-from-bottom-8 flex w-full max-w-2xl animate-in flex-col items-center delay-500 duration-1000">
          <div className="flex w-full flex-col items-center gap-8">
            <Link href="/sign-in" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="group relative h-20 w-full overflow-hidden rounded-2xl px-12 font-black text-xl shadow-2xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <div className="absolute inset-0 bg-(--gradient-primary) opacity-100 transition-opacity group-hover:opacity-90" />
                <span className="relative flex items-center gap-3">
                  Get Started Now
                  <ArrowRight className="h-6 w-6 transition-transform group-hover:translate-x-1" />
                </span>
              </Button>
            </Link>
            <div className="flex items-center gap-8 font-bold text-muted-foreground text-xs uppercase tracking-widest opacity-60">
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
        </div>
      </section>

      <footer className="relative z-10 border-border border-t bg-background py-12">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-6 md:flex-row">
          <div className="font-medium text-muted-foreground text-sm">
            Made by <span className="text-primary italic">Team Zaprill</span>
          </div>
          <div className="flex items-center gap-6 font-bold text-sm">
            <Link
              href="/sign-in"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              Sign in
            </Link>
            <Link
              href="/sign-up"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              Get started
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
