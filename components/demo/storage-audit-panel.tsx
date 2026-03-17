"use client"

import { useState } from "react"
import { Calendar, CalendarDays, Clock3, MapPin, UserRound } from "lucide-react"

import { AssetStatusBadge } from "@/components/demo/asset-status-badge"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Asset, AssetHistoryEvent, Employee } from "@/lib/mock-data"

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
})

const conditionClasses = {
  Good: "border-emerald-200 bg-emerald-500/10 text-emerald-700",
  Fair: "border-amber-200 bg-amber-500/10 text-amber-700",
  Damaged: "border-rose-200 bg-rose-500/10 text-rose-700",
} as const

export function StorageAuditPanel({
  asset,
  owner,
  requestId,
  requestDate,
  auditTimestamp,
  historyEvents,
}: {
  asset: Asset
  owner: Employee | null
  requestId: string
  requestDate: string
  auditTimestamp: string
  historyEvents: AssetHistoryEvent[]
}) {
  const [hasDiscrepancy, setHasDiscrepancy] = useState<"no" | "yes">("no")

  return (
    <Card className="min-w-0 rounded-[20px] border shadow-none">
      <CardHeader className="border-b pb-4">
        <CardTitle className="text-base">Audit Item</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 pt-5">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
              Request ID
            </p>
            <div className="flex items-center justify-between rounded-xl border bg-muted/15 px-4 py-3 text-sm">
              <span className="font-medium">{requestId}</span>
              <Badge variant="outline">Open</Badge>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
              Request Date
            </p>
            <div className="flex items-center justify-between rounded-xl border bg-muted/15 px-4 py-3 text-sm">
              <span className="font-medium">{requestDate}</span>
              <CalendarDays className="h-4 w-4 text-emerald-500" />
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
              Condition
            </p>
            <div className="space-y-2 rounded-xl border bg-background p-3">
              <Badge variant="outline" className={conditionClasses[asset.condition]}>
                {asset.condition}
              </Badge>
              <Select defaultValue={asset.condition}>
                <SelectTrigger className="h-11 w-full rounded-xl">
                  <SelectValue placeholder="Condition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Good">Good</SelectItem>
                  <SelectItem value="Fair">Fair</SelectItem>
                  <SelectItem value="Damaged">Damaged</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
              Status
            </p>
            <div className="space-y-2 rounded-xl border bg-background p-3">
              <AssetStatusBadge status={asset.status} />
              <Select defaultValue={asset.status}>
                <SelectTrigger className="h-11 w-full rounded-xl">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AVAILABLE">Available</SelectItem>
                  <SelectItem value="ASSIGNED">Assigned</SelectItem>
                  <SelectItem value="IN_REPAIR">In Repair</SelectItem>
                  <SelectItem value="PENDING_DISPOSAL">Pending Disposal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
              Assigned Auditor
            </p>
            <div className="flex items-center justify-between rounded-xl border bg-muted/15 px-4 py-3 text-sm">
              <div className="flex items-center gap-2">
                <UserRound className="h-4 w-4 text-blue-600" />
                <span className="font-medium">{owner?.name ?? "Storage Team"}</span>
              </div>
              <span className="text-muted-foreground">{owner?.title ?? "Storage Auditor"}</span>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
              Audit Timestamp
            </p>
            <div className="flex items-center justify-between rounded-xl border bg-muted/15 px-4 py-3 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-emerald-500" />
                <span className="font-medium">{auditTimestamp}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Confirmed Location
          </p>
          <div className="flex items-center justify-between rounded-xl border bg-background px-4 py-3 text-sm">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-emerald-600" />
              <span className="font-medium">{asset.location}</span>
            </div>
            <Badge variant="outline">Confirmed</Badge>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border bg-muted/15 p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
              Holder
            </p>
            <p className="mt-2 font-medium">{owner?.name ?? "In storage"}</p>
            <p className="text-sm text-muted-foreground">
              {owner?.department ?? "Storage"}
            </p>
          </div>
          <div className="rounded-2xl border bg-muted/15 p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
              Value
            </p>
            <p className="mt-2 font-medium">
              {currencyFormatter.format(asset.purchaseCost)}
            </p>
            <p className="text-sm text-muted-foreground">
              Book value {currencyFormatter.format(asset.currentBookValue)}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Was There Discrepancy?
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={hasDiscrepancy === "no" ? "default" : "outline"}
              className="rounded-full px-5"
              onClick={() => setHasDiscrepancy("no")}
            >
              No
            </Button>
            <Button
              variant={hasDiscrepancy === "yes" ? "default" : "outline"}
              className="rounded-full px-5"
              onClick={() => setHasDiscrepancy("yes")}
            >
              Yes
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Audit Result
          </p>
          <div className="min-h-28 rounded-xl border bg-background p-4 text-sm text-muted-foreground">
            Asset verified in storage. Tag matches the internal record, current status is valid, and the item is physically present at the confirmed location.
          </div>
        </div>

        {hasDiscrepancy === "yes" ? (
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
              Discrepancy Reason
            </p>
            <div className="min-h-24 rounded-xl border bg-background p-4 text-sm text-muted-foreground">
              Record the mismatch here, such as wrong holder, missing device, broken screen, or location mismatch.
            </div>
          </div>
        ) : null}

        <details className="group border-t pt-4" open>
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Clock3 className="h-4 w-4 text-violet-600" />
              <p className="font-medium">History</p>
            </div>
            <Badge variant="outline" className="group-open:hidden">
              Expand
            </Badge>
            <Badge variant="secondary" className="hidden group-open:inline-flex">
              Collapse
            </Badge>
          </summary>
          <div className="mt-3 space-y-3">
            {historyEvents.map((event) => (
              <div key={event.id} className="rounded-2xl border bg-background p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="font-medium">{event.title}</p>
                    <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                      {new Date(event.date).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant="outline" className={conditionClasses[event.condition]}>
                    {event.condition}
                  </Badge>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">{event.description}</p>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <div className="rounded-xl bg-muted/30 px-3 py-3 text-sm">
                    <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                      Owner
                    </p>
                    <p className="mt-1 font-medium">{event.ownerLabel}</p>
                  </div>
                  <div className="rounded-xl bg-muted/30 px-3 py-3 text-sm">
                    <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                      Location
                    </p>
                    <p className="mt-1 font-medium">{event.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </details>
      </CardContent>
    </Card>
  )
}
