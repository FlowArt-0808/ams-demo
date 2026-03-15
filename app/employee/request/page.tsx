"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeft,
  Package,
  Send,
  Clock,
  CheckCircle2,
  XCircle,
  Laptop,
  Monitor,
  Smartphone,
  Tablet,
  User,
} from "lucide-react"
import { toast } from "sonner"
import {
  mockEmployees,
  assetCategories,
  type AssetRequest,
} from "@/lib/mock-data"

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  Laptop: Laptop,
  Monitor: Monitor,
  Phone: Smartphone,
  Tablet: Tablet,
  Other: Package,
}

const requestStatusConfig = {
  Pending: { color: "bg-amber-500/10 text-amber-600 border-amber-200", icon: Clock },
  Approved: { color: "bg-emerald-500/10 text-emerald-600 border-emerald-200", icon: CheckCircle2 },
  Rejected: { color: "bg-red-500/10 text-red-600 border-red-200", icon: XCircle },
  Fulfilled: { color: "bg-blue-500/10 text-blue-600 border-blue-200", icon: CheckCircle2 },
}

// Simulated current employee (in real app, this would come from auth)
const currentEmployee = mockEmployees[1] // Michael Torres

export default function EmployeeRequestPage() {
  const [requests, setRequests] = useState<AssetRequest[]>([
    {
      id: "REQ-2026-001",
      employeeId: currentEmployee.id,
      assetCategory: "Monitor",
      justification: "Need a second monitor for design work and video editing tasks.",
      status: "Pending",
      requestedAt: "2026-03-14T09:30:00Z",
    },
  ])
  
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [justification, setJustification] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmitRequest = async () => {
    if (!selectedCategory) {
      toast.error("Please select an asset category")
      return
    }
    if (!justification.trim() || justification.length < 20) {
      toast.error("Please provide a detailed justification (at least 20 characters)")
      return
    }

    setIsSubmitting(true)

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))

    const newRequest: AssetRequest = {
      id: `REQ-${Date.now()}`,
      employeeId: currentEmployee.id,
      assetCategory: selectedCategory as AssetRequest["assetCategory"],
      justification: justification.trim(),
      status: "Pending",
      requestedAt: new Date().toISOString(),
    }

    setRequests([newRequest, ...requests])
    setSelectedCategory("")
    setJustification("")
    setIsSubmitting(false)

    toast.success("Request submitted", {
      description: "Your request has been sent to HR for review.",
    })
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
            <div className="h-8 w-8 rounded-lg bg-cyan-500/10 flex items-center justify-center">
              <Package className="h-4 w-4 text-cyan-600" />
            </div>
            <div>
              <h1 className="font-semibold text-sm">Asset Request</h1>
              <p className="text-xs text-muted-foreground">Employee Portal</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container px-4 py-6 max-w-2xl">
        {/* Employee Info */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                <User className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium">{currentEmployee.name}</p>
                <p className="text-sm text-muted-foreground">
                  {currentEmployee.department} | {currentEmployee.id}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Request Form */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Request New Asset</CardTitle>
            <CardDescription>
              Submit a request for a new asset. Your request will be reviewed by HR.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Asset Category</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select what you need" />
                </SelectTrigger>
                <SelectContent>
                  {assetCategories.map((category) => {
                    const Icon = categoryIcons[category] || Package
                    return (
                      <SelectItem key={category} value={category}>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          {category}
                        </div>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>
                Justification <span className="text-muted-foreground text-xs">(min. 20 characters)</span>
              </Label>
              <Textarea
                placeholder="Explain why you need this asset and how it will help your work..."
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
                rows={4}
              />
              <p className="text-xs text-muted-foreground text-right">
                {justification.length} / 20 characters minimum
              </p>
            </div>

            <Button 
              className="w-full gap-2" 
              onClick={handleSubmitRequest}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                "Submitting..."
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Submit Request
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Previous Requests */}
        <div>
          <h2 className="font-semibold mb-4">Your Requests</h2>
          
          {requests.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No requests yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {requests.map((request) => {
                const Icon = categoryIcons[request.assetCategory] || Package
                const statusConfig = requestStatusConfig[request.status]
                const StatusIcon = statusConfig.icon
                
                return (
                  <Card key={request.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                          <Icon className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium">{request.assetCategory}</p>
                            <Badge className={statusConfig.color}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {request.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                            {request.justification}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Requested: {new Date(request.requestedAt).toLocaleDateString()}
                          </p>
                          
                          {request.status === "Rejected" && request.rejectionReason && (
                            <div className="mt-3 p-2 bg-red-500/5 border border-red-200 rounded-md">
                              <p className="text-xs text-red-600">
                                <strong>Reason:</strong> {request.rejectionReason}
                              </p>
                            </div>
                          )}
                          
                          {request.status === "Approved" && (
                            <div className="mt-3 p-2 bg-emerald-500/5 border border-emerald-200 rounded-md">
                              <p className="text-xs text-emerald-600">
                                Your request has been approved. HR will assign an asset to you soon.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
