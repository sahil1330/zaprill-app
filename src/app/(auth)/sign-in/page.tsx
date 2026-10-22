"use client";

import { ArrowRight, BriefcaseIcon, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useDispatch } from "react-redux";
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
import { signIn } from "@/lib/auth-client";
import { login } from "@/store/authSlice";

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dispatch = useDispatch();
  const { isInApp, appName } = useInAppBrowser();
  const [googleInAppBlocked, setGoogleInAppBlocked] = useState(false);

  const handleCredentialsSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error } = await signIn.email({
      email,
      password,
      rememberMe: true,
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

        <Card
          className="w-full border-border shadow-lg"
          data-testid="auth-card"
        >
          <CardHeader className="pb-6 text-center">
            <CardTitle className="font-black text-2xl tracking-tight">
              Welcome back
            </CardTitle>
            <CardDescription className="mt-1 font-medium text-sm">
              Sign in to your account to continue
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
            />

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-border border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 font-bold text-muted-foreground tracking-wider">
                  Or continue with
                </span>
              </div>
            </div>

            <form onSubmit={handleCredentialsSignIn} className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="sign-in-email"
                  className="font-bold text-muted-foreground text-xs uppercase tracking-wider"
                >
                  Email
                </label>
                <Input
                  id="sign-in-email"
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
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="sign-in-password"
                    className="font-bold text-muted-foreground text-xs uppercase tracking-wider"
                  >
                    Password
                  </label>
                  <Link
                    href="/forgot-password"
                    className="font-bold text-foreground text-xs hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <PasswordInput
                  id="sign-in-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading || googleLoading}
                  required
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
                    Sign In
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col border-border border-t bg-muted/20 pt-6 pb-6">
            <p className="text-center font-medium text-muted-foreground text-sm">
              Don't have an account?{" "}
              <Link
                href="/sign-up"
                className="font-bold text-foreground hover:underline"
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
        <div className="flex min-h-screen items-center justify-center bg-background">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <SignInForm />
    </Suspense>
  );
}
