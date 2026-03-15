"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import {
  ArrowLeft,
  FileSignature,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Laptop,
  Monitor,
  Smartphone,
  Tablet,
  Package,
  User,
  Calendar,
  MapPin,
  Shield,
} from "lucide-react"
import { toast } from "sonner"
import {
  mockEmployees,
  unassignedAssets,
  getEmployeeById,
  type AssetAssignment,
} from "@/lib/mock-data"

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  Laptop: Laptop,
  Monitor: Monitor,
  Phone: Smartphone,
  Tablet: Tablet,
  Other: Package,
}

// Simulated current employee (in real app, this would come from JWT in the link)
const currentEmployee = mockEmployees[2] // Emily Watson (EMP-003)

// Simulated pending assignment for this employee
const pendingAssignment: AssetAssignment = {
  id: "ASSIGN-2026-001",
  assetId: "MAC-2026-010",
  employeeId: currentEmployee.id,
  assignedBy: "HR Admin",
  status: "Pending Acknowledgment",
  assignedAt: "2026-03-14T10:00:00Z",
  expiresAt: "2026-03-17T10:00:00Z",
}

// The asset being assigned
const assignedAsset = unassignedAssets[0] // MacBook Pro 14" M3

export default function EmployeeAcknowledgePage() {
  const [assignment, setAssignment] = useState<AssetAssignment | null>(pendingAssignment)
  const [signedName, setSignedName] = useState("")
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)

  const employee = getEmployeeById(currentEmployee.id)
  const Icon = assignedAsset ? categoryIcons[assignedAsset.category] : Package

  // Calculate time remaining
  const expiresAt = assignment ? new Date(assignment.expiresAt) : new Date()
  const hoursRemaining = Math.max(0, Math.round((expiresAt.getTime() - Date.now()) / (1000 * 60 * 60)))

  const handleAcknowledge = async () => {
    if (!signedName.trim()) {
      toast.error("Please type your full name to sign")
      return
    }

    // Check if typed name matches employee name (case insensitive)
    const normalizedSigned = signedName.trim().toLowerCase()
    const normalizedEmployee = (employee?.name || "").toLowerCase()
    
    if (normalizedSigned !== normalizedEmployee) {
      toast.error("Signature doesn't match", {
        description: `Please type your full name exactly as: ${employee?.name}`,
      })
      return
    }

    if (!agreedToTerms) {
      toast.error("Please agree to the terms and conditions")
      return
    }

    setIsSubmitting(true)

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))

    setIsCompleted(true)
    setIsSubmitting(false)

    toast.success("Asset acknowledged successfully", {
      description: "A confirmation has been sent to your email.",
    })
  }

  // Completed state
  if (isCompleted) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b">
          <div className="container flex h-14 items-center gap-4 px-4">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              </div>
              <div>
                <h1 className="font-semibold text-sm">Acknowledgment Complete</h1>
                <p className="text-xs text-muted-foreground">Thank you</p>
              </div>
            </div>
          </div>
        </header>

        <main className="container px-4 py-12 max-w-lg">
          <Card className="border-emerald-200 bg-emerald-500/5">
            <CardContent className="pt-8 pb-8 text-center">
              <div className="h-16 w-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="h-8 w-8 text-emerald-600" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Asset Acknowledged</h2>
              <p className="text-muted-foreground mb-6">
                You have successfully acknowledged receipt of your assigned asset.
              </p>

              <div className="bg-background rounded-lg p-4 text-left mb-6">
                <div className="flex items-center gap-3 mb-3">
                  <Icon className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{assignedAsset?.name}</p>
                    <p className="text-sm text-muted-foreground">{assignedAsset?.id}</p>
                  </div>
                </div>
                <Separator className="my-3" />
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Signed by</span>
                    <span className="font-medium">{signedName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Employee ID</span>
                    <span className="font-medium">{employee?.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date</span>
                    <span className="font-medium">{new Date().toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Time</span>
                    <span className="font-medium">{new Date().toLocaleTimeString()}</span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                A PDF copy of this acknowledgment has been sent to your email and stored for audit purposes.
              </p>
            </CardContent>
          </Card>

          <div className="text-center mt-6">
            <Link href="/">
              <Button variant="outline">Return to Home</Button>
            </Link>
          </div>
        </main>
      </div>
    )
  }

  // No pending assignment
  if (!assignment) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b">
          <div className="container flex h-14 items-center gap-4 px-4">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-rose-500/10 flex items-center justify-center">
                <FileSignature className="h-4 w-4 text-rose-600" />
              </div>
              <div>
                <h1 className="font-semibold text-sm">Asset Acknowledgment</h1>
                <p className="text-xs text-muted-foreground">Employee Portal</p>
              </div>
            </div>
          </div>
        </header>

        <main className="container px-4 py-12 max-w-lg">
          <Card>
            <CardContent className="py-12 text-center">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h2 className="font-semibold mb-2">No Pending Acknowledgments</h2>
              <p className="text-muted-foreground">
                You don&apos;t have any assets waiting for acknowledgment.
              </p>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b sticky top-0 bg-background z-10">
        <div className="container flex h-14 items-center gap-4 px-4">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-rose-500/10 flex items-center justify-center">
              <FileSignature className="h-4 w-4 text-rose-600" />
            </div>
            <div>
              <h1 className="font-semibold text-sm">Asset Acknowledgment</h1>
              <p className="text-xs text-muted-foreground">Employee Portal</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container px-4 py-6 max-w-lg">
        {/* Time Warning */}
        <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-500/10 border border-amber-200 mb-6">
          <Clock className="h-5 w-5 text-amber-600 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-amber-800">Action Required</p>
            <p className="text-xs text-amber-700">
              Please acknowledge within {hoursRemaining} hours or this link will expire.
            </p>
          </div>
        </div>

        {/* Employee Info */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                <User className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium">{employee?.name}</p>
                <p className="text-sm text-muted-foreground">
                  {employee?.department} | {employee?.id}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Asset Details */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Asset Details</CardTitle>
            <CardDescription>
              Review the asset being assigned to you
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
              <div className="h-12 w-12 rounded-xl bg-background flex items-center justify-center">
                <Icon className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <p className="font-semibold">{assignedAsset?.name}</p>
                <p className="text-sm text-muted-foreground">{assignedAsset?.id}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Category</p>
                  <p className="text-sm font-medium">{assignedAsset?.category}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Condition</p>
                  <p className="text-sm font-medium">{assignedAsset?.condition}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Pickup Location</p>
                  <p className="text-sm font-medium">{assignedAsset?.location}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Assigned Date</p>
                  <p className="text-sm font-medium">
                    {new Date(assignment.assignedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Acknowledgment Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Electronic Signature</CardTitle>
            <CardDescription>
              Type your full name to acknowledge receipt of this asset
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Terms */}
            <div className="p-4 rounded-lg bg-muted/50 text-sm space-y-2">
              <p className="font-medium">By signing below, I acknowledge that:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>I have received the asset described above in the stated condition</li>
                <li>I am responsible for the proper care and use of this asset</li>
                <li>I will return the asset upon termination or when requested</li>
                <li>I will report any damage, loss, or theft immediately</li>
              </ul>
            </div>

            {/* Signature Input */}
            <div className="space-y-2">
              <Label htmlFor="signature">
                Type your full name to sign
              </Label>
              <Input
                id="signature"
                placeholder={employee?.name}
                value={signedName}
                onChange={(e) => setSignedName(e.target.value)}
                className="text-lg h-12"
              />
              <p className="text-xs text-muted-foreground">
                Please type exactly: <span className="font-medium">{employee?.name}</span>
              </p>
            </div>

            {/* Agreement Checkbox */}
            <div className="flex items-start gap-3">
              <Checkbox
                id="terms"
                checked={agreedToTerms}
                onCheckedChange={(checked) => setAgreedToTerms(checked === true)}
              />
              <Label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer">
                I agree to the terms and conditions stated above and confirm that my electronic signature is legally binding.
              </Label>
            </div>

            <Separator />

            {/* Submit Button */}
            <Button 
              className="w-full h-12 text-base gap-2" 
              onClick={handleAcknowledge}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                "Processing..."
              ) : (
                <>
                  <FileSignature className="h-5 w-5" />
                  I Acknowledge Receipt
                </>
              )}
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              Your signature will be recorded with your Employee ID ({employee?.id}), timestamp, and stored securely.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
