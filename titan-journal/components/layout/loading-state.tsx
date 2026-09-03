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
  return <Skeleton className="h-[168px] w-full rounded-[10px]" />
}
