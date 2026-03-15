"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MockQRScanner } from "@/components/demo/mock-qr-scanner"
import { AssetCard } from "@/components/demo/asset-card"
import { mockAssets, mockEmployees, mockCensuses, type Asset } from "@/lib/mock-data"
import { ArrowLeft, CheckCircle2, Clock, AlertTriangle, QrCode, Shield, Mail } from "lucide-react"
import { toast } from "sonner"

type VerificationStatus = "pending" | "verified" | "discrepancy"

type EmployeeAsset = {
  asset: Asset
  status: VerificationStatus
  verifiedAt?: Date
  hasBeenScanned?: boolean
}

export default function EmployeeVerifyPage() {
  // Simulating an employee who received an email link
  const currentEmployee = mockEmployees[0] // Sarah Chen
  const activeCensus = mockCensuses.find(c => c.status === "active")
  
  // Get assets assigned to this employee
  const initialAssets: EmployeeAsset[] = mockAssets
    .filter(a => a.assignedTo === currentEmployee.id)
    .map(asset => ({
      asset,
      status: "pending" as VerificationStatus
    }))
  
  const [employeeAssets, setEmployeeAssets] = useState<EmployeeAsset[]>(initialAssets)
  const [isScanning, setIsScanning] = useState(false)
  const [scanningForAssetId, setScanningForAssetId] = useState<string | null>(null)
  
  const verifiedCount = employeeAssets.filter(a => a.status === "verified").length
  const pendingCount = employeeAssets.filter(a => a.status === "pending").length
  
  const handleScanToVerify = (assetId: string) => {
    setScanningForAssetId(assetId)
    setIsScanning(true)
  }
  
  const handleScan = (scannedAssetId: string) => {
    setIsScanning(false)
    
    if (scannedAssetId === scanningForAssetId) {
      // Correct asset scanned - mark as scanned (ready for confirmation)
      setEmployeeAssets(prev => prev.map(item => 
        item.asset.id === scannedAssetId 
          ? { ...item, hasBeenScanned: true }
          : item
      ))
      toast.success("QR code scanned! You can now confirm possession.")
    } else {
      // Wrong asset scanned
      toast.error("QR code doesn't match the expected asset. Please scan the correct asset.")
    }
    
    setScanningForAssetId(null)
  }
  
  const handleConfirmPossession = (assetId: string) => {
    const assetItem = employeeAssets.find(item => item.asset.id === assetId)
    
    if (!assetItem?.hasBeenScanned) {
      toast.error("Please scan the QR code first", {
        description: "You must scan the asset's QR code before confirming possession."
      })
      return
    }
    
    setEmployeeAssets(prev => prev.map(item => 
      item.asset.id === assetId 
        ? { ...item, status: "verified" as VerificationStatus, verifiedAt: new Date() }
        : item
    ))
    toast.success("Asset verified successfully!")
  }
  
  const handleReportMissing = (assetId: string) => {
    setEmployeeAssets(prev => prev.map(item => 
      item.asset.id === assetId 
        ? { ...item, status: "discrepancy" as VerificationStatus }
        : item
    ))
    toast.warning("Asset reported as missing. Admin will be notified.")
  }

  // Calculate deadline
  const deadline = activeCensus ? new Date(activeCensus.endDate) : null
  const daysRemaining = deadline 
    ? Math.ceil((deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 0

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background">
        <div className="container px-4 py-4">
          <div className="flex items-center gap-3 mb-3">
            <Link href="/?workflow=qr">
              <Button variant="ghost" size="icon" className="flex-shrink-0">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="font-semibold">Asset Verification Portal</h1>
              <p className="text-sm text-muted-foreground">
                {activeCensus?.name}
              </p>
            </div>
          </div>
          
          <Card className="bg-muted/50 border-muted">
            <CardContent className="flex items-center gap-3 py-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">Welcome, {currentEmployee.name}</p>
                <p className="text-xs text-muted-foreground truncate">{currentEmployee.email}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </header>

      <main className="container px-4 py-6 space-y-6">
        {/* Status Summary */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="bg-amber-500/10 border-amber-500/20">
            <CardContent className="py-3 text-center">
              <Clock className="h-5 w-5 mx-auto mb-1 text-amber-600" />
              <p className="text-2xl font-bold text-amber-600">{pendingCount}</p>
              <p className="text-xs text-amber-600/80">Pending</p>
            </CardContent>
          </Card>
          
          <Card className="bg-green-500/10 border-green-500/20">
            <CardContent className="py-3 text-center">
              <CheckCircle2 className="h-5 w-5 mx-auto mb-1 text-green-600" />
              <p className="text-2xl font-bold text-green-600">{verifiedCount}</p>
              <p className="text-xs text-green-600/80">Verified</p>
            </CardContent>
          </Card>
          
          <Card className="bg-muted border-muted">
            <CardContent className="py-3 text-center">
              <AlertTriangle className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
              <p className="text-2xl font-bold">{daysRemaining}</p>
              <p className="text-xs text-muted-foreground">Days Left</p>
            </CardContent>
          </Card>
        </div>

        {/* Deadline Warning */}
        {daysRemaining <= 3 && daysRemaining > 0 && (
          <Card className="border-amber-500/50 bg-amber-500/5">
            <CardContent className="flex items-center gap-3 py-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-amber-600">Deadline Approaching</p>
                <p className="text-xs text-amber-600/80">
                  Please verify all assets by {deadline?.toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* QR Scanner Modal */}
        {isScanning && (
          <div className="fixed inset-0 z-50 bg-background">
            <MockQRScanner
              onScan={handleScan}
              onClose={() => {
                setIsScanning(false)
                setScanningForAssetId(null)
              }}
              expectedAssetId={scanningForAssetId || undefined}
            />
          </div>
        )}

        {/* Assets to Verify */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground">Your Assigned Assets</h2>
          
          {employeeAssets.map(({ asset, status, verifiedAt, hasBeenScanned }) => (
            <Card 
              key={asset.id}
              className={
                status === "verified" 
                  ? "border-green-500/30 bg-green-500/5" 
                  : status === "discrepancy"
                  ? "border-red-500/30 bg-red-500/5"
                  : ""
              }
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <CardTitle className="text-base">{asset.name}</CardTitle>
                    <CardDescription className="font-mono text-xs">{asset.id}</CardDescription>
                  </div>
                  <Badge 
                    variant={
                      status === "verified" ? "default" :
                      status === "discrepancy" ? "destructive" : "secondary"
                    }
                    className="capitalize"
                  >
                    {status}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-muted-foreground text-xs">Category</p>
                    <p className="capitalize">{asset.category}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Location</p>
                    <p>{asset.location}</p>
                  </div>
                </div>
                
                {status === "pending" && (
                  <div className="space-y-3 pt-2">
                    {hasBeenScanned && (
                      <div className="flex items-center gap-2 text-sm text-green-600 bg-green-500/10 px-3 py-2 rounded-md">
                        <CheckCircle2 className="h-4 w-4" />
                        QR code scanned - Ready to confirm
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Button 
                        className="flex-1 gap-2" 
                        variant={hasBeenScanned ? "outline" : "default"}
                        onClick={() => handleScanToVerify(asset.id)}
                      >
                        <QrCode className="h-4 w-4" />
                        {hasBeenScanned ? "Scan Again" : "Scan QR"}
                      </Button>
                      <Button 
                        className="flex-1"
                        variant={hasBeenScanned ? "default" : "outline"}
                        onClick={() => handleConfirmPossession(asset.id)}
                      >
                        Confirm
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleReportMissing(asset.id)}
                      >
                        <AlertTriangle className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
                
                {status === "verified" && verifiedAt && (
                  <p className="text-xs text-green-600 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Verified on {verifiedAt.toLocaleDateString()} at {verifiedAt.toLocaleTimeString()}
                  </p>
                )}
                
                {status === "discrepancy" && (
                  <p className="text-xs text-red-600 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Reported as missing - Admin notified
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* All Verified Message */}
        {pendingCount === 0 && verifiedCount === employeeAssets.length && (
          <Card className="border-green-500/30 bg-green-500/5">
            <CardContent className="flex flex-col items-center py-8 gap-3">
              <div className="h-12 w-12 rounded-full bg-green-500/20 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
              <div className="text-center">
                <h3 className="font-semibold text-green-600">All Done!</h3>
                <p className="text-sm text-green-600/80">
                  You have verified all your assigned assets.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
