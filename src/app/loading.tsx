import { Skeleton } from "../components/feedback/Skeleton";

export default function Loading() {
  return (
    <div role="status" className="space-y-6 p-4 max-w-5xl mx-auto" aria-busy="true" aria-label="Loading application state">
      {/* Top Banner Skeleton */}
      <Skeleton className="h-14 w-full rounded-card" />

      {/* Hero Balance Skeleton */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Skeleton className="h-44 w-full rounded-card" />
        <Skeleton className="h-44 w-full rounded-card" />
      </div>

      {/* Cards Grid Skeleton */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Skeleton className="h-28 rounded-card" />
        <Skeleton className="h-28 rounded-card" />
        <Skeleton className="h-28 rounded-card" />
        <Skeleton className="h-28 rounded-card" />
      </div>

      {/* Chart Skeleton */}
      <Skeleton className="h-64 w-full rounded-card" />
    </div>
  );
}
