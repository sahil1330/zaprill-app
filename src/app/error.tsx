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
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background text-foreground animate-in fade-in zoom-in-95 duration-500">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="mx-auto w-24 h-24 bg-destructive/10 rounded-full flex items-center justify-center mb-6">
          <AlertTriangle className="h-12 w-12 text-destructive" />
        </div>

        <div className="space-y-3">
          <h1 className="text-4xl font-black tracking-tight">
            Something went wrong!
          </h1>
          <p className="text-muted-foreground font-medium text-lg leading-relaxed">
            We hit an unexpected error while preparing this page. Our servers
            might be feeling a bit overwhelmed, or there's a glitch in the
            matrix.
          </p>
        </div>

        {process.env.NODE_ENV === "development" && (
          <div className="bg-muted/50 border border-border p-4 rounded-lg text-left text-sm font-mono text-muted-foreground overflow-x-auto max-h-[150px]">
            {error.message || "Unknown Application Error"}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Button
            onClick={() => reset()}
            size="lg"
            className="w-full sm:w-auto font-bold h-12"
          >
            <RefreshCw className="mr-2 h-5 w-5" />
            Try Again
          </Button>
          <Button
            onClick={() => (window.location.href = "/")}
            variant="outline"
            size="lg"
            className="w-full sm:w-auto font-bold h-12"
          >
            <Home className="mr-2 h-5 w-5" />
            Go to Homepage
          </Button>
        </div>
      </div>
    </div>
  );
}
