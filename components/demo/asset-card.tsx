"use client"

import { Laptop, Monitor, Smartphone, Tablet, Package, MapPin, User } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { Asset } from "@/lib/mock-data"
import { getEmployeeById } from "@/lib/mock-data"

interface AssetCardProps {
  asset: Asset
  showEmployee?: boolean
  showStatus?: boolean
  className?: string
  children?: React.ReactNode
}

const categoryIcons = {
  Laptop: Laptop,
  Monitor: Monitor,
  Phone: Smartphone,
  Tablet: Tablet,
  Other: Package,
}

const conditionColors = {
  Good: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  Fair: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  Damaged: "bg-red-500/10 text-red-600 border-red-500/20",
}

export function AssetCard({
  asset,
  showEmployee = true,
  showStatus = true,
  className,
  children,
}: AssetCardProps) {
  const Icon = categoryIcons[asset.category]
  const employee = getEmployeeById(asset.assignedTo)

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
              <Icon className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold">
                {asset.name}
              </CardTitle>
              <p className="text-sm text-muted-foreground font-mono">
                {asset.id}
              </p>
            </div>
          </div>
          {showStatus && (
            <div className="flex flex-col items-end gap-1">
              {asset.verified ? (
                <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                  Verified
                </Badge>
              ) : (
                <Badge variant="outline" className="text-muted-foreground">
                  Pending
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">{asset.category}</Badge>
          <Badge variant="outline" className={conditionColors[asset.condition]}>
            {asset.condition}
          </Badge>
        </div>
        
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4 shrink-0" />
            <span>{asset.location}</span>
          </div>
          {showEmployee && employee && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <User className="h-4 w-4 shrink-0" />
              <span>{employee.name}</span>
            </div>
          )}
        </div>

        {asset.verifiedAt && (
          <p className="text-xs text-muted-foreground">
            Verified on {new Date(asset.verifiedAt).toLocaleDateString()}
          </p>
        )}

        {children}
      </CardContent>
    </Card>
  )
}
