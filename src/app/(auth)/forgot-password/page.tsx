"use client";

import { ArrowLeft, ArrowRight, Loader2, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
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
import { authClient } from "@/lib/auth-client";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await authClient.emailOtp.sendVerificationOtp({
      email,
      type: "forget-password",
    });

    if (error) {
      setError(error.message || "Failed to send OTP code");
      setLoading(false);
    } else {
      router.push(`/reset-password?email=${encodeURIComponent(email)}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-black/[0.02] dark:bg-grid-white/[0.02]" />

      <div className="w-full max-w-sm relative z-10 flex flex-col items-center">
        <Link
          href="/sign-in"
          className="flex items-center gap-2 mb-8 group text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to login
        </Link>

        <Card className="w-full shadow-lg border-border">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto w-12 h-12 bg-primary/10 flex items-center justify-center rounded-full mb-4">
              <Mail className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl font-black tracking-tight">
              Forgot password?
            </CardTitle>
            <CardDescription className="text-sm font-medium mt-1">
              No worries, we'll send you reset instructions.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 text-sm font-medium text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                {error}
              </div>
            )}

            {success ? (
              <div className="p-4 text-sm font-medium text-green-600 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 rounded-md text-center">
                We've sent a password reset link to{" "}
                <span className="font-bold">{email}</span>. Please check your
                inbox.
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Email
                  </label>
                  <Input
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    required
                    className="h-11 font-medium bg-background"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full font-bold h-11"
                  disabled={loading || !email}
                >
                  {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    "Reset password"
                  )}
                </Button>
              </form>
            )}
          </CardContent>
          <CardFooter className="flex flex-col border-t border-border pt-6 pb-6 bg-muted/20">
            <p className="text-sm text-center text-muted-foreground font-medium">
              Remember your password?{" "}
              <Link
                href="/sign-in"
                className="text-foreground font-bold hover:underline"
              >
                Log in
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
