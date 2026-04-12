"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertCircle, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="w-full flex-1 min-h-[200px] flex flex-col items-center justify-center p-6 border border-destructive/20 bg-destructive/5 rounded-xl animate-in fade-in duration-300">
          <AlertCircle className="h-10 w-10 text-destructive mb-4 opacity-80" />
          <h3 className="text-lg font-bold text-foreground mb-2">
            Component Crashed
          </h3>
          <p className="text-sm text-muted-foreground text-center mb-6 max-w-sm">
            A section of this page failed to load due to an unexpected error.
            {this.state.error && (
              <span className="block mt-2 text-xs font-mono opacity-60 truncate">
                {this.state.error.message}
              </span>
            )}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={this.handleReset}
            className="font-bold border-border"
          >
            <RefreshCcw className="mr-2 h-4 w-4" /> Try section again
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
