import { cn } from "@/lib/utils";

export function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-warm-gray-dark/20", className)}
      {...props}
    />
  );
}

/**
 * ExperienceCardSkeleton — matches ExperienceCard layout.
 */
export function ExperienceCardSkeleton() {
  return (
    <div className="rounded-2xl bg-white border border-warm-gray-dark/30 shadow-card overflow-hidden">
      <div className="aspect-4/3 bg-warm-gray animate-pulse" />
      <div className="p-5 space-y-3">
        <Skeleton className="h-5 w-20 rounded-full" />
        <Skeleton className="h-6 w-3/4" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
        <div className="flex items-center justify-between pt-2">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-5 w-16" />
        </div>
      </div>
    </div>
  );
}

/**
 * ExperienceDetailSkeleton — matches experience detail hero + content.
 */
export function ExperienceDetailSkeleton() {
  return (
    <div className="space-y-8">
      <div className="w-full aspect-[16/9] md:aspect-[21/9] bg-warm-gray animate-pulse" />
      <div className="container-shell grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <Skeleton className="h-8 w-2/3" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
        <div className="space-y-4">
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-12 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

/**
 * TableSkeleton — matches admin table layout.
 */
export function TableSkeleton({ rows = 5, cols = 4 }) {
  return (
    <div className="space-y-3">
      <div className="flex gap-4 pb-2 border-b border-warm-gray">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-4 py-2">
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={c} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

/**
 * PublicationSkeleton — matches publication page layout.
 */
export function PublicationSkeleton() {
  return (
    <div className="space-y-8">
      <div className="w-full aspect-[16/9] bg-warm-gray animate-pulse" />
      <div className="container-shell max-w-3xl space-y-6">
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-5 w-1/2" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    </div>
  );
}
