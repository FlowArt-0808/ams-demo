import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { assetStatusLabels, type AssetStatus } from "@/lib/mock-data"

type DisplayAssetStatus = AssetStatus | "MISSING" | "BROKEN"

const statusClasses: Record<DisplayAssetStatus, string> = {
  AVAILABLE: "border-emerald-200 bg-emerald-500/10 text-emerald-700",
  ASSIGNED: "border-blue-200 bg-blue-500/10 text-blue-700",
  IN_REPAIR: "border-amber-200 bg-amber-500/10 text-amber-700",
  PENDING_DISPOSAL: "border-rose-200 bg-rose-500/10 text-rose-700",
  MISSING: "border-orange-200 bg-orange-500/10 text-orange-700",
  BROKEN: "border-zinc-300 bg-zinc-500/10 text-zinc-700",
}

const extendedStatusLabels: Record<DisplayAssetStatus, string> = {
  ...assetStatusLabels,
  MISSING: "Missing",
  BROKEN: "Broken",
}

export function AssetStatusBadge({
  status,
  className,
}: {
  status: DisplayAssetStatus
  className?: string
}) {
  return (
    <Badge
      variant="outline"
      className={cn("rounded-full px-2.5 py-1 font-medium", statusClasses[status], className)}
    >
      {extendedStatusLabels[status]}
    </Badge>
  )
}
