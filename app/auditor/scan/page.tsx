"use client"

import Link from "next/link"
import { useState } from "react"
import {
  ArrowLeft,
  CheckCircle2,
  ClipboardList,
  MapPin,
  QrCode,
  ScanLine,
} from "lucide-react"
import { toast } from "sonner"

import { MockQRScanner } from "@/components/demo/mock-qr-scanner"
import { VerificationForm } from "@/components/demo/verification-form"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { mockAssets, mockCensuses, type Asset } from "@/lib/mock-data"

type VerifiedAsset = {
  asset: Asset
  condition: "Good" | "Fair" | "Damaged"
  location: string
  verifiedAt: Date
}

export default function AuditorScanPage() {
  const [isScanning, setIsScanning] = useState(false)
  const [scannedAsset, setScannedAsset] = useState<Asset | null>(null)
  const [verifiedAssets, setVerifiedAssets] = useState<VerifiedAsset[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const activeCensus = mockCensuses.find((census) => census.status === "Active") ?? mockCensuses[0]
  const totalAssetsInScope = activeCensus?.totalAssets ?? mockAssets.length
  const progressPercentage = totalAssetsInScope > 0
    ? Math.round((verifiedAssets.length / totalAssetsInScope) * 100)
    : 0

  const handleScan = (assetId: string) => {
    const asset = mockAssets.find((item) => item.id === assetId)

    if (!asset) {
      toast.error("Asset not found in the current census scope")
      return
    }

    setScannedAsset(asset)
    setIsScanning(false)
  }

  const handleVerify = async (data: {
    location: string
    condition: "Good" | "Fair" | "Damaged"
    possessionVerified: boolean
  }) => {
    if (!scannedAsset) {
      return
    }

    if (!data.possessionVerified) {
      toast.error("Confirm physical possession before submitting")
      return
    }

    setIsSubmitting(true)

    await new Promise((resolve) => setTimeout(resolve, 700))

    setVerifiedAssets((current) => [
      {
        asset: scannedAsset,
        condition: data.condition,
        location: data.location,
        verifiedAt: new Date(),
      },
      ...current,
    ])

    toast.success(`Asset ${scannedAsset.id} verified`)
    setScannedAsset(null)
    setIsSubmitting(false)
  }

  return (
    <div className="min-h-svh bg-muted/40">
      <div className="mx-auto flex min-h-svh max-w-md flex-col bg-background shadow-xl">
        <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
          <div className="flex h-14 items-center gap-3 px-4">
            <Link
              href="/?workflow=qr"
              className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">Auditor Scanner</p>
              <p className="truncate text-xs text-muted-foreground">
                Mobile audit mode
              </p>
            </div>
            <Badge variant="secondary" className="rounded-full px-2.5">
              {verifiedAssets.length}/{totalAssetsInScope}
            </Badge>
          </div>
        </header>

        <main className="flex-1 space-y-4 px-4 py-4">
          <Card className="border-emerald-200 bg-emerald-500/5">
            <CardContent className="space-y-4 pt-5">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
                  <ClipboardList className="h-5 w-5 text-emerald-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{activeCensus?.name ?? "Active census"}</p>
                  <p className="text-sm text-muted-foreground">
                    Walk the location, scan the QR, confirm condition, submit.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">{progressPercentage}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-background">
                  <div
                    className="h-full bg-emerald-600 transition-all duration-300"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" />
                <span>Mobile-first verification for field audits</span>
              </div>
            </CardContent>
          </Card>

          {scannedAsset ? (
            <Card className="rounded-2xl">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Confirm scanned asset</CardTitle>
                <CardDescription>
                  Review the scan result and submit the verification from your phone.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="rounded-2xl border bg-muted/40 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{scannedAsset.name}</p>
                      <p className="text-sm text-muted-foreground">{scannedAsset.id}</p>
                    </div>
                    <Badge variant="outline">{scannedAsset.category}</Badge>
                  </div>
                </div>

                <VerificationForm
                  currentLocation={scannedAsset.location}
                  currentCondition={scannedAsset.condition}
                  onSubmit={handleVerify}
                  isSubmitting={isSubmitting}
                />

                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={() => setScannedAsset(null)}
                >
                  Cancel
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="rounded-2xl border-dashed">
              <CardContent className="space-y-5 py-8 text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                  <QrCode className="h-9 w-9 text-primary" />
                </div>
                <div className="space-y-1">
                  <h2 className="text-xl font-semibold">Ready to scan</h2>
                  <p className="text-sm text-muted-foreground">
                    Use the phone camera to scan an asset QR code and open the audit form.
                  </p>
                </div>
                <Button
                  size="lg"
                  className="h-12 w-full rounded-xl gap-2"
                  onClick={() => setIsScanning(true)}
                >
                  <ScanLine className="h-5 w-5" />
                  Start Mobile Scan
                </Button>
              </CardContent>
            </Card>
          )}

          {verifiedAssets.length > 0 && (
            <div className="space-y-3 pb-4">
              <p className="text-sm font-semibold text-muted-foreground">
                Verified on this run
              </p>
              {verifiedAssets.map((item) => (
                <Card key={`${item.asset.id}-${item.verifiedAt.toISOString()}`} className="rounded-2xl">
                  <CardContent className="flex items-center gap-3 py-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10">
                      <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{item.asset.name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {item.asset.id} • {item.location}
                      </p>
                    </div>
                    <Badge variant="outline">{item.condition}</Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>

        {!scannedAsset && (
          <div className="sticky bottom-0 border-t bg-background/95 p-4 backdrop-blur">
            <Button
              className="h-12 w-full rounded-xl gap-2"
              onClick={() => setIsScanning(true)}
            >
              <QrCode className="h-5 w-5" />
              Scan next asset
            </Button>
          </div>
        )}
      </div>

      <MockQRScanner
        isOpen={isScanning}
        onScan={handleScan}
        onClose={() => setIsScanning(false)}
      />
    </div>
  )
}
