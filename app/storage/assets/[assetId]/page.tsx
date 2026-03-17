import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import {
  ArrowLeft,
  CheckCircle2,
} from "lucide-react"

import { StorageAuditPanel } from "@/components/demo/storage-audit-panel"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  getAssetById,
  getAssetHistory,
  getAssignedAssetCount,
  getEmployeeById,
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

export default async function StorageAssetDetailPage({
  params,
}: {
  params: Promise<{ assetId: string }>
}) {
  const { assetId } = await params
  const asset = getAssetById(assetId)

  if (!asset) {
    notFound()
  }

  const owner = getEmployeeById(asset.assignedTo)
  const historyEvents = getAssetHistory(asset.id)
  const assetGroup =
    asset.category === "Laptop" ||
    asset.category === "Monitor" ||
    asset.category === "Phone" ||
    asset.category === "Tablet" ||
    asset.category === "Other"
      ? "IT Equipment"
      : "Other"
  const requestId = `REQ-${asset.id.replace(/[A-Z]+-/g, "")}`
  const requestDate = new Date(asset.purchaseDate).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })
  const auditTimestamp = new Date().toLocaleString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })

  return (
    <div className="min-h-svh bg-background">
      <main className="container space-y-6 px-4 py-8">
        <div className="border-b pb-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-3xl font-semibold tracking-tight">Storage</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Internal asset detail workspace.
              </p>
            </div>

            <div className="flex flex-col items-start gap-3 lg:items-end">
              <div className="flex flex-wrap gap-3">
                <Button asChild variant="outline" className="rounded-xl">
                  <Link href="/?view=storage">
                    <ArrowLeft className="h-4 w-4" />
                    Back to storage
                  </Link>
                </Button>
              </div>

              <div className="inline-flex rounded-full border p-1">
                <Button className="rounded-full px-4" disabled>
                  Storage View
                </Button>
                <Button asChild variant="ghost" className="rounded-full px-4">
                  <Link href={`/employee/assets/${asset.id}`}>Employee View</Link>
                </Button>
              </div>

            </div>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[340px_minmax(0,1fr)]">
          <Card className="rounded-[20px] border shadow-none">
            <CardHeader className="border-b pb-4">
              <CardTitle className="text-base">Asset Detail</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 pt-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-700">
                  {getInitials(owner?.name ?? "Storage Team")}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{owner?.name ?? "Storage Team"}</p>
                    <Badge variant="secondary">{owner ? "Auditor" : "Storage"}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {owner?.title ?? "Storage Coordinator"}
                  </p>
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
                <InfoRow label="Department" value={owner?.department ?? "Storage"} />
                <InfoRow label="Category" value={assetGroup} />
                <InfoRow label="Type" value={asset.category} />
                <InfoRow label="QTY" value="1" />
                <InfoRow label="Location" value={asset.location} />
                <InfoRow
                  label="Condition"
                  value={asset.condition}
                />
                <InfoRow
                  label="Assigned"
                  value={owner ? String(getAssignedAssetCount(owner.id)) : "0"}
                />
              </div>

              <div className="space-y-2 border-t pt-4">
                <p className="text-sm font-medium">Notes</p>
                <div className="min-h-24 rounded-xl border bg-muted/20 p-3 text-sm text-muted-foreground">
                  {asset.description}
                </div>
              </div>

              <Button className="w-full rounded-xl">
                <CheckCircle2 className="h-4 w-4" />
                Confirm Audit
              </Button>
            </CardContent>
          </Card>

          <StorageAuditPanel
            asset={asset}
            owner={owner ?? null}
            requestId={requestId}
            requestDate={requestDate}
            auditTimestamp={auditTimestamp}
            historyEvents={historyEvents}
          />
        </div>
      </main>
    </div>
  )
}
