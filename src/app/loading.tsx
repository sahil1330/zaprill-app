import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="fade-in flex w-full animate-in flex-col items-center bg-background pt-16 text-foreground duration-500">
      <div className="relative mb-6 flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl border border-border bg-muted/80 shadow-sm">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <div className="absolute inset-0 animate-pulse rounded-xl border-foreground border-t-2" />
      </div>
      <h2 className="mb-2 font-black text-2xl text-foreground tracking-tight">
        Loading...
      </h2>
      <p className="font-semibold text-muted-foreground text-sm">
        Preparing your experience
      </p>
    </div>
  );
}
