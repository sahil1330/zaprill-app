"use client";

import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type React from "react";
import { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut } from "@/lib/auth-client";

// ── helpers ────────────────────────────────────────────────────────────────

function getInitials(name?: string | null, email?: string | null): string {
  if (name) {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  if (email) return email[0].toUpperCase();
  return "?";
}

// ── UserAvatar ─────────────────────────────────────────────────────────────

export interface NavUser {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  isPro?: boolean;
}

function UserAvatar({ user }: { user: NavUser }) {
  const [isPro, setIsPro] = useState(user.isPro ?? false);

  useEffect(() => {
    if (user.isPro !== undefined) return;
    fetch("/api/billing/subscription")
      .then((res) => res.json())
      .then((data) => {
        setIsPro(!!data.subscription);
      })
      .catch(console.error);
  }, [user.isPro]);

  return (
    <div className="relative">
      <Avatar size="default" className="cursor-pointer">
        {user.image && (
          <AvatarImage src={user.image} alt={user.name ?? "User avatar"} />
        )}
        <AvatarFallback className="font-bold text-xs tracking-wide">
          {getInitials(user.name, user.email)}
        </AvatarFallback>
      </Avatar>
      <div
        className={`absolute -bottom-1 -right-1 px-1.5 py-0.5 text-[9px] font-bold uppercase rounded-sm border shadow-sm ${
          isPro
            ? "bg-primary text-primary-foreground border-primary"
            : "bg-muted text-muted-foreground border-border"
        }`}
      >
        {isPro ? "PRO" : "FREE"}
      </div>
    </div>
  );
}

// ── Navbar ─────────────────────────────────────────────────────────────────

export interface NavbarProps {
  /** Page-specific left slot: icon + title, shown to the right of the back button */
  pageTitle?: React.ReactNode;
  /** Extra badge/pill rendered in the centre area (e.g. the "Complete" badge) */
  centreBadge?: React.ReactNode;
  /** Whether to show the back-button (defaults to true) */
  showBack?: boolean;
  /** Override the back destination (defaults to "/") */
  backHref?: string;
  /** Label for the back button (defaults to "Back") */
  backLabel?: string;
  /** Whether the nav is sticky (true) or fixed (false). Default: sticky */
  sticky?: boolean;
  /** Authenticated user — if omitted the nav shows a Sign In button */
  user?: NavUser | null;
  /**
   * Pass `true` while the session is being fetched client-side.
   * The nav will render an inert skeleton instead of Sign In / avatar so
   * users can't accidentally trigger the proxy redirect loop during loading.
   */
  sessionLoading?: boolean;
}

export default function Navbar({
  pageTitle,
  centreBadge,
  showBack = false,
  backHref = "/",
  backLabel = "Back",
  sticky = true,
  user,
  sessionLoading = false,
}: NavbarProps) {
  const router = useRouter();
  const positionClass = sticky ? "sticky top-0" : "fixed top-0 left-0 right-0";

  return (
    <nav
      className={`${positionClass} z-50 bg-background/95 backdrop-blur-xl border-b border-border px-6`}
    >
      <div className="max-w-6xl mx-auto h-16 flex items-center gap-4">
        {/* ── Logo (always visible when no back button) / Back button ── */}
        {showBack ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(backHref)}
            className="text-sm font-bold shrink-0"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {backLabel}
          </Button>
        ) : (
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <span className="hidden sm:block">
              <Image
                src={"/logo.png"}
                alt={"Zaprill"}
                width={100}
                height={100}
                loading="eager"
              />
            </span>
          </Link>
        )}

        {/* ── Page title slot ── */}
        {pageTitle && (
          <div className="flex items-center gap-3 flex-1 border-l border-border pl-4 min-w-0">
            {pageTitle}
          </div>
        )}

        {/* push everything else right when no pageTitle */}
        {!pageTitle && <div className="flex-1" />}

        {/* ── Centre badge (optional) ── */}
        {centreBadge && (
          <div className="hidden sm:flex items-center">{centreBadge}</div>
        )}

        {/* ── Right-side actions ── */}
        <div className="flex items-center gap-3 shrink-0">
          {sessionLoading ? (
            // Skeleton placeholder — prevents Sign In being clicked before session resolves
            <div
              className="h-9 w-20 rounded-md bg-muted animate-pulse"
              aria-hidden
            />
          ) : user ? (
            <>
              <Link href="/history">
                <Button
                  variant="ghost"
                  size="sm"
                  className="font-bold text-xs hidden sm:inline-flex"
                >
                  History
                </Button>
              </Link>

              <DropdownMenu>
                <DropdownMenuTrigger
                  className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  aria-label="User menu"
                >
                  <UserAvatar user={user} />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-3 py-2 border-b border-border mb-1">
                    {user.name && (
                      <p className="text-sm font-bold truncate">{user.name}</p>
                    )}
                    {user.email && (
                      <p className="text-xs text-muted-foreground truncate">
                        {user.email}
                      </p>
                    )}
                  </div>
                  <DropdownMenuItem
                    onClick={() => router.push("/profile")}
                    className="font-semibold cursor-pointer"
                  >
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => router.push("/billing")}
                    className="font-semibold cursor-pointer"
                  >
                    Billing
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => router.push("/history")}
                    className="font-semibold cursor-pointer"
                  >
                    History
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() =>
                      signOut({
                        fetchOptions: { onSuccess: () => router.push("/") },
                      })
                    }
                    className="font-semibold text-destructive focus:text-destructive cursor-pointer"
                  >
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Link href="/sign-in">
              <Button variant="default" size="sm" className="font-bold h-9">
                Sign In
              </Button>
            </Link>
          )}

          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}
