import { Skeleton } from "@/components/ui/skeleton";

export default function HQLoading() {
  return (
    <div className="flex flex-col gap-8">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-9 w-40" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-28 rounded-full" />
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {["s1", "s2", "s3", "s4"].map((slot) => (
          <div
            key={slot}
            className="flex flex-col gap-3 rounded-xl border bg-card p-6"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-4 rounded" />
            </div>
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-3 w-36" />
          </div>
        ))}
      </div>

      {/* Chart + activity */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4 space-y-4 rounded-xl border bg-card p-6">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-56" />
          <Skeleton className="h-[220px] w-full rounded-lg" />
        </div>
        <div className="col-span-3 space-y-4 rounded-xl border bg-card p-6">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-52" />
          <div className="space-y-6 pt-2">
            {["s1", "s2", "s3", "s4", "s5"].map((slot) => (
              <div key={slot} className="flex items-center gap-4">
                <Skeleton className="h-9 w-9 rounded-full" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
