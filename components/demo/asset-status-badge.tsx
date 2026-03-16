import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { assetStatusLabels, type AssetStatus } from "@/lib/mock-data"

const statusClasses: Record<AssetStatus, string> = {
  AVAILABLE: "border-emerald-200 bg-emerald-500/10 text-emerald-700",
  ASSIGNED: "border-blue-200 bg-blue-500/10 text-blue-700",
  IN_REPAIR: "border-amber-200 bg-amber-500/10 text-amber-700",
  PENDING_DISPOSAL: "border-rose-200 bg-rose-500/10 text-rose-700",
}

export function AssetStatusBadge({
  status,
  className,
}: {
  status: AssetStatus
  className?: string
}) {
  return (
    <Badge
      variant="outline"
      className={cn("rounded-full px-2.5 py-1 font-medium", statusClasses[status], className)}
    >
      {assetStatusLabels[status]}
    </Badge>
  )
}
