"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app/app-shell";
import {
  HomeBoard,
  HomeBoardSkeleton,
} from "@/components/intelligence/home-board";
import { useSession } from "@/lib/auth-client";
import { resolveHomeEntry } from "@/lib/home-entry";

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

  const shellUser = session?.user
    ? {
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
      }
    : null;

  const entry = resolveHomeEntry({
    sessionLoading,
    hasSession: Boolean(session?.user),
    profilePending:
      Boolean(session?.user) && (isFetchingProfile || profile === undefined),
  });

  useEffect(() => {
    if (entry === "sign-in") {
      router.replace("/sign-in");
    }
  }, [entry, router]);

  if (entry === "sign-in") return null;

  if (entry === "loading") {
    return (
      <main className="bg-background">
        <HomeBoardSkeleton />
      </main>
    );
  }

  return (
    <AppShell user={shellUser!}>
      <HomeBoard atsScore={profile?.lastAtsScore ?? null} />
    </AppShell>
  );
}
