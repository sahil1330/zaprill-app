"use client";

import { ArrowRight, BriefcaseIcon, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { checkUserExists } from "@/app/actions/auth";
import GithubIcon from "@/components/icons/github-svg";
import GoogleIcon from "@/components/icons/google-svg";
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
import { signIn, signUp } from "@/lib/auth-client";

function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [githubLoading, setGithubLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

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

  const handleOAuthLogin = async (provider: "google" | "github") => {
    try {
      if (provider === "google") {
        setGoogleLoading(true);
      } else if (provider === "github") {
        setGithubLoading(true);
      }
      setError(null);

      const { data, error } = await signIn.social({
        provider,
        callbackURL: callbackUrl,
      });

      if (error) {
        setError(
          error.message ||
            "Failed to sign in with " +
              provider.charAt(0).toUpperCase() +
              provider.slice(1),
        );
      }
    } catch (error) {
      console.log(error);
      setError(
        "Failed to sign in with " +
          provider.charAt(0).toUpperCase() +
          provider.slice(1),
      );
    } finally {
      setGoogleLoading(false);
      setGithubLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-grid-black/[0.02] dark:bg-grid-white/[0.02]" />

      <div className="w-full max-w-sm relative z-10 flex flex-col items-center">
        <Link href="/" className="flex items-center gap-2 mb-8 group">
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
          <Card className="w-full shadow-lg border-border">
            <CardHeader className="text-center pb-6">
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <CardTitle className="text-2xl font-black tracking-tight">
                Check your email
              </CardTitle>
              <CardDescription className="text-sm font-medium mt-2">
                We sent a verification link to{" "}
                <span className="font-bold text-foreground">{email}</span>.
                Click the link to activate your account.
              </CardDescription>
            </CardHeader>
            <CardFooter className="flex flex-col border-t border-border pt-6 pb-6 bg-muted/20">
              <Button
                variant="outline"
                className="w-full font-bold h-11"
                onClick={() => router.push("/sign-in")}
              >
                Return to sign in
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <Card className="w-full shadow-lg border-border">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl font-black tracking-tight">
                Create an account
              </CardTitle>
              <CardDescription className="text-sm font-medium mt-1">
                Join Zaprill and accelerate your career
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <div className="p-3 text-sm font-medium text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                  {error}
                </div>
              )}

              <Button
                variant="outline"
                className="w-full font-bold h-11"
                onClick={() => handleOAuthLogin("github")}
                disabled={loading || githubLoading}
              >
                {githubLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <GithubIcon />
                )}
                Sign up with GitHub
              </Button>

              <Button
                variant="outline"
                className="w-full font-bold h-11"
                onClick={() => handleOAuthLogin("google")}
                disabled={loading || googleLoading}
              >
                {googleLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <GoogleIcon />
                )}
                Sign up with Google
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground font-bold tracking-wider">
                    Or register with email
                  </span>
                </div>
              </div>

              <form onSubmit={handleCredentialsSignUp} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Name
                  </label>
                  <Input
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={loading || githubLoading}
                    required
                    className="h-11 font-medium bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Email
                  </label>
                  <Input
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading || githubLoading}
                    required
                    className="h-11 font-medium bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Password (min 8 chars)
                  </label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading || githubLoading}
                    required
                    minLength={8}
                    className="h-11 font-medium bg-background"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full font-bold h-11"
                  disabled={loading || githubLoading}
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
            <CardFooter className="flex flex-col border-t border-border pt-6 pb-6 bg-muted/20">
              <p className="text-sm text-center text-muted-foreground font-medium">
                Already have an account?{" "}
                <Link
                  href="/sign-in"
                  className="text-foreground font-bold hover:underline"
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
        <div className="min-h-screen flex items-center justify-center bg-background">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <SignUpForm />
    </Suspense>
  );
}
