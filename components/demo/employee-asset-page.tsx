"use client"

import { useState } from "react"
import {
  ChevronDown,
  Clock3,
  KeyRound,
  Lock,
  MapPin,
  Package2,
  ShieldCheck,
  UserRound,
} from "lucide-react"

import { AssetStatusBadge } from "@/components/demo/asset-status-badge"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Input } from "@/components/ui/input"
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

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
})

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-dashed pb-3 text-sm last:border-b-0 last:pb-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  )
}

export function EmployeeAssetPage({
  asset,
  owner,
}: {
  asset: Asset
  owner: Employee | null
}) {
  const [showAccessPanel, setShowAccessPanel] = useState(false)
  const [accessPhrase, setAccessPhrase] = useState("")
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [assignedToSelf, setAssignedToSelf] = useState(false)
  const [isHistoryOpen, setIsHistoryOpen] = useState(true)
  const [isAssetsOpen, setIsAssetsOpen] = useState(false)
  const historyEvents = getAssetHistory(asset.id)

  const holderName = assignedToSelf ? "You" : owner?.name ?? "In storage"
  const holderDepartment = assignedToSelf ? "Pending self-assignment" : owner?.department ?? "Storage"
  const holderContact = assignedToSelf ? "Awaiting internal approval" : owner?.email ?? "Asset Operations"
  const employeeAssets = assignedToSelf
    ? [asset]
    : owner
      ? getAssetsForEmployee(owner.id)
      : []

  const handleUnlock = () => {
    if (accessPhrase.trim().length > 0) {
      setIsUnlocked(true)
      setErrorMessage("")
      return
    }

    setIsUnlocked(false)
    setErrorMessage("Enter any value to unlock this demo panel.")
  }

  return (
    <div className="min-h-svh bg-background">
      <main className="container px-4 py-10">
        <div className="mx-auto max-w-4xl space-y-6">
          <div className="space-y-4 text-center">
            <Badge variant="secondary">Employee Asset Page</Badge>
            <div className="flex items-center justify-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-900 text-white">
                <Package2 className="h-7 w-7" />
              </div>
              <div className="text-left">
                <h1 className="text-3xl font-bold tracking-tight">{asset.name}</h1>
                <p className="text-sm text-muted-foreground">{asset.id}</p>
              </div>
            </div>
            <p className="mx-auto max-w-2xl text-sm text-muted-foreground">
              This employee page is safe to open from a QR sticker. It shows a limited asset summary
              for employees and operational scanners.
            </p>
          </div>

          <Card className="rounded-[32px] border-0 shadow-sm">
            <CardHeader>
              <div className="flex flex-wrap items-center gap-2">
                <AssetStatusBadge status={asset.status} />
                <Badge variant="outline" className={conditionClasses[asset.condition]}>
                  {asset.condition}
                </Badge>
                <Badge variant="outline">{asset.category}</Badge>
              </div>
              <CardTitle className="text-2xl">Limited asset details</CardTitle>
              <CardDescription>
                Financial values, audit history, and internal notes are intentionally hidden on the
                employee-facing page.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-3xl border border-dashed bg-muted/30 p-5">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-500/10">
                      <UserRound className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">Ownership</p>
                      <p className="text-sm text-muted-foreground">Current responsible person</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <InfoRow label="Holder" value={holderName} />
                    <InfoRow label="Department" value={holderDepartment} />
                    <InfoRow label="Contact" value={holderContact} />
                  </div>
                </div>

                <div className="rounded-3xl border border-dashed bg-muted/30 p-5">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/10">
                      <MapPin className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-medium">Location</p>
                      <p className="text-sm text-muted-foreground">Most recently recorded place</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <InfoRow label="Current location" value={asset.location} />
                    <InfoRow
                      label="Last verification"
                      value={
                        asset.verifiedAt
                          ? new Date(asset.verifiedAt).toLocaleDateString()
                          : "Not yet verified in active census"
                      }
                    />
                    <InfoRow label="Condition" value={asset.condition} />
                  </div>
                </div>
              </div>

              {assignedToSelf ? (
                <div className="rounded-3xl border border-sky-200 bg-sky-500/10 p-5 text-sm text-sky-900">
                  <p className="font-medium">Asset staged for you</p>
                  <p className="mt-1">
                    The employee page now treats this asset as assigned to you in the demo flow.
                  </p>
                </div>
              ) : null}

              <Collapsible
                open={isHistoryOpen}
                onOpenChange={setIsHistoryOpen}
                className="rounded-3xl border border-dashed bg-muted/20 p-5"
              >
                <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-500/10">
                      <Clock3 className="h-5 w-5 text-violet-600" />
                    </div>
                    <div>
                      <p className="font-medium">History</p>
                      <p className="text-sm text-muted-foreground">
                        Timeline of when the asset was ordered, arrived at storage, and who held it
                        before now. Condition is shown at every step.
                      </p>
                    </div>
                  </div>

                  <CollapsibleTrigger asChild>
                    <Button variant="outline" className="rounded-xl">
                      {isHistoryOpen ? "Hide history" : "Show history"}
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${
                          isHistoryOpen ? "rotate-180" : ""
                        }`}
                      />
                    </Button>
                  </CollapsibleTrigger>
                </div>

                <CollapsibleContent className="data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden">
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
                </CollapsibleContent>
              </Collapsible>

              <Collapsible
                open={isAssetsOpen}
                onOpenChange={setIsAssetsOpen}
                className="rounded-3xl border border-dashed bg-muted/20 p-5"
              >
                <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-500/10">
                      <Package2 className="h-5 w-5 text-cyan-700" />
                    </div>
                    <div>
                      <p className="font-medium">Your assets</p>
                      <p className="text-sm text-muted-foreground">
                        Open this list to see all assets currently assigned under your name.
                      </p>
                    </div>
                  </div>

                  <CollapsibleTrigger asChild>
                    <Button variant="outline" className="rounded-xl">
                      {isAssetsOpen ? "Hide your assets" : "Show your assets"}
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${
                          isAssetsOpen ? "rotate-180" : ""
                        }`}
                      />
                    </Button>
                  </CollapsibleTrigger>
                </div>

                <CollapsibleContent className="data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden">
                  {owner || assignedToSelf ? (
                    <div className="space-y-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="secondary">{employeeAssets.length} assets</Badge>
                        <Badge variant="outline">{holderName}</Badge>
                        <Badge variant="outline">{holderDepartment}</Badge>
                      </div>

                      {employeeAssets.map((ownedAsset) => (
                        <div
                          key={ownedAsset.id}
                          className="rounded-2xl border border-dashed bg-background p-4 shadow-sm"
                        >
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

                          <p className="mt-3 text-sm text-muted-foreground">
                            {ownedAsset.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed bg-background p-4 text-sm text-muted-foreground">
                      No assets are assigned under this employee yet.
                    </div>
                  )}
                </CollapsibleContent>
              </Collapsible>

              <div className="rounded-3xl border border-dashed bg-muted/20 p-5">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Lock className="h-4 w-4 text-amber-600" />
                      <p className="font-medium">Higher-up access</p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Use the protected action below if a higher-up needs a more detailed list than
                      the employee view.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Button
                      className="rounded-xl"
                      onClick={() => setAssignedToSelf(true)}
                      disabled={assignedToSelf}
                    >
                      Assign asset to myself
                    </Button>
                    <Button
                      variant="outline"
                      className="rounded-xl"
                      onClick={() => setShowAccessPanel((current) => !current)}
                    >
                      <KeyRound className="h-4 w-4" />
                      Show detailed list
                    </Button>
                  </div>
                </div>

                {showAccessPanel && (
                  <div className="mt-4 space-y-4 rounded-2xl border border-dashed bg-background p-4">
                    <div className="space-y-1">
                      <p className="font-medium">Protected detail gate</p>
                      <p className="text-sm text-muted-foreground">
                        Enter any value to unlock this demo panel and reveal the detailed list.
                      </p>
                    </div>

                    <div className="flex flex-col gap-3 md:flex-row">
                      <Input
                        type="text"
                        value={accessPhrase}
                        onChange={(event) => {
                          setAccessPhrase(event.target.value)
                          setErrorMessage("")
                        }}
                        placeholder="Type anything to unlock"
                      />
                      <Button onClick={handleUnlock} className="rounded-xl">
                        Unlock
                      </Button>
                    </div>

                    {errorMessage ? (
                      <p className="text-sm text-rose-600">{errorMessage}</p>
                    ) : null}

                    {isUnlocked ? (
                      <div className="rounded-2xl border border-emerald-200 bg-emerald-500/10 p-4">
                        <div className="mb-3 flex items-center gap-2">
                          <ShieldCheck className="h-4 w-4 text-emerald-700" />
                          <p className="font-medium text-emerald-800">Detailed list unlocked</p>
                        </div>
                        <div className="space-y-3">
                          <InfoRow label="Serial number" value={asset.serialNumber} />
                          <InfoRow label="Purchase date" value={asset.purchaseDate} />
                          <InfoRow
                            label="Purchase cost"
                            value={currencyFormatter.format(asset.purchaseCost)}
                          />
                          <InfoRow
                            label="Book value"
                            value={currencyFormatter.format(asset.currentBookValue)}
                          />
                          <InfoRow label="Internal summary" value={asset.description} />
                        </div>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>

              <div className="rounded-3xl border border-amber-200 bg-amber-500/10 p-5 text-sm text-amber-900">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
                  <div>
                    <p className="font-medium">Restricted internal data</p>
                    <p className="mt-1">
                      Full administration controls and full lifecycle records remain limited to
                      authorized internal views.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
