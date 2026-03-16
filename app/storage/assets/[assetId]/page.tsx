import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import {
  ArrowLeft,
  Clock3,
  Link2,
  Package2,
  ShieldCheck,
  UserRound,
  Warehouse,
} from "lucide-react"

import { AssetStatusBadge } from "@/components/demo/asset-status-badge"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  getAssetById,
  getAssetHistory,
  getAssignedAssetCount,
  getEmployeeById,
} from "@/lib/mock-data"

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

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-dashed pb-3 text-sm last:border-b-0 last:pb-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  )
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

  return (
    <div className="min-h-svh bg-background">
      <main className="container space-y-6 px-4 py-8">
        <div className="flex flex-col gap-4 rounded-[32px] bg-muted/35 p-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">Internal Asset Detail</Badge>
            <AssetStatusBadge status={asset.status} />
            <Badge variant="outline" className={conditionClasses[asset.condition]}>
              {asset.condition}
            </Badge>
          </div>

          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10">
                  <Package2 className="h-7 w-7 text-amber-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">{asset.name}</h1>
                  <p className="text-sm text-muted-foreground">
                    {asset.id} | {asset.serialNumber}
                  </p>
                </div>
              </div>
              <p className="max-w-3xl text-sm text-muted-foreground">{asset.description}</p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button asChild variant="outline" className="rounded-xl">
                <Link href="/?view=storage">
                  <ArrowLeft className="h-4 w-4" />
                  Back to storage
                </Link>
              </Button>
              <Button asChild className="rounded-xl">
                <Link href={`/employee/assets/${asset.id}`}>
                  <Link2 className="h-4 w-4" />
                  Open employee page
                </Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="rounded-3xl border-0 shadow-sm">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Purchase Cost</p>
              <p className="mt-2 text-3xl font-semibold tracking-tight">
                {currencyFormatter.format(asset.purchaseCost)}
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-0 shadow-sm">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Book Value</p>
              <p className="mt-2 text-3xl font-semibold tracking-tight">
                {currencyFormatter.format(asset.currentBookValue)}
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-0 shadow-sm">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Current Holder</p>
              <p className="mt-2 text-2xl font-semibold tracking-tight">
                {owner?.name ?? "In storage"}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                {owner ? owner.department : asset.location}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 xl:grid-cols-[1.05fr,0.95fr]">
          <div className="space-y-4">
            <Card className="rounded-[28px] border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Asset image</CardTitle>
                <CardDescription>Placeholder area for the asset photo.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-hidden rounded-[24px] border border-dashed bg-muted/30">
                  <div className="relative aspect-[4/3]">
                    <Image
                      src="/placeholder.jpg"
                      alt={`Placeholder image for ${asset.name}`}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-zinc-950/30" />
                    <div className="absolute right-4 bottom-4 rounded-full bg-background/90 px-3 py-1 text-xs font-medium shadow-sm">
                      Placeholder asset photo
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[28px] border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Asset profile</CardTitle>
                <CardDescription>
                  Full operational details for relevant internal roles.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <InfoRow label="Asset tag" value={asset.id} />
                <InfoRow label="Category" value={asset.category} />
                <InfoRow label="Serial number" value={asset.serialNumber} />
                <InfoRow label="Purchase date" value={asset.purchaseDate} />
                <InfoRow label="Current location" value={asset.location} />
                <InfoRow label="Condition" value={asset.condition} />
                <InfoRow
                  label="Last verification"
                  value={
                    asset.verifiedAt
                      ? new Date(asset.verifiedAt).toLocaleDateString()
                      : "Not verified in the active census"
                  }
                />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card className="rounded-[28px] border-0 shadow-sm">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-500/10">
                    <UserRound className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle>Ownership</CardTitle>
                    <CardDescription>Current holder and responsible department.</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <InfoRow label="Assigned to" value={owner?.name ?? "Unassigned"} />
                <InfoRow label="Department" value={owner?.department ?? "Storage"} />
                <InfoRow label="Title" value={owner?.title ?? "Warehouse staging"} />
                <InfoRow
                  label="Assigned assets"
                  value={owner ? String(getAssignedAssetCount(owner.id)) : "0"}
                />
              </CardContent>
            </Card>

            <Card className="rounded-[28px] border-0 shadow-sm">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/10">
                    <Warehouse className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <CardTitle>Access and visibility</CardTitle>
                    <CardDescription>What the QR route exposes versus the internal view.</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link
                  href={`/employee/assets/${asset.id}`}
                  className="block rounded-2xl border border-dashed bg-muted/30 p-4 text-sm transition-colors hover:border-primary/40 hover:bg-muted/50"
                >
                  <p className="font-medium">Employee QR page</p>
                  <p className="mt-1 text-muted-foreground">
                    Click to open the limited employee-facing page that the QR sticker resolves to.
                  </p>
                </Link>
                <div className="rounded-2xl border border-dashed bg-muted/30 p-4 text-sm">
                  <p className="font-medium">Internal asset record (this page)</p>
                  <p className="mt-1 text-muted-foreground">
                    This is the internal operations view for finance, HR, and admins. It combines asset details,
                    ownership context, and the full history timeline in one place.
                  </p>
                </div>
                <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-500/10 p-4 text-sm text-amber-900">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
                  <p>Access to this screen is intended for relevant internal roles only.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Card className="rounded-[28px] border-0 shadow-sm">
          <details open className="group">
            <summary className="list-none cursor-pointer">
              <CardHeader>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-500/10">
                      <Clock3 className="h-5 w-5 text-violet-600" />
                    </div>
                    <div>
                      <CardTitle>Asset history</CardTitle>
                      <CardDescription>
                        Full lifecycle timeline for this asset, including ownership and condition changes.
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant="outline" className="group-open:hidden">
                    Expand
                  </Badge>
                  <Badge variant="secondary" className="hidden group-open:inline-flex">
                    Collapse
                  </Badge>
                </div>
              </CardHeader>
            </summary>
            <CardContent>
              <div className="relative pl-8">
                <div className="absolute top-2 bottom-2 left-[11px] w-px bg-border" />
                <div className="space-y-5">
                  {historyEvents.map((event) => (
                    <div key={event.id} className="relative">
                      <div className="absolute top-6 -left-[26px] flex h-6 w-6 items-center justify-center rounded-full border-4 border-background bg-violet-500 shadow-sm" />
                      <div className="rounded-2xl border bg-background p-4 shadow-sm">
                        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                          <div className="space-y-1">
                            <p className="text-sm font-semibold">{event.title}</p>
                            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                              {new Date(event.date).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge variant="outline" className={conditionClasses[event.condition]}>
                            Condition: {event.condition}
                          </Badge>
                        </div>

                        <p className="mt-3 text-sm text-muted-foreground">{event.description}</p>

                        <div className="mt-4 grid gap-3 text-sm md:grid-cols-2">
                          <div className="rounded-xl bg-muted/40 px-3 py-3">
                            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                              Owner
                            </p>
                            <p className="mt-1 font-medium">{event.ownerLabel}</p>
                          </div>
                          <div className="rounded-xl bg-muted/40 px-3 py-3">
                            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                              Location
                            </p>
                            <p className="mt-1 font-medium">{event.location}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </details>
        </Card>
      </main>
    </div>
  )
}
