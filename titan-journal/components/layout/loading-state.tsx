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
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
      {Array.from({ length: 6 }, (_, index) => (
        <Skeleton key={index} className="h-[58px] w-full rounded-[10px]" />
      ))}
    </div>
  )
}
