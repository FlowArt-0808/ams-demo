"use client"

import { useState } from "react"
import Link from "next/link"
import { useDemoRole } from "@/components/demo/demo-role-provider"
import { RolePerspectivePanel } from "@/components/demo/role-perspective-panel"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  ArrowLeft,
  Box,
  Send,
  Package,
  Clock,
  CheckCircle2,
  AlertTriangle,
  MoreVertical,
  Plus,
  User,
  Laptop,
  Monitor,
  Smartphone,
  Tablet,
  History,
} from "lucide-react"
import { toast } from "sonner"
import {
  mockEmployees,
  mockAssetRequests,
  mockAssetAssignments,
  mockAssignmentHistory,
  unassignedAssets,
  getEmployeeById,
  getAssetById,
  type AssetRequest,
  type AssetAssignment,
  type Asset,
} from "@/lib/mock-data"
import { type DemoRole } from "@/lib/demo-navigation"

const categoryIcons = {
  Laptop: Laptop,
  Monitor: Monitor,
  Phone: Smartphone,
  Tablet: Tablet,
  Other: Package,
}

const requestStatusConfig = {
  Pending: { color: "bg-amber-500/10 text-amber-600 border-amber-200", label: "Pending Review" },
  Approved: { color: "bg-emerald-500/10 text-emerald-600 border-emerald-200", label: "Approved" },
  Rejected: { color: "bg-red-500/10 text-red-600 border-red-200", label: "Rejected" },
  Fulfilled: { color: "bg-blue-500/10 text-blue-600 border-blue-200", label: "Fulfilled" },
}

const assignmentStatusConfig = {
  "Pending Acknowledgment": { color: "bg-amber-500/10 text-amber-600 border-amber-200" },
  "Acknowledged": { color: "bg-emerald-500/10 text-emerald-600 border-emerald-200" },
  "Expired": { color: "bg-red-500/10 text-red-600 border-red-200" },
}

type TabType = "assign" | "requests" | "history"

function getDistributionRoleContent(role: DemoRole) {
  if (role === "it-admin") {
    return {
      responsibilities: [
        "Review which devices are about to go out, verify readiness, and track pending acknowledgments after handoff.",
        "Use the shared cards for context, but leave request approvals and assignment creation to HR.",
      ],
      visibility: [
        "Available asset cards, pending acknowledgment cards, and assignment history so you can follow the handoff end to end.",
        "Employee requests stay visible for context, but they are read-only from the IT perspective.",
      ],
    }
  }

  if (role === "system-admin") {
    return {
      responsibilities: [
        "Validate both HR and IT paths from one shared distribution workspace.",
        "Exercise request review, assignment, and handoff tracking without leaving the screen.",
      ],
      visibility: [
        "Everything shown to HR and IT, including request actions, assign actions, and post-assignment follow-up cards.",
        "The same distribution tabs with role-dependent controls exposed in one place.",
      ],
    }
  }

  return {
    responsibilities: [
      "Review employee requests, assign available assets, and keep the acknowledgment queue moving.",
      "Use the available-asset cards to choose inventory and the history cards to confirm completed handoffs.",
    ],
    visibility: [
      "Actionable request cards, available asset cards with assign buttons, and pending acknowledgment follow-up cards.",
      "Assignment history so HR can verify what was already issued and acknowledged.",
    ],
  }
}

export default function HRDistributionPage() {
  const { role, setRole } = useDemoRole()
  const [activeTab, setActiveTab] = useState<TabType>("assign")
  const [requests, setRequests] = useState<AssetRequest[]>(mockAssetRequests)
  const [assignments, setAssignments] = useState<AssetAssignment[]>(mockAssetAssignments)
  const [availableAssets, setAvailableAssets] = useState<Asset[]>(unassignedAssets)
  const [history] = useState<AssetAssignment[]>(mockAssignmentHistory)
  
  // Assign dialog state
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false)
  const [selectedAsset, setSelectedAsset] = useState<string>("")
  const [selectedEmployee, setSelectedEmployee] = useState<string>("")
  
  // Request review dialog state
  const [reviewingRequest, setReviewingRequest] = useState<AssetRequest | null>(null)
  const [rejectionReason, setRejectionReason] = useState("")
  const canAssignAssets = role === "hr" || role === "system-admin"
  const canReviewRequests = role === "hr" || role === "system-admin"
  const distributionRoleContent = getDistributionRoleContent(role)

  // Stats
  const pendingRequests = requests.filter(r => r.status === "Pending").length
  const pendingAcknowledgments = assignments.filter(a => a.status === "Pending Acknowledgment").length
  const completedThisMonth = history.filter(h => {
    const date = new Date(h.acknowledgedAt || "")
    const now = new Date()
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
  }).length

  const handleAssignAsset = () => {
    if (!selectedAsset || !selectedEmployee) {
      toast.error("Please select both an asset and an employee")
      return
    }

    const asset = availableAssets.find(a => a.id === selectedAsset)
    const employee = mockEmployees.find(e => e.id === selectedEmployee)
    
    // Check for conflict (employee already has asset of same category)
    const existingAssets = [...mockAssetAssignments, ...mockAssignmentHistory]
    const hasConflict = existingAssets.some(
      a => a.employeeId === selectedEmployee && 
           getAssetById(a.assetId)?.category === asset?.category &&
           a.status === "Acknowledged"
    )

    if (hasConflict) {
      toast.warning(`${employee?.name} already has a ${asset?.category} assigned`, {
        description: "Proceeding with assignment anyway.",
      })
    }

    // Create new assignment
    const newAssignment: AssetAssignment = {
      id: `ASSIGN-${Date.now()}`,
      assetId: selectedAsset,
      employeeId: selectedEmployee,
      assignedBy: "HR Admin",
      status: "Pending Acknowledgment",
      assignedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(), // 72 hours
    }

    setAssignments([...assignments, newAssignment])
    setAvailableAssets(availableAssets.filter(a => a.id !== selectedAsset))
    
    toast.success("Assignment created", {
      description: `Acknowledgment email sent to ${employee?.name}`,
    })

    setIsAssignDialogOpen(false)
    setSelectedAsset("")
    setSelectedEmployee("")
  }

  const handleApproveRequest = (request: AssetRequest) => {
    setRequests(requests.map(r => 
      r.id === request.id 
        ? { ...r, status: "Approved" as const, reviewedAt: new Date().toISOString(), reviewedBy: "HR Admin" }
        : r
    ))
    toast.success("Request approved", {
      description: "You can now assign an asset to this employee.",
    })
    setReviewingRequest(null)
  }

  const handleRejectRequest = (request: AssetRequest) => {
    if (!rejectionReason.trim()) {
      toast.error("Please provide a reason for rejection")
      return
    }
    setRequests(requests.map(r => 
      r.id === request.id 
        ? { 
            ...r, 
            status: "Rejected" as const, 
            reviewedAt: new Date().toISOString(), 
            reviewedBy: "HR Admin",
            rejectionReason: rejectionReason 
          }
        : r
    ))
    toast.success("Request rejected", {
      description: "The employee will be notified.",
    })
    setReviewingRequest(null)
    setRejectionReason("")
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
            <div className="h-8 w-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
              <Send className="h-4 w-4 text-violet-600" />
            </div>
            <div>
              <h1 className="font-semibold text-sm">Distribution Dashboard</h1>
              <p className="text-xs text-muted-foreground">Shared distribution tab with role-specific controls</p>
            </div>
          </div>
          {canAssignAssets ? (
            <Button className="ml-auto gap-2" onClick={() => setIsAssignDialogOpen(true)}>
              <Plus className="h-4 w-4" />
              Assign Asset
            </Button>
          ) : (
            <Badge variant="outline" className="ml-auto">
              IT view
            </Badge>
          )}
        </div>
      </header>

      <main className="container px-4 py-6">
        <div className="mb-6">
          <RolePerspectivePanel
            currentRole={role}
            onRoleChange={setRole}
            roles={["hr", "it-admin"]}
            title="Distribution perspective"
            description="Switch between the roles that share this tab."
            responsibilities={distributionRoleContent.responsibilities}
            visibility={distributionRoleContent.visibility}
          />
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-500/10">
                  <Package className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{availableAssets.length}</p>
                  <p className="text-sm text-muted-foreground">Available Assets</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-500/10">
                  <Clock className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{pendingRequests}</p>
                  <p className="text-sm text-muted-foreground">Pending Requests</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10">
                  <AlertTriangle className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{pendingAcknowledgments}</p>
                  <p className="text-sm text-muted-foreground">Awaiting Acknowledgment</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-zinc-500/10">
                  <CheckCircle2 className="h-6 w-6 text-zinc-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{completedThisMonth}</p>
                  <p className="text-sm text-muted-foreground">Completed This Month</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b mb-6">
          <button
            onClick={() => setActiveTab("assign")}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeTab === "assign"
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Available Assets
          </button>
          <button
            onClick={() => setActiveTab("requests")}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors flex items-center gap-2 ${
              activeTab === "requests"
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Employee Requests
            {pendingRequests > 0 && (
              <Badge variant="destructive" className="h-5 px-1.5 text-xs">{pendingRequests}</Badge>
            )}
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeTab === "history"
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Assignment History
          </button>
        </div>

        {/* Available Assets Tab */}
        {activeTab === "assign" && (
          <div className="space-y-4">
            {availableAssets.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No assets available for assignment</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {availableAssets.map((asset) => {
                  const Icon = categoryIcons[asset.category]
                  return (
                    <Card key={asset.id} className="group">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                            <Icon className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{asset.name}</p>
                            <p className="text-sm text-muted-foreground">{asset.id}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline" className="text-xs">{asset.category}</Badge>
                              <span className="text-xs text-muted-foreground">{asset.location}</span>
                            </div>
                          </div>
                          {canAssignAssets ? (
                            <Button
                              size="sm"
                              onClick={() => {
                                setSelectedAsset(asset.id)
                                setIsAssignDialogOpen(true)
                              }}
                            >
                              Assign
                            </Button>
                          ) : (
                            <Badge variant="outline">IT can review only</Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}

            {/* Pending Acknowledgments */}
            {assignments.filter(a => a.status === "Pending Acknowledgment").length > 0 && (
              <>
                <Separator className="my-6" />
                <h3 className="font-semibold mb-4">Pending Acknowledgments</h3>
                <div className="grid gap-3 md:grid-cols-2">
                  {assignments.filter(a => a.status === "Pending Acknowledgment").map((assignment) => {
                    const asset = getAssetById(assignment.assetId)
                    const employee = getEmployeeById(assignment.employeeId)
                    const Icon = asset ? categoryIcons[asset.category] : Package
                    const expiresAt = new Date(assignment.expiresAt)
                    const hoursLeft = Math.max(0, Math.round((expiresAt.getTime() - Date.now()) / (1000 * 60 * 60)))
                    
                    return (
                      <Card key={assignment.id} className="border-amber-200 bg-amber-500/5">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4">
                            <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                              <Icon className="h-5 w-5 text-amber-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{asset?.name}</p>
                              <p className="text-sm text-muted-foreground">Assigned to: {employee?.name}</p>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge className={assignmentStatusConfig[assignment.status].color}>
                                  {assignment.status}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {hoursLeft}h remaining
                                </span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </>
            )}
          </div>
        )}

        {/* Employee Requests Tab */}
        {activeTab === "requests" && (
          <div className="space-y-4">
            {requests.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Box className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No asset requests</p>
                </CardContent>
              </Card>
            ) : (
              requests.map((request) => {
                const employee = getEmployeeById(request.employeeId)
                const Icon = categoryIcons[request.assetCategory]
                const statusStyle = requestStatusConfig[request.status]
                
                return (
                  <Card key={request.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                          <Icon className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium">{employee?.name}</p>
                            <Badge className={statusStyle.color}>{statusStyle.label}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            Requesting: <span className="font-medium">{request.assetCategory}</span>
                          </p>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {request.justification}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            Requested: {new Date(request.requestedAt).toLocaleDateString()}
                          </p>
                        </div>
                        {request.status === "Pending" && canReviewRequests ? (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setReviewingRequest(request)}>
                                Review Request
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        ) : request.status === "Pending" ? <Badge variant="outline">View only</Badge> : null}
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            )}
          </div>
        )}

        {/* Assignment History Tab */}
        {activeTab === "history" && (
          <div className="space-y-4">
            {history.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <History className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No assignment history</p>
                </CardContent>
              </Card>
            ) : (
              history.map((assignment) => {
                const asset = getAssetById(assignment.assetId)
                const employee = getEmployeeById(assignment.employeeId)
                const Icon = asset ? categoryIcons[asset.category] : Package
                
                return (
                  <Card key={assignment.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                          <Icon className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium">{asset?.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Assigned to: {employee?.name}
                          </p>
                          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                            <span>Signed: {assignment.signedName}</span>
                            <span>|</span>
                            <span>
                              {assignment.acknowledgedAt && new Date(assignment.acknowledgedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <Badge className={assignmentStatusConfig[assignment.status].color}>
                          {assignment.status}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            )}
          </div>
        )}
      </main>

      {/* Assign Asset Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Asset to Employee</DialogTitle>
            <DialogDescription>
              Select an asset and employee. The employee will receive an acknowledgment email.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Asset</Label>
              <Select value={selectedAsset} onValueChange={setSelectedAsset}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an asset" />
                </SelectTrigger>
                <SelectContent>
                  {availableAssets.map((asset) => (
                    <SelectItem key={asset.id} value={asset.id}>
                      {asset.name} ({asset.id})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Employee</Label>
              <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an employee" />
                </SelectTrigger>
                <SelectContent>
                  {mockEmployees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {employee.name} - {employee.department}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAssignAsset}>
              <Send className="mr-2 h-4 w-4" />
              Send Assignment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Review Request Dialog */}
      <Dialog open={!!reviewingRequest} onOpenChange={() => setReviewingRequest(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review Asset Request</DialogTitle>
            <DialogDescription>
              Approve or reject this asset request
            </DialogDescription>
          </DialogHeader>

          {reviewingRequest && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Employee</p>
                  <p className="font-medium">{getEmployeeById(reviewingRequest.employeeId)?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Requested Asset</p>
                  <p className="font-medium">{reviewingRequest.assetCategory}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">Justification</p>
                <p className="text-sm bg-muted p-3 rounded-md">{reviewingRequest.justification}</p>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Rejection Reason (if rejecting)</Label>
                <Textarea
                  placeholder="Provide a reason if you're rejecting this request..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button 
              variant="destructive" 
              onClick={() => reviewingRequest && handleRejectRequest(reviewingRequest)}
            >
              Reject
            </Button>
            <Button onClick={() => reviewingRequest && handleApproveRequest(reviewingRequest)}>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
