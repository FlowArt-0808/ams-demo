"use client"

import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { ArrowLeft, BellRing, CheckCircle2, Clock3, FileSignature } from "lucide-react"

import { AssetStatusBadge } from "@/components/demo/asset-status-badge"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  getAssetHistory,
  getAssetsForEmployee,
  type Asset,
  type Employee,
} from "@/lib/mock-data"

const conditionClasses = {
  Good: "border-emerald-200 bg-emerald-500/10 text-emerald-700",
  Fair: "border-amber-200 bg-amber-500/10 text-amber-700",
  Damaged: "border-rose-200 bg-rose-500/10 text-rose-700",
} as const

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b py-3 text-sm last:border-b-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  )
}

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
}

export function EmployeeAssetPage({
  asset,
  owner,
}: {
  asset: Asset
  owner: Employee | null
}) {
  const historyEvents = getAssetHistory(asset.id)
  const holderName = owner?.name ?? "In storage"
  const holderDepartment = owner?.department ?? "Storage"
  const holderContact = owner?.email ?? "Storage Team"
  const employeeAssets = owner ? getAssetsForEmployee(owner.id) : []
  const hasReturnNotification =
    asset.status === "PENDING_RETRIEVAL" || asset.status === "OVERDUE_RETRIEVAL"
  const assignedAssetSummary =
    employeeAssets.length > 0
      ? employeeAssets.map((ownedAsset) => `${ownedAsset.name} (${ownedAsset.id})`).join(", ")
      : `${asset.name} (${asset.id})`

  return (
    <div className="min-h-svh bg-background">
      <main className="container space-y-6 px-4 py-8">
        <div className="border-b pb-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-3xl font-semibold tracking-tight">Employee View</p>
              <p className="mt-2 text-sm text-muted-foreground">
                QR-safe asset detail workspace.
              </p>
            </div>

            <div className="flex flex-col items-start gap-3 lg:items-end">
              <Button asChild variant="outline" className="rounded-xl">
                <Link href="/?view=storage">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Storage
                </Link>
              </Button>

              <div className="inline-flex rounded-full border p-1">
                <Button asChild variant="ghost" className="rounded-full px-4">
                  <Link href={`/storage/assets/${asset.id}`}>Storage View</Link>
                </Button>
                <Button className="rounded-full px-4" disabled>
                  Employee View
                </Button>
              </div>

            </div>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
          <Card className="rounded-[20px] border shadow-none">
            <CardHeader className="border-b pb-4">
              <CardTitle className="text-base">Employee Asset</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 pt-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-700">
                  {getInitials(holderName)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{holderName}</p>
                    <Badge variant="secondary">Owner</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{holderDepartment}</p>
                </div>
              </div>

              <div className="overflow-hidden rounded-[16px] border bg-muted/20">
                <div className="relative aspect-[4/3]">
                  <Image
                    src="/placeholder.jpg"
                    alt={`${asset.name} asset image`}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <InfoRow label="Asset ID" value={asset.id} />
                <InfoRow label="Asset Name" value={asset.name} />
                <InfoRow label="Department" value={holderDepartment} />
                <InfoRow label="Category" value="IT Equipment" />
                <InfoRow label="Type" value={asset.category} />
                <InfoRow label="Location" value={asset.location} />
              </div>

              <div className="space-y-2 border-t pt-4">
                <p className="text-sm font-medium">Notes</p>
                <div className="min-h-24 rounded-xl border bg-muted/20 p-3 text-sm text-muted-foreground">
                  Employee-safe summary only. Internal finance and approval notes stay hidden.
                </div>
              </div>

            </CardContent>
          </Card>

          <div className="min-w-0 space-y-4">
            {hasReturnNotification ? (
              <Card
                className={
                  asset.status === "OVERDUE_RETRIEVAL"
                    ? "rounded-[20px] border-red-200 bg-red-500/5 shadow-none"
                    : "rounded-[20px] border-orange-200 bg-orange-500/5 shadow-none"
                }
              >
                <CardContent className="flex flex-col gap-4 pt-5 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-start gap-3">
                    <div
                      className={
                        asset.status === "OVERDUE_RETRIEVAL"
                          ? "flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10"
                          : "flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10"
                      }
                    >
                      <BellRing
                        className={
                          asset.status === "OVERDUE_RETRIEVAL"
                            ? "h-5 w-5 text-red-700"
                            : "h-5 w-5 text-orange-700"
                        }
                      />
                    </div>
                    <div>
                      <p
                        className={
                          asset.status === "OVERDUE_RETRIEVAL"
                            ? "text-xs font-medium uppercase tracking-[0.16em] text-red-700"
                            : "text-xs font-medium uppercase tracking-[0.16em] text-orange-700"
                        }
                      >
                        Notification
                      </p>
                      <p className="font-medium">Return your assigned asset</p>
                      <p className="text-sm text-muted-foreground">
                        {asset.status === "OVERDUE_RETRIEVAL"
                          ? `Your return is overdue. Please return these assigned assets to HR immediately: ${assignedAssetSummary}.`
                          : `Please return your assigned assets to HR: ${assignedAssetSummary}.`}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="rounded-full">
                    {asset.status === "OVERDUE_RETRIEVAL" ? "Action overdue" : "Action required"}
                  </Badge>
                </CardContent>
              </Card>
            ) : null}

            <Card className="rounded-[20px] border-blue-200 bg-blue-500/5 shadow-none">
              <CardContent className="flex flex-col gap-4 pt-5 md:flex-row md:items-center md:justify-between">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10">
                    <FileSignature className="h-5 w-5 text-blue-700" />
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.16em] text-blue-700">Step 2</p>
                    <p className="font-medium">Received this asset from a new handoff?</p>
                    <p className="text-sm text-muted-foreground">
                      After scanning the QR, the next step is asset acknowledgment so HR can record that you accepted the device.
                    </p>
                  </div>
                </div>
                <Button asChild className="rounded-xl">
                  <Link href="/employee/acknowledge">Open Asset Acknowledgment</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="rounded-[20px] border shadow-none">
              <CardHeader className="border-b pb-4">
                <CardTitle className="text-base">Asset Item</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 pt-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                    Status
                  </p>
                  <div className="rounded-xl border bg-background px-4 py-3 text-sm">
                    <AssetStatusBadge status={asset.status} />
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                    Condition
                  </p>
                  <div className="rounded-xl border bg-background px-4 py-3 text-sm">
                    <Badge variant="outline" className={conditionClasses[asset.condition]}>
                      {asset.condition}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border bg-muted/15 p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                    Current holder
                  </p>
                  <p className="mt-2 font-medium">{holderName}</p>
                  <p className="text-sm text-muted-foreground">{holderContact}</p>
                </div>
                <div className="rounded-2xl border bg-muted/15 p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                    Last verification
                  </p>
                  <p className="mt-2 font-medium">
                    {asset.verifiedAt ? new Date(asset.verifiedAt).toLocaleDateString() : "Not yet verified"}
                  </p>
                  <p className="text-sm text-muted-foreground">{asset.location}</p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                  History
                </p>
                <div className="space-y-3">
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
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2 border-t pt-4">
                <div className="flex items-center gap-2">
                  <Clock3 className="h-4 w-4 text-violet-600" />
                  <p className="font-medium">All your assigned assets</p>
                </div>
                <div className="space-y-3">
                  {employeeAssets.length > 0 ? (
                    employeeAssets.map((ownedAsset) => (
                      <div key={ownedAsset.id} className="rounded-2xl border bg-background p-4">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <p className="font-medium">{ownedAsset.name}</p>
                            <p className="text-sm text-muted-foreground">{ownedAsset.id}</p>
                          </div>
                          <AssetStatusBadge status={ownedAsset.status} />
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <Badge variant="outline">{ownedAsset.category}</Badge>
                          <Badge variant="outline" className={conditionClasses[ownedAsset.condition]}>
                            {ownedAsset.condition}
                          </Badge>
                          <Badge variant="outline">{ownedAsset.location}</Badge>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-2xl border bg-muted/20 p-4 text-sm text-muted-foreground">
                      No assets are assigned under this owner yet.
                    </div>
                  )}
                </div>
              </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
