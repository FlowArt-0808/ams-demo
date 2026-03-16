"use client"

import Image from "next/image"
import Link from "next/link"
import { type ComponentType, useState } from "react"
import {
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  FileCheck2,
  FileWarning,
  Hammer,
  PackageSearch,
  ScanSearch,
  ShieldAlert,
  Trash2,
} from "lucide-react"
import { toast } from "sonner"

import { AssetStatusBadge } from "@/components/demo/asset-status-badge"
import { useDemoRole } from "@/components/demo/demo-role-provider"
import { RolePerspectivePanel } from "@/components/demo/role-perspective-panel"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { type DemoRole } from "@/lib/demo-navigation"
import { getAllAssets, getAssetById, getEmployeeById } from "@/lib/mock-data"

type IncidentStatus = "New" | "Investigating" | "Repair Scheduled" | "Awaiting Disposal" | "Resolved"
type IncidentType = "Missing" | "Broken"
type IncidentSeverity = "Low" | "Medium" | "High" | "Critical"
type DisposalStatus = "Pending Approval" | "Approved" | "Rejected" | "Disposed"
type WipeStatus = "Not Required" | "Pending" | "Uploaded"
type IssueBoardView = "active" | "resolved"

type IncidentCase = {
  id: string
  assetId: string
  type: IncidentType
  severity: IncidentSeverity
  status: IncidentStatus
  summary: string
}

type DisposalCase = {
  id: string
  assetId: string
  sourceIncidentId?: string
  reason: string
  requestedBy: string
  financeStatus: DisposalStatus
  wipeStatus: WipeStatus
}

const incidentTone: Record<IncidentStatus, string> = {
  New: "bg-sky-500/10 text-sky-700 border-sky-200",
  Investigating: "bg-amber-500/10 text-amber-700 border-amber-200",
  "Repair Scheduled": "bg-violet-500/10 text-violet-700 border-violet-200",
  "Awaiting Disposal": "bg-rose-500/10 text-rose-700 border-rose-200",
  Resolved: "bg-emerald-500/10 text-emerald-700 border-emerald-200",
}

const severityTone: Record<IncidentSeverity, string> = {
  Low: "bg-zinc-500/10 text-zinc-700 border-zinc-200",
  Medium: "bg-blue-500/10 text-blue-700 border-blue-200",
  High: "bg-amber-500/10 text-amber-700 border-amber-200",
  Critical: "bg-rose-500/10 text-rose-700 border-rose-200",
}

const disposalTone: Record<DisposalStatus, string> = {
  "Pending Approval": "bg-amber-500/10 text-amber-700 border-amber-200",
  Approved: "bg-blue-500/10 text-blue-700 border-blue-200",
  Rejected: "bg-zinc-500/10 text-zinc-700 border-zinc-200",
  Disposed: "bg-emerald-500/10 text-emerald-700 border-emerald-200",
}

const wipeTone: Record<WipeStatus, string> = {
  "Not Required": "bg-zinc-500/10 text-zinc-700 border-zinc-200",
  Pending: "bg-amber-500/10 text-amber-700 border-amber-200",
  Uploaded: "bg-emerald-500/10 text-emerald-700 border-emerald-200",
}

const initialIncidents: IncidentCase[] = [
  { id: "ISS-2026-001", assetId: "DEL-2024-019", type: "Broken", severity: "High", status: "Repair Scheduled", summary: "Panel damage was confirmed after a floor move, so IT scheduled a repair before retirement." },
  { id: "ISS-2026-002", assetId: "MAC-2025-022", type: "Missing", severity: "Critical", status: "Investigating", summary: "Remote holder could not confirm the laptop location during a spot check and follow-up is open." },
  { id: "ISS-2026-003", assetId: "IPH-2023-002", type: "Broken", severity: "Medium", status: "Awaiting Disposal", summary: "Battery health failed intake inspection and repair cost exceeded the remaining book value." },
  { id: "ISS-2026-004", assetId: "MAC-2026-001", type: "Broken", severity: "Low", status: "Resolved", summary: "Minor hinge issue was tightened, verified, and returned to the employee without replacement." },
]

const initialDisposals: DisposalCase[] = [
  { id: "DSP-2026-001", assetId: "IPH-2023-002", sourceIncidentId: "ISS-2026-003", reason: "Repair cost exceeds residual value after intake inspection.", requestedBy: "HR Admin", financeStatus: "Pending Approval", wipeStatus: "Pending" },
  { id: "DSP-2026-000", assetId: "DEL-2024-019", sourceIncidentId: "ISS-2026-001", reason: "Retirement was reviewed but rejected in favor of repair.", requestedBy: "Inventory Head", financeStatus: "Rejected", wipeStatus: "Not Required" },
]

function needsWipe(assetId: string) {
  const asset = getAssetById(assetId)
  return asset ? asset.category === "Laptop" || asset.category === "Phone" || asset.category === "Tablet" : false
}

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  tone,
}: {
  title: string
  value: string
  description: string
  icon: ComponentType<{ className?: string }>
  tone: string
}) {
  return (
    <Card className="rounded-3xl border-0 shadow-sm">
      <CardContent className="pt-6">
        <div className="flex items-center gap-4">
          <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${tone}`}>
            <Icon className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-3xl font-semibold tracking-tight">{value}</p>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function LifecycleExceptionsWorkspace({
  mode,
  role,
  roleLabel,
}: {
  mode: "issues" | "dispose"
  role: DemoRole
  roleLabel: string
}) {
  const { setRole } = useDemoRole()
  const [incidents, setIncidents] = useState(initialIncidents)
  const [disposals, setDisposals] = useState(initialDisposals)
  const [issueBoardView, setIssueBoardView] = useState<IssueBoardView>("active")
  const [isReportOpen, setIsReportOpen] = useState(false)
  const [reportAssetId, setReportAssetId] = useState("")
  const [reportType, setReportType] = useState<IncidentType>("Broken")
  const [reportSeverity, setReportSeverity] = useState<IncidentSeverity>("Medium")
  const [reportSummary, setReportSummary] = useState("")

  const allAssets = getAllAssets()
  const openIncidents = incidents.filter((item) => item.status !== "Resolved")
  const activeBrokenIncidents = openIncidents.filter((item) => item.type === "Broken")
  const activeMissingIncidents = openIncidents.filter((item) => item.type === "Missing")
  const resolvedIncidents = incidents.filter((item) => item.status === "Resolved")
  const awaitingDisposal = incidents.filter((item) => item.status === "Awaiting Disposal")
  const activeDisposals = disposals.filter((item) => item.financeStatus === "Pending Approval" || item.financeStatus === "Approved")
  const archivedDisposals = disposals.filter((item) => item.financeStatus === "Rejected" || item.financeStatus === "Disposed")
  const canReportIncident = role === "hr" || role === "inventory-head" || role === "system-admin"
  const canResolveMissing = role === "hr" || role === "inventory-head" || role === "system-admin"
  const canAssessDamage = role === "it-admin" || role === "system-admin"
  const canSendToDisposal = role === "hr" || role === "it-admin" || role === "system-admin"
  const canApproveDisposal = role === "finance" || role === "system-admin"
  const canUploadWipe = role === "it-admin" || role === "system-admin"
  const canFinalizeDisposal = role === "it-admin" || role === "system-admin"

  const issueRoleSummary =
    role === "it-admin"
      ? "Assess damaged assets, choose repair versus retirement, and keep technical cases moving. Missing assets stay visible here for shared context."
      : role === "system-admin"
        ? "You can exercise both the reporting side and the technical triage side of this shared queue."
        : "Report new incidents, keep the shared queue accurate, and follow missing assets through recovery. IT owns the technical repair-versus-retire decision for damaged hardware."
  const disposeRoleSummary =
    role === "finance"
      ? "Review retirement requests, approve or reject write-offs, and keep the financial decision trail clear."
      : role === "it-admin"
        ? "Handle the technical disposal steps after approval, including wipe evidence and final completion."
        : role === "system-admin"
          ? "You can exercise the HR, finance, and IT disposal responsibilities from one shared queue."
          : "Monitor the retirement queue, verify the incident context, and hand technical or finance steps to the right team."
  const perspectiveContent =
    mode === "issues"
      ? {
          roles: ["hr", "inventory-head", "it-admin"] as DemoRole[],
          title: "Missing/Broken perspective",
          description: "Switch between the roles that share the incident queue.",
          responsibilities:
            role === "it-admin"
              ? [
                  "Assess broken assets, decide repair versus retirement, and push technical cases forward.",
                  "Keep missing assets visible for context while HR and Inventory handle recovery follow-up.",
                ]
              : role === "system-admin"
                ? [
                    "Exercise both the reporting side and the technical triage side from one shared queue.",
                    "Validate that incident cards and handoffs behave correctly across roles.",
                  ]
                : [
                    "Report new incidents and keep the queue accurate as missing assets are investigated or recovered.",
                    "Hand damaged hardware to IT when repair or retirement needs a technical decision.",
                  ],
          visibility:
            role === "it-admin"
              ? [
                  "All missing and broken asset cards, with technical actions focused on damaged devices.",
                  "Shared queue visibility so technical decisions still stay tied to the full incident context.",
                ]
              : role === "system-admin"
                ? [
                    "Every incident card plus both the reporting and triage actions.",
                    "A combined view of queue work, recovery actions, and disposal handoff actions.",
                  ]
                : [
                    "All missing and broken asset cards, including recovery status and disposal handoff context.",
                    "Shared visibility into technical outcomes without taking over IT-only repair decisions.",
                  ],
        }
      : {
          roles: ["hr", "finance", "it-admin"] as DemoRole[],
          title: "Dispose perspective",
          description: "Switch between the roles that share the disposal queue.",
          responsibilities:
            role === "finance"
              ? [
                  "Approve or reject write-offs and keep the financial decision trail current.",
                  "Leave wipe evidence and final completion to IT after approval.",
                ]
              : role === "it-admin"
                ? [
                    "Upload wipe evidence where needed and finalize disposals after approval.",
                    "Use the queue to verify which assets are ready for technical completion.",
                  ]
                : role === "system-admin"
                  ? [
                      "Exercise HR, finance, and IT disposal steps from one shared queue.",
                      "Validate approval, wipe, and archive transitions across the full flow.",
                    ]
                  : [
                      "Review the incident context and stay aligned on which assets moved from issues into disposal.",
                      "Use the queue as visibility into retirement progress while finance and IT complete their steps.",
                    ],
          visibility:
            role === "finance"
              ? [
                  "Pending approval cards with the asset context needed to make a write-off decision.",
                  "The completed archive so finance can see rejected versus completed retirements.",
                ]
              : role === "it-admin"
                ? [
                    "Approved disposal cards that need wipe evidence or final completion.",
                    "The same queue and archive context, with technical actions exposed where relevant.",
                  ]
                : role === "system-admin"
                  ? [
                      "All disposal cards and all role-specific controls.",
                      "The shared queue plus archive for complete end-to-end verification.",
                    ]
                  : [
                      "The full disposal queue and archive for operational visibility.",
                      "Read-only visibility into finance and IT steps once the handoff has started.",
                    ],
        }

  const updateIncident = (incidentId: string, status: IncidentStatus, summary?: string) => {
    setIncidents((current) => current.map((item) => item.id === incidentId ? { ...item, status, summary: summary ?? item.summary } : item))
  }

  const sendToDisposal = (incidentId: string) => {
    const incident = incidents.find((item) => item.id === incidentId)
    if (!incident) return
    if (disposals.some((item) => item.assetId === incident.assetId && item.financeStatus !== "Rejected" && item.financeStatus !== "Disposed")) {
      toast.message("This asset is already in the disposal queue.")
      updateIncident(incidentId, "Awaiting Disposal")
      return
    }
    setDisposals([{ id: `DSP-2026-${String(disposals.length + 1).padStart(3, "0")}`, assetId: incident.assetId, sourceIncidentId: incident.id, reason: incident.summary, requestedBy: roleLabel, financeStatus: "Pending Approval", wipeStatus: needsWipe(incident.assetId) ? "Pending" : "Not Required" }, ...disposals])
    updateIncident(incidentId, "Awaiting Disposal")
    toast.success("Moved to disposal review", { description: "Finance can now review the write-off request." })
  }

  const createIncident = () => {
    if (!reportAssetId || !reportSummary.trim()) {
      toast.error("Choose an asset and add a short incident summary.")
      return
    }
    setIncidents([{ id: `ISS-2026-${String(incidents.length + 1).padStart(3, "0")}`, assetId: reportAssetId, type: reportType, severity: reportSeverity, status: "New", summary: reportSummary.trim() }, ...incidents])
    setReportAssetId("")
    setReportType("Broken")
    setReportSeverity("Medium")
    setReportSummary("")
    setIsReportOpen(false)
    toast.success("Incident case created", { description: "The asset is now in the exception queue for triage." })
  }

  const approveDisposal = (id: string) => {
    setDisposals((current) => current.map((item) => item.id === id ? { ...item, financeStatus: "Approved" } : item))
    toast.success("Disposal approved")
  }

  const rejectDisposal = (id: string) => {
    const disposal = disposals.find((item) => item.id === id)
    setDisposals((current) => current.map((item) => item.id === id ? { ...item, financeStatus: "Rejected" } : item))
    if (disposal?.sourceIncidentId) updateIncident(disposal.sourceIncidentId, "Repair Scheduled", "Finance rejected retirement. Repair path resumed.")
    toast.success("Disposal rejected")
  }

  const uploadWipe = (id: string) => {
    setDisposals((current) => current.map((item) => item.id === id ? { ...item, wipeStatus: "Uploaded" } : item))
    toast.success("Data wipe certificate recorded")
  }

  const finalizeDisposal = (id: string) => {
    const disposal = disposals.find((item) => item.id === id)
    setDisposals((current) => current.map((item) => item.id === id ? { ...item, financeStatus: "Disposed" } : item))
    if (disposal?.sourceIncidentId) updateIncident(disposal.sourceIncidentId, "Resolved", "Disposed after finance approval and checklist completion.")
    toast.success("Asset moved to disposal archive")
  }

  const renderIncidentCard = (incident: IncidentCase) => {
    const asset = getAssetById(incident.assetId)
    const owner = asset ? getEmployeeById(asset.assignedTo) : undefined

    return (
      <Card key={incident.id} className="min-w-[280px] rounded-3xl border-dashed shadow-none">
        <div className="overflow-hidden rounded-t-3xl border-b border-dashed bg-muted/30">
          <div className="relative aspect-[16/10]">
            <Image
              src="/placeholder.jpg"
              alt={asset ? `${asset.name} preview` : `${incident.assetId} preview`}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-zinc-950/20" />
            <div className="absolute left-4 bottom-4 flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="bg-background/90 backdrop-blur">
                {asset?.category ?? "Asset"}
              </Badge>
              <Badge variant="secondary" className="bg-background/90 backdrop-blur">
                {incident.type}
              </Badge>
            </div>
          </div>
        </div>

        <CardContent className="space-y-4 pt-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className={incidentTone[incident.status]}>{incident.status}</Badge>
            <Badge variant="outline" className={severityTone[incident.severity]}>
              {incident.severity}
            </Badge>
            <Badge variant="outline">{incident.id}</Badge>
            {asset ? <AssetStatusBadge status={asset.status} /> : null}
          </div>

          <div className="space-y-1">
            <p className="text-lg font-semibold">{asset?.name ?? incident.assetId}</p>
            <p className="text-sm text-muted-foreground">
              {incident.assetId}
              {owner ? ` | Holder: ${owner.name}` : ""}
            </p>
          </div>

          <p className="text-sm text-muted-foreground">{incident.summary}</p>

          <div className="flex flex-wrap gap-2 text-xs">
            {asset ? <Badge variant="outline">{asset.location}</Badge> : null}
            {owner ? <Badge variant="outline">{owner.name}</Badge> : null}
          </div>

          <div className="flex flex-wrap gap-2">
            {asset ? (
              <Button asChild variant="outline" className="rounded-xl">
                <Link href={`/storage/assets/${asset.id}`}>Asset detail</Link>
              </Button>
            ) : null}
            {incident.type === "Missing" &&
            incident.status !== "Resolved" &&
            canResolveMissing ? (
              <Button
                variant="outline"
                className="rounded-xl"
                onClick={() =>
                  updateIncident(
                    incident.id,
                    "Resolved",
                    "Recovered after follow-up confirmation and handoff check.",
                  )
                }
              >
                <ScanSearch className="h-4 w-4" />
                Mark recovered
              </Button>
            ) : null}
            {incident.type === "Broken" &&
            incident.status !== "Repair Scheduled" &&
            incident.status !== "Resolved" &&
            canAssessDamage ? (
              <Button
                variant="outline"
                className="rounded-xl"
                onClick={() =>
                  updateIncident(
                    incident.id,
                    "Repair Scheduled",
                    "Repair path approved and scheduled with IT intake.",
                  )
                }
              >
                <Hammer className="h-4 w-4" />
                Schedule repair
              </Button>
            ) : null}
            {incident.status !== "Awaiting Disposal" &&
            incident.status !== "Resolved" &&
            canSendToDisposal ? (
              <Button className="rounded-xl" onClick={() => sendToDisposal(incident.id)}>
                <Trash2 className="h-4 w-4" />
                Send to disposal
              </Button>
            ) : incident.status === "Awaiting Disposal" ? (
              <Button asChild variant="outline" className="rounded-xl">
                <Link href="/?view=dispose">
                  Open disposal queue
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <RolePerspectivePanel
        currentRole={role}
        onRoleChange={setRole}
        roles={perspectiveContent.roles}
        title={perspectiveContent.title}
        description={perspectiveContent.description}
        responsibilities={perspectiveContent.responsibilities}
        visibility={perspectiveContent.visibility}
      />

      <Card className="rounded-[32px] border-0 shadow-sm">
        <CardContent className="flex flex-col gap-5 p-6 md:flex-row md:items-start md:justify-between">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{mode === "issues" ? "Incident Management" : "Disposal Decisions"}</Badge>
              <Badge variant="outline">{roleLabel}</Badge>
              <Badge variant="outline">{awaitingDisposal.length} ready for handoff</Badge>
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-semibold tracking-tight">{mode === "issues" ? "Exception handling between distribution and retirement" : "Disposal review after incident triage"}</h3>
              <p className="max-w-3xl text-sm text-muted-foreground">{mode === "issues" ? "Track damaged or missing assets, assign the next action, and hand off the right cases into disposal review." : "Review write-offs, confirm data wipe requirements, and move approved assets into a completed disposal archive."}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            {mode === "issues" && canReportIncident ? (
              <Button className="rounded-xl" onClick={() => setIsReportOpen(true)}>
                <FileWarning className="h-4 w-4" />
                Report incident
              </Button>
            ) : null}
            <Button asChild variant="outline" className="rounded-xl">
              <Link href={mode === "issues" ? "/?view=dispose" : "/?view=missing-broken"}>
                {mode === "issues" ? "Open disposal queue" : "Open incident queue"}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Open Incidents" value={String(openIncidents.length)} description="Cases still being worked" icon={ShieldAlert} tone="bg-rose-500/10 text-rose-600" />
        <StatCard title="Awaiting Disposal" value={String(awaitingDisposal.length)} description="Issues ready for finance review" icon={ArrowRight} tone="bg-amber-500/10 text-amber-600" />
        <StatCard title="Active Disposal Queue" value={String(activeDisposals.length)} description="Pending approval or completion" icon={Trash2} tone="bg-slate-500/10 text-slate-600" />
        <StatCard title="Archive" value={String(archivedDisposals.length)} description="Rejected or fully disposed" icon={FileCheck2} tone="bg-emerald-500/10 text-emerald-600" />
      </div>

      {mode === "issues" ? (
        <Card className="rounded-[28px] border-0 shadow-sm">
          <CardHeader className="space-y-4">
            <div className="rounded-2xl border border-dashed bg-muted/25 p-4 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">How this role uses the queue</p>
              <p className="mt-1">{issueRoleSummary}</p>
            </div>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle>Incident board</CardTitle>
                <CardDescription>
                  Switch between the live incident board and the resolved asset history.
                </CardDescription>
              </div>
              <div className="inline-flex rounded-2xl border bg-muted/30 p-1">
                <Button
                  variant={issueBoardView === "active" ? "default" : "ghost"}
                  className="rounded-xl"
                  onClick={() => setIssueBoardView("active")}
                >
                  Missing or Broken
                </Button>
                <Button
                  variant={issueBoardView === "resolved" ? "default" : "ghost"}
                  className="rounded-xl"
                  onClick={() => setIssueBoardView("resolved")}
                >
                  Resolved Assets
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {issueBoardView === "active" ? (
              <>
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-lg font-semibold">Broken Assets</p>
                      <p className="text-sm text-muted-foreground">
                        Assets that need repair, review, or retirement handoff.
                      </p>
                    </div>
                    <Badge variant="outline">{activeBrokenIncidents.length} assets</Badge>
                  </div>

                  {activeBrokenIncidents.length > 0 ? (
                    <div className="grid gap-4 xl:grid-cols-2">
                      {activeBrokenIncidents.map(renderIncidentCard)}
                    </div>
                  ) : (
                    <div className="rounded-3xl border border-dashed bg-muted/20 p-8 text-center text-sm text-muted-foreground">
                      No broken assets are active right now.
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-lg font-semibold">Missing Assets</p>
                      <p className="text-sm text-muted-foreground">
                        Assets being investigated, confirmed, or recovered.
                      </p>
                    </div>
                    <Badge variant="outline">{activeMissingIncidents.length} assets</Badge>
                  </div>

                  {activeMissingIncidents.length > 0 ? (
                    <div className="grid gap-4 xl:grid-cols-2">
                      {activeMissingIncidents.map(renderIncidentCard)}
                    </div>
                  ) : (
                    <div className="rounded-3xl border border-dashed bg-muted/20 p-8 text-center text-sm text-muted-foreground">
                      No missing assets are active right now.
                    </div>
                  )}
                </div>
              </>
            ) : resolvedIncidents.length > 0 ? (
              <div className="grid gap-4 xl:grid-cols-2">
                {resolvedIncidents.map(renderIncidentCard)}
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed bg-muted/20 p-8 text-center text-sm text-muted-foreground">
                No resolved assets yet.
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className="rounded-[28px] border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Disposal approval queue</CardTitle>
            <CardDescription>Review write-offs, record wipe evidence, and move completed items into the archive.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl border border-dashed bg-muted/25 p-4 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">How this role uses the queue</p>
              <p className="mt-1">{disposeRoleSummary}</p>
            </div>
            {activeDisposals.map((item) => {
              const asset = getAssetById(item.assetId)
              const owner = asset ? getEmployeeById(asset.assignedTo) : undefined
              const canFinalize = item.financeStatus === "Approved" && (item.wipeStatus === "Not Required" || item.wipeStatus === "Uploaded")
              return (
                <div key={item.id} className="rounded-3xl border border-dashed bg-muted/15 p-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge className={disposalTone[item.financeStatus]}>{item.financeStatus}</Badge>
                        <Badge variant="outline" className={wipeTone[item.wipeStatus]}>Wipe: {item.wipeStatus}</Badge>
                        {asset ? <AssetStatusBadge status={asset.status} /> : null}
                      </div>
                      <div>
                        <p className="text-lg font-semibold">{asset?.name ?? item.assetId}</p>
                        <p className="text-sm text-muted-foreground">{item.assetId}{owner ? ` | Last holder: ${owner.name}` : ""}</p>
                      </div>
                      <p className="max-w-3xl text-sm text-muted-foreground">{item.reason}</p>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline">{item.requestedBy}</Badge>
                        <Badge variant="outline">{item.sourceIncidentId ?? "Direct disposal"}</Badge>
                        {asset ? <Badge variant="outline">{asset.location}</Badge> : null}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {asset ? (
                        <Button asChild variant="outline" className="rounded-xl">
                          <Link href={`/storage/assets/${asset.id}`}>Asset detail</Link>
                        </Button>
                      ) : null}
                      {item.financeStatus === "Pending Approval" && canApproveDisposal ? <Button variant="outline" className="rounded-xl" onClick={() => rejectDisposal(item.id)}>Reject</Button> : null}
                      {item.financeStatus === "Pending Approval" && canApproveDisposal ? <Button className="rounded-xl" onClick={() => approveDisposal(item.id)}>Approve write-off</Button> : null}
                      {item.financeStatus === "Approved" && item.wipeStatus === "Pending" && canUploadWipe ? <Button variant="outline" className="rounded-xl" onClick={() => uploadWipe(item.id)}><ClipboardCheck className="h-4 w-4" />Upload wipe cert</Button> : null}
                      {canFinalize && canFinalizeDisposal ? <Button className="rounded-xl" onClick={() => finalizeDisposal(item.id)}><CheckCircle2 className="h-4 w-4" />Finalize disposal</Button> : null}
                      {item.financeStatus === "Pending Approval" && !canApproveDisposal ? <Badge variant="outline">Finance action</Badge> : null}
                      {item.financeStatus === "Approved" && item.wipeStatus === "Pending" && !canUploadWipe ? <Badge variant="outline">IT action</Badge> : null}
                      {canFinalize && !canFinalizeDisposal ? <Badge variant="outline">IT finalization</Badge> : null}
                    </div>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      )}

      {mode === "dispose" ? (
        <Card className="rounded-[28px] border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Completed archive</CardTitle>
            <CardDescription>
              Closed decisions stay visible here so the queue still tells the whole story in the demo.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            {archivedDisposals.map((item) => (
              <div key={item.id} className="rounded-3xl border border-dashed bg-muted/20 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className={disposalTone[item.financeStatus]}>{item.financeStatus}</Badge>
                  <Badge variant="outline">{item.id}</Badge>
                </div>
                <p className="mt-3 font-medium">{getAssetById(item.assetId)?.name ?? item.assetId}</p>
                <p className="mt-1 text-sm text-muted-foreground">{item.reason}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

      <Dialog open={isReportOpen} onOpenChange={setIsReportOpen}>
        <DialogContent className="rounded-[28px]">
          <DialogHeader>
            <DialogTitle>Report missing or broken asset</DialogTitle>
            <DialogDescription>Create a new exception case and send it into the working queue.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Asset</Label>
              <Select value={reportAssetId} onValueChange={setReportAssetId}>
                <SelectTrigger><SelectValue placeholder="Choose an asset" /></SelectTrigger>
                <SelectContent>{allAssets.map((asset) => <SelectItem key={asset.id} value={asset.id}>{asset.id} | {asset.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Issue Type</Label>
                <Select value={reportType} onValueChange={(value) => setReportType(value as IncidentType)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="Broken">Broken</SelectItem><SelectItem value="Missing">Missing</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Severity</Label>
                <Select value={reportSeverity} onValueChange={(value) => setReportSeverity(value as IncidentSeverity)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="Low">Low</SelectItem><SelectItem value="Medium">Medium</SelectItem><SelectItem value="High">High</SelectItem><SelectItem value="Critical">Critical</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Summary</Label>
              <Textarea value={reportSummary} onChange={(event) => setReportSummary(event.target.value)} rows={4} placeholder="Describe what happened and the immediate next step." />
            </div>
            <div className="space-y-2">
              <Label>Reported by</Label>
              <Input value={roleLabel} disabled />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReportOpen(false)}>Cancel</Button>
            <Button onClick={createIncident}><PackageSearch className="h-4 w-4" />Create case</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
