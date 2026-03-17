"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useDemoRole } from "@/components/demo/demo-role-provider"
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
import { Input } from "@/components/ui/input"
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
  ArrowRight,
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
  BellRing,
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
  getAssetsForEmployee,
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

type TabType = "assign" | "requests" | "retrieval" | "history"
type OffboardingCaseStatus = "Pending Retrieval" | "Overdue Retrieval" | "Returned"

const terminationInitiators = [
  "James Kim | Engineering Manager",
  "Finance Director | Department Head",
  "Lisa Anderson | HR Business Partner",
] as const

const offboardingQueue = [
  {
    id: "OFF-2026-001",
    employeeId: "EMP-001",
    initiatedBy: "James Kim",
    effectiveDate: "2026-03-18",
    assets: ["MAC-2026-001"],
    recoveryOwner: "HR",
    status: "Pending Retrieval" as OffboardingCaseStatus,
    hrNotice: "Retrieve the laptop kit during the employee exit handoff.",
    employeeNotice: "Return your assigned laptop and charger to HR before your last working day.",
  },
  {
    id: "OFF-2026-002",
    employeeId: "EMP-003",
    initiatedBy: "Finance Director",
    effectiveDate: "2026-03-20",
    assets: ["IPH-2025-008"],
    recoveryOwner: "IT",
    status: "Overdue Retrieval" as OffboardingCaseStatus,
    hrNotice: "Escalate retrieval follow-up for the corporate mobile device because the return deadline passed.",
    employeeNotice: "Mobile device handoff is scheduled with IT during your exit checklist.",
  },
] as const

export default function HRDistributionPage() {
  const searchParams = useSearchParams()
  const { role } = useDemoRole()
  const [activeTab, setActiveTab] = useState<TabType | "retrieval">("assign")
  const [requests, setRequests] = useState<AssetRequest[]>(mockAssetRequests)
  const [assignments, setAssignments] = useState<AssetAssignment[]>(mockAssetAssignments)
  const [availableAssets, setAvailableAssets] = useState<Asset[]>(unassignedAssets)
  const [history] = useState<AssetAssignment[]>(mockAssignmentHistory)
  const [offboardingCases, setOffboardingCases] = useState([...offboardingQueue])
  const [isTerminationDialogOpen, setIsTerminationDialogOpen] = useState(false)
  
  // Assign dialog state
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false)
  const [selectedAsset, setSelectedAsset] = useState<string>("")
  const [selectedEmployee, setSelectedEmployee] = useState<string>("")
  
  // Request review dialog state
  const [reviewingRequest, setReviewingRequest] = useState<AssetRequest | null>(null)
  const [rejectionReason, setRejectionReason] = useState("")
  const [terminationEmployeeId, setTerminationEmployeeId] = useState("EMP-001")
  const [terminationInitiatedBy, setTerminationInitiatedBy] = useState<string>(terminationInitiators[0])
  const [terminationEffectiveDate, setTerminationEffectiveDate] = useState("2026-03-21")
  const [terminationNote, setTerminationNote] = useState("")
  const canAssignAssets = role === "hr" || role === "system-admin"
  const canStartTermination = role === "higher-ups" || role === "hr" || role === "system-admin"
  const canReviewRequests = role === "hr" || role === "system-admin"
  const employeesWithAssets = mockEmployees.filter((employee) => getAssetsForEmployee(employee.id).length > 0)
  const activeRetrievalCases = offboardingCases.filter((item) => item.status !== "Returned")

  useEffect(() => {
    if (searchParams.get("startTermination") === "1" && canStartTermination) {
      setIsTerminationDialogOpen(true)
    }
  }, [canStartTermination, searchParams])

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

  const handleEscalateRetrieval = (caseId: string) => {
    setOffboardingCases((current) =>
      current.map((item) =>
        item.id === caseId
          ? {
              ...item,
              status: "Overdue Retrieval" as OffboardingCaseStatus,
              hrNotice: "Escalate retrieval follow-up because the return deadline passed and the asset is still outstanding.",
            }
          : item,
      ),
    )
    toast.warning("Retrieval escalated", {
      description: "HR and IT follow-up should continue until the asset is returned.",
    })
  }

  const handleMarkReturned = (caseId: string) => {
    setOffboardingCases((current) =>
      current.map((item) =>
        item.id === caseId
          ? {
              ...item,
              status: "Returned" as OffboardingCaseStatus,
              hrNotice: "Asset return confirmed and intake check completed. Status can move back to Available.",
            }
          : item,
      ),
    )
    toast.success("Asset return recorded", {
      description: "This offboarding case is ready for storage intake and status reset to Available.",
    })
  }

  const handleStartTermination = () => {
    const employee = getEmployeeById(terminationEmployeeId)
    const assignedAssets = getAssetsForEmployee(terminationEmployeeId)

    if (!employee || assignedAssets.length === 0) {
      toast.error("Choose an employee with assigned assets")
      return
    }

    const nextCase = {
      id: `OFF-${Date.now()}`,
      employeeId: employee.id,
      initiatedBy: terminationInitiatedBy,
      effectiveDate: terminationEffectiveDate,
      assets: assignedAssets.map((asset) => asset.id),
      recoveryOwner: "HR",
      status: "Pending Retrieval" as OffboardingCaseStatus,
      hrNotice: `Retrieve ${assignedAssets.map((asset) => asset.name).join(", ")} from ${employee.name}.`,
      employeeNotice: `Please return ${assignedAssets.map((asset) => asset.name).join(", ")} by your offboarding appointment.`,
    }

    setOffboardingCases((current) => [nextCase, ...current])
    setIsTerminationDialogOpen(false)
    setTerminationNote("")

    toast.success("Termination workflow started", {
      description: `${employee.name} was added to the retrieval queue and notifications were triggered.`,
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
            <div className="h-8 w-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
              <Send className="h-4 w-4 text-violet-600" />
            </div>
            <div>
              <h1 className="font-semibold text-sm">Distribution Dashboard</h1>
              <p className="text-xs text-muted-foreground">Shared distribution tab with role-specific controls</p>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <BellRing className="h-4 w-4" />
                  {activeRetrievalCases.length > 0 ? (
                    <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-destructive-foreground">
                      {activeRetrievalCases.length}
                    </span>
                  ) : null}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <div className="px-2 py-1.5 text-sm font-medium">Retrieval Notifications</div>
                <Separator />
                {activeRetrievalCases.length > 0 ? (
                  activeRetrievalCases.slice(0, 5).map((item) => {
                    const employee = getEmployeeById(item.employeeId)

                    return (
                      <DropdownMenuItem
                        key={item.id}
                        className="flex flex-col items-start gap-1 py-3"
                        onClick={() => setActiveTab("retrieval")}
                      >
                        <span className="font-medium">{employee?.name}</span>
                        <span className="text-xs text-muted-foreground">{item.status}</span>
                        <span className="text-xs text-muted-foreground">{item.hrNotice}</span>
                      </DropdownMenuItem>
                    )
                  })
                ) : (
                  <div className="px-2 py-3 text-sm text-muted-foreground">
                    No active retrieval notifications.
                  </div>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            {canStartTermination || canAssignAssets ? (
              <div className="flex gap-2">
                {canStartTermination ? (
                  <Button variant="outline" className="gap-2" onClick={() => setIsTerminationDialogOpen(true)}>
                    <AlertTriangle className="h-4 w-4" />
                    Start Termination
                  </Button>
                ) : null}
                {canAssignAssets ? (
                  <Button className="gap-2" onClick={() => setIsAssignDialogOpen(true)}>
                    <Plus className="h-4 w-4" />
                    Assign Asset
                  </Button>
                ) : null}
              </div>
            ) : (
              <Badge variant="outline">
                IT view
              </Badge>
            )}
          </div>
        </div>
      </header>

      <main className="container px-4 py-6">
        {false ? <Card className="mb-6 border-orange-200 bg-orange-50/60">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10">
                <BellRing className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-orange-700">Step 1</p>
                <CardTitle className="text-base">Termination Recovery Workflow</CardTitle>
                <CardDescription>
                  Start with a higher-up submitting the termination. That creates retrieval notifications for HR and for the employee.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2">
              {offboardingCases.map((item) => {
                const employee = getEmployeeById(item.employeeId)
                const assets = item.assets.map((assetId) => getAssetById(assetId)).filter(Boolean)

                return (
                  <div key={item.id} className="rounded-2xl border bg-background p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium">{employee?.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Effective {new Date(item.effectiveDate).toLocaleDateString()} • initiated by {item.initiatedBy}
                        </p>
                      </div>
                      <Badge
                        className={
                          item.status === "Overdue Retrieval"
                            ? "border-red-200 bg-red-500/10 text-red-700"
                            : item.status === "Returned"
                              ? "border-emerald-200 bg-emerald-500/10 text-emerald-700"
                            : "border-orange-200 bg-orange-500/10 text-orange-700"
                        }
                      >
                        {item.status}
                      </Badge>
                    </div>
                    <div className="mt-3 space-y-2 text-sm">
                      <p className="text-muted-foreground">
                        HR notification: {item.hrNotice}
                      </p>
                      <p className="text-muted-foreground">
                        Employee notification: {item.employeeNotice}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>Owner: {item.recoveryOwner}</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                        <span>{assets.map((asset) => asset?.id).join(", ")}</span>
                      </div>
                      <div className="flex flex-wrap gap-2 pt-2">
                        {item.status !== "Returned" ? (
                          <Button size="sm" variant="outline" onClick={() => handleMarkReturned(item.id)}>
                            Mark Returned
                          </Button>
                        ) : null}
                        {item.status === "Pending Retrieval" ? (
                          <Button size="sm" variant="outline" onClick={() => handleEscalateRetrieval(item.id)}>
                            Escalate
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
            <p className="text-xs text-muted-foreground">
              Step 1: higher-up submits termination. Step 2: assets move to Pending Retrieval. Step 3: overdue cases escalate. Step 4: returned assets go back to Available after intake.
            </p>
          </CardContent>
        </Card> : null}

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
            onClick={() => setActiveTab("retrieval")}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors flex items-center gap-2 ${
              activeTab === "retrieval"
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Retrieval
            {activeRetrievalCases.length > 0 && (
              <Badge variant="destructive" className="h-5 px-1.5 text-xs">{activeRetrievalCases.length}</Badge>
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

        {activeTab === "retrieval" && (
          <div className="space-y-4">
            {offboardingCases.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <BellRing className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                  <p className="text-muted-foreground">No retrieval cases</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {offboardingCases.map((item) => {
                  const employee = getEmployeeById(item.employeeId)
                  const assets = item.assets.map((assetId) => getAssetById(assetId)).filter(Boolean)

                  return (
                    <Card key={item.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-medium">{employee?.name}</p>
                            <p className="text-sm text-muted-foreground">
                              Effective {new Date(item.effectiveDate).toLocaleDateString()} | initiated by {item.initiatedBy}
                            </p>
                          </div>
                          <Badge
                            className={
                              item.status === "Overdue Retrieval"
                                ? "border-red-200 bg-red-500/10 text-red-700"
                                : item.status === "Returned"
                                  ? "border-emerald-200 bg-emerald-500/10 text-emerald-700"
                                  : "border-orange-200 bg-orange-500/10 text-orange-700"
                            }
                          >
                            {item.status}
                          </Badge>
                        </div>
                        <div className="mt-3 space-y-2 text-sm">
                          <p className="text-muted-foreground">HR notification: {item.hrNotice}</p>
                          <p className="text-muted-foreground">Employee notification: {item.employeeNotice}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>Owner: {item.recoveryOwner}</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                            <span>{assets.map((asset) => asset?.id).join(", ")}</span>
                          </div>
                          <div className="flex flex-wrap gap-2 pt-2">
                            {item.status !== "Returned" ? (
                              <Button size="sm" variant="outline" onClick={() => handleMarkReturned(item.id)}>
                                Mark Returned
                              </Button>
                            ) : null}
                            {item.status === "Pending Retrieval" ? (
                              <Button size="sm" variant="outline" onClick={() => handleEscalateRetrieval(item.id)}>
                                Escalate
                              </Button>
                            ) : null}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
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

      <Dialog open={isTerminationDialogOpen} onOpenChange={setIsTerminationDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Start Termination Workflow</DialogTitle>
            <DialogDescription>
              Simulate a higher-up submitting a termination so HR and the employee receive asset retrieval notifications.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Submitted By</Label>
              <Select value={terminationInitiatedBy} onValueChange={setTerminationInitiatedBy}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {terminationInitiators.map((initiator) => (
                    <SelectItem key={initiator} value={initiator}>
                      {initiator}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Employee</Label>
              <Select value={terminationEmployeeId} onValueChange={setTerminationEmployeeId}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {employeesWithAssets.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.name} - {employee.department}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Effective Date</Label>
              <Input
                type="date"
                value={terminationEffectiveDate}
                onChange={(event) => setTerminationEffectiveDate(event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Internal Note</Label>
              <Textarea
                placeholder="Optional context for HR and IT follow-up..."
                value={terminationNote}
                onChange={(event) => setTerminationNote(event.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTerminationDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleStartTermination}>
              <AlertTriangle className="mr-2 h-4 w-4" />
              Submit Termination
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
