import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center bg-background text-foreground animate-in fade-in duration-500 w-full">
      <div className="w-16 h-16 rounded-xl bg-muted/80 border border-border flex items-center justify-center shadow-sm mb-6 relative overflow-hidden">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
        <div className="absolute inset-0 border-t-2 border-foreground rounded-xl animate-pulse" />
      </div>
      <h2 className="text-2xl font-black mb-2 text-foreground tracking-tight">
        Loading...
      </h2>
      <p className="text-sm text-muted-foreground font-semibold">
        Preparing your experience
      </p>
    </div>
  );
}
