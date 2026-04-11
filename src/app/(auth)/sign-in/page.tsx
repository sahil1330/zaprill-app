"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { BriefcaseIcon, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useDispatch } from "react-redux";
import { login } from "@/store/authSlice";
import GoogleIcon from "@/components/icons/google-svg";
import GithubIcon from "@/components/icons/github-svg";

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [githubLoading, setGithubLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dispatch = useDispatch();

  const handleCredentialsSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error } = await signIn.email({
      email,
      password,
      callbackURL: callbackUrl,
    });

    if (data?.user) dispatch(login(data.user));
    if (error) {
      setError(error.message || "Failed to sign in");
      setLoading(false);
    } else {
      router.push(callbackUrl);
    }
  };

  const handleGithubSignIn = async () => {
    setGithubLoading(true);
    setError(null);
    const { data, error } = await signIn.social({
      provider: "github",
      callbackURL: callbackUrl,
    });

    if (error) {
      setError(error.message || "Failed to sign in with GitHub");
      setGithubLoading(false);
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
          <div className="w-8 h-8 rounded bg-foreground flex items-center justify-center transition-transform group-hover:scale-105">
            <BriefcaseIcon className="h-4 w-4 text-background" />
          </div>
          <span className="font-bold text-xl tracking-tight text-foreground">
            AI Job God
          </span>
        </Link>

        <Card className="w-full shadow-lg border-border">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl font-black tracking-tight">
              Welcome back
            </CardTitle>
            <CardDescription className="text-sm font-medium mt-1">
              Sign in to your account to continue
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
              Sign in with GitHub
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
              Sign in with Google
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground font-bold tracking-wider">
                  Or continue with
                </span>
              </div>
            </div>

            <form onSubmit={handleCredentialsSignIn} className="space-y-4">
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
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Password
                  </label>
                  <Link
                    href="#"
                    className="text-xs font-bold text-foreground hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading || githubLoading}
                  required
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
                    Sign In
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col border-t border-border pt-6 pb-6 bg-muted/20">
            <p className="text-sm text-center text-muted-foreground font-medium">
              Don't have an account?{" "}
              <Link
                href="/sign-up"
                className="text-foreground font-bold hover:underline"
              >
                Sign up
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <SignInForm />
    </Suspense>
  );
}
