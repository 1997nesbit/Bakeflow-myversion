import { Skeleton } from '@/components/ui/skeleton'

/**
 * Generic portal loading skeleton. Mirrors the sidebar + content layout shared
 * by every role portal. Used by each portal's loading.tsx file so the shell
 * appears instantly while the page's JS and data load.
 */
export function PortalLoadingSkeleton() {
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 shrink-0 border-r border-border p-4 flex flex-col gap-3">
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="mt-4 flex flex-col gap-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-full rounded-lg" />
          ))}
        </div>
        <div className="mt-auto flex flex-col gap-2">
          <Skeleton className="h-px w-full" />
          <Skeleton className="h-12 w-full rounded-lg" />
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 p-6 flex flex-col gap-5 overflow-hidden">
        {/* Header row */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-9 w-32 rounded-lg" />
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>

        {/* Content rows */}
        <div className="flex flex-col gap-3 flex-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  )
}
