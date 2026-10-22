"use client";

import { ArrowRight, BriefcaseIcon, Gift, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { checkUserExists } from "@/app/actions/auth";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { InAppBrowserWarning } from "@/components/auth/InAppBrowserWarning";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { useInAppBrowser } from "@/hooks/useInAppBrowser";
import {
  captureReferralCode,
  getStoredReferralCode,
} from "@/hooks/useReferralClaim";
import { signIn, signUp } from "@/lib/auth-client";

function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [referralDiscount, setReferralDiscount] = useState<number | null>(null);
  const { isInApp, appName } = useInAppBrowser();
  const [googleInAppBlocked, setGoogleInAppBlocked] = useState(false);

  // Capture ?ref= from URL into localStorage on mount
  useEffect(() => {
    captureReferralCode();
    const code = getStoredReferralCode();
    if (code) {
      setReferralCode(code);
      // Fetch discount % from validate endpoint (best-effort)
      fetch(`/api/referrals/validate?code=${encodeURIComponent(code)}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.valid && data.discountPct) {
            setReferralDiscount(data.discountPct);
          }
        })
        .catch(() => {});
    }
  }, []);

  const handleCredentialsSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Pre-check if user exists to prevent "silent success" for existing users
    const exists = await checkUserExists(email);
    if (exists) {
      setError("An account with this email already exists.");
      setLoading(false);
      return;
    }

    const { data, error } = await signUp.email({
      name,
      email,
      password,
      callbackURL: callbackUrl,
    });

    if (error) {
      setError(error.message || "Failed to create account");
      setLoading(false);
    } else {
      // Better-auth sends a verification email by default if `requireEmailVerification` is true.
      setEmailSent(true);
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (isInApp) {
      setGoogleInAppBlocked(true);
      return;
    }
    try {
      setGoogleLoading(true);
      setError(null);

      const { error } = await signIn.social({
        provider: "google",
        callbackURL: callbackUrl,
      });

      if (error) {
        setError(error.message || "Failed to sign in with Google");
      }
    } catch (error) {
      console.log(error);
      setError("Failed to sign in with Google");
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background p-4">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-grid-black/[0.02] dark:bg-grid-white/[0.02]" />

      <div className="relative z-10 flex w-full max-w-sm flex-col items-center">
        <Link href="/" className="group mb-8 flex items-center gap-2">
          <span>
            <Image
              src={"/logo.png"}
              alt={"Zaprill"}
              width={100}
              height={100}
              loading="eager"
            />
          </span>
        </Link>

        {emailSent ? (
          <Card className="w-full border-border shadow-lg">
            <CardHeader className="pb-6 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <svg
                  className="h-6 w-6 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  role="img"
                  aria-label="Email"
                >
                  <title>Email</title>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <CardTitle className="font-black text-2xl tracking-tight">
                Check your email
              </CardTitle>
              <CardDescription className="mt-2 font-medium text-sm">
                We sent a verification link to{" "}
                <span className="font-bold text-foreground">{email}</span>.
                Click the link to activate your account.
              </CardDescription>
            </CardHeader>
            <CardFooter className="flex flex-col border-border border-t bg-muted/20 pt-6 pb-6">
              <Button
                variant="outline"
                className="h-11 w-full font-bold"
                onClick={() => router.push("/sign-in")}
              >
                Return to sign in
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <Card
            className="w-full border-border shadow-lg"
            data-testid="auth-card"
          >
            <CardHeader className="pb-6 text-center">
              <CardTitle className="font-black text-2xl tracking-tight">
                Create an account
              </CardTitle>
              <CardDescription className="mt-1 font-medium text-sm">
                Join Zaprill and accelerate your career
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Referral banner */}
              {referralCode && (
                <div className="flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm dark:border-emerald-800 dark:bg-emerald-950/30">
                  <Gift size={14} className="shrink-0 text-emerald-600" />
                  <span className="font-medium text-emerald-700 dark:text-emerald-300">
                    {referralDiscount
                      ? `You were referred! Get ${referralDiscount}% off your first subscription.`
                      : `Referral code applied: ${referralCode}`}
                  </span>
                </div>
              )}
              {error && (
                <div className="rounded-md border border-destructive/20 bg-destructive/10 p-3 font-medium text-destructive text-sm">
                  {error}
                </div>
              )}

              <InAppBrowserWarning />

              <GoogleSignInButton
                onClick={handleGoogleLogin}
                disabled={loading}
                loading={googleLoading}
                showInAppBlocker={googleInAppBlocked}
                appName={appName}
                label="Sign up with Google"
              />

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-border border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 font-bold text-muted-foreground tracking-wider">
                    Or register with email
                  </span>
                </div>
              </div>

              <form onSubmit={handleCredentialsSignUp} className="space-y-4">
                <div className="space-y-2">
                  <label
                    htmlFor="sign-up-name"
                    className="font-bold text-muted-foreground text-xs uppercase tracking-wider"
                  >
                    Name
                  </label>
                  <Input
                    id="sign-up-name"
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={loading || googleLoading}
                    required
                    className="h-11 bg-background font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="sign-up-email"
                    className="font-bold text-muted-foreground text-xs uppercase tracking-wider"
                  >
                    Email
                  </label>
                  <Input
                    id="sign-up-email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading || googleLoading}
                    required
                    className="h-11 bg-background font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="sign-up-password"
                    className="font-bold text-muted-foreground text-xs uppercase tracking-wider"
                  >
                    Password (min 8 chars)
                  </label>
                  <PasswordInput
                    id="sign-up-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading || googleLoading}
                    required
                    minLength={8}
                    className="h-11 bg-background font-medium"
                  />
                </div>
                <Button
                  type="submit"
                  className="h-11 w-full font-bold"
                  disabled={loading || googleLoading}
                >
                  {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      Sign Up
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex flex-col border-border border-t bg-muted/20 pt-6 pb-6">
              <p className="text-center font-medium text-muted-foreground text-sm">
                Already have an account?{" "}
                <Link
                  href="/sign-in"
                  className="font-bold text-foreground hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <SignUpForm />
    </Suspense>
  );
}
