import { Skeleton } from "@/components/ui/skeleton"

export function TableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }, (_, index) => (
        <Skeleton key={index} className="h-10 w-full rounded-[10px]" />
      ))}
    </div>
  )
}

export function KpiSkeleton() {
  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <Skeleton className="h-[92px] w-full rounded-[10px]" />
        <Skeleton className="h-[92px] w-full rounded-[10px]" />
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-[72px] w-full rounded-[10px]" />
        ))}
      </div>
    </div>
  )
}
