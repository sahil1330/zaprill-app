import { Skeleton } from "@/components/ui/skeleton";

export default function ProtectedLoading() {
  return (
    <div className="fade-in mx-auto w-full max-w-7xl animate-in px-6 py-6 duration-500">
      <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[380px_1fr]">
        {/* Left panel skeleton */}
        <div className="sticky top-28 rounded-xl border border-border bg-card p-6 shadow-sm">
          <Skeleton className="mb-6 h-6 w-1/2" />
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>

        {/* Main content area skeleton */}
        <div className="flex flex-col gap-6 pt-2">
          <Skeleton className="mb-4 h-8 w-1/3" />

          {/* Stats skeleton */}
          <div className="mb-10 grid grid-cols-2 gap-5 md:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-[120px] rounded-xl" />
            ))}
          </div>

          {/* Tabs skeleton */}
          <Skeleton className="mb-8 h-12 w-full" />

          {/* List skeleton */}
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-[180px] w-full rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
