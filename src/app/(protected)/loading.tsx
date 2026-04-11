import { Skeleton } from "@/components/ui/skeleton";
import Navbar from "@/components/Navbar";

export default function ProtectedLoading() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground animate-in fade-in duration-500">
      <Navbar showBack={false} />
      
      <div className="max-w-7xl mx-auto px-6 py-10 w-full flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-10 items-start">
          {/* Left panel skeleton */}
          <div className="sticky top-28 rounded-xl border border-border bg-card p-6 shadow-sm">
            <Skeleton className="h-6 w-1/2 mb-6" />
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
          
          {/* Main content area skeleton */}
          <div className="flex flex-col gap-6 pt-2">
            <Skeleton className="h-8 w-1/3 mb-4" />
            
            {/* Stats skeleton */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-10">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-[120px] rounded-xl" />
              ))}
            </div>
            
            {/* Tabs skeleton */}
            <Skeleton className="h-12 w-full mb-8" />
            
            {/* List skeleton */}
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-[180px] w-full rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
