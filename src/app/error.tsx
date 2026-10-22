"use client";

import { AlertTriangle, Home, RefreshCw } from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Optionally log the error to an error reporting service
    console.error("Root Error Boundary caught:", error);
  }, [error]);

  return (
    <div className="fade-in zoom-in-95 flex min-h-screen animate-in flex-col items-center justify-center bg-background p-6 text-foreground duration-500">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-destructive/10">
          <AlertTriangle className="h-12 w-12 text-destructive" />
        </div>

        <div className="space-y-3">
          <h1 className="font-black text-4xl tracking-tight">
            Something went wrong!
          </h1>
          <p className="font-medium text-lg text-muted-foreground leading-relaxed">
            We hit an unexpected error while preparing this page. Our servers
            might be feeling a bit overwhelmed, or there's a glitch in the
            matrix.
          </p>
        </div>

        {process.env.NODE_ENV === "development" && (
          <div className="max-h-[150px] overflow-x-auto rounded-lg border border-border bg-muted/50 p-4 text-left font-mono text-muted-foreground text-sm">
            {error.message || "Unknown Application Error"}
          </div>
        )}

        <div className="flex flex-col items-center justify-center gap-4 pt-4 sm:flex-row">
          <Button
            onClick={() => reset()}
            size="lg"
            className="h-12 w-full font-bold sm:w-auto"
          >
            <RefreshCw className="mr-2 h-5 w-5" />
            Try Again
          </Button>
          <Button
            onClick={() => {
              window.location.href = "/";
            }}
            variant="outline"
            size="lg"
            className="h-12 w-full font-bold sm:w-auto"
          >
            <Home className="mr-2 h-5 w-5" />
            Go to Homepage
          </Button>
        </div>
      </div>
    </div>
  );
}
