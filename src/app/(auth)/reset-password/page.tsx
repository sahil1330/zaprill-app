"use client";

import { useState, Suspense } from "react";
import { ArrowRight, KeyRound, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PasswordInput } from "@/components/ui/password-input";
import { resetPassword } from "@/lib/auth-client";

function ResetPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      setLoading(false);
      return;
    }

    const { error } = await resetPassword({
      newPassword: password,
    });

    if (error) {
      setError(error.message || "Failed to reset password. The link might be invalid or expired.");
    } else {
      setSuccess(true);
      // Optional: redirect to sign-in after a few seconds
      setTimeout(() => {
        router.push("/sign-in");
      }, 3000);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-black/[0.02] dark:bg-grid-white/[0.02]" />

      <div className="w-full max-w-sm relative z-10 flex flex-col items-center">
        <Link href="/" className="flex items-center gap-2 mb-8 group">
          <span className="font-bold tracking-tight text-2xl">Zaprill</span>
        </Link>

        <Card className="w-full shadow-lg border-border">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto w-12 h-12 bg-primary/10 flex items-center justify-center rounded-full mb-4">
              <KeyRound className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl font-black tracking-tight">
              Reset password
            </CardTitle>
            <CardDescription className="text-sm font-medium mt-1">
              Enter your new password below.
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
                Your password has been reset successfully! Redirecting to login...
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    New Password
                  </label>
                  <PasswordInput
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    required
                    className="h-11 font-medium bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Confirm Password
                  </label>
                  <PasswordInput
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={loading}
                    required
                    className="h-11 font-medium bg-background"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full font-bold h-11"
                  disabled={loading || !password || !confirmPassword}
                >
                  {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      Reset Password
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
