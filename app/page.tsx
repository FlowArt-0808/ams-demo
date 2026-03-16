"use client"

import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import {
  AlertTriangle,
  ArrowRight,
  Box,
  ClipboardList,
  FileSignature,
  House,
  Package,
  Plus,
  QrCode,
  Settings,
  ShoppingCart,
  Trash2,
  Truck,
  UserCheck,
  Users,
  Warehouse,
} from "lucide-react"

import { StorageWorkspace } from "@/components/demo/storage-workspace"
import { useDemoRole } from "@/components/demo/demo-role-provider"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { mockAssets } from "@/lib/mock-data"
import {
  getActiveMenuId,
  getResolvedMenuItem,
  getRoleOption,
  getScreensForRole,
  getWorkflowSteps,
  type DemoMenuId,
  type DemoScreenId,
  type DemoWorkflow,
} from "@/lib/demo-navigation"

const menuIcons: Record<DemoMenuId, typeof House> = {
  home: House,
  order: ShoppingCart,
  receive: Truck,
  storage: Warehouse,
  distribution: Package,
  "distribution-workflow": Package,
  "missing-broken": AlertTriangle,
  dispose: Trash2,
  settings: Settings,
  qr: QrCode,
}

const screenIcons: Record<DemoScreenId, typeof QrCode> = {
  "hr-census": ClipboardList,
  "auditor-scan": QrCode,
  "employee-assets": UserCheck,
  "hr-distribution": Package,
  "employee-request": Package,
  "employee-acknowledge": FileSignature,
}

const screenStyles: Record<
  DemoScreenId,
  {
    iconWrap: string
    icon: string
  }
> = {
  "hr-census": {
    iconWrap: "bg-blue-500/10",
    icon: "text-blue-600",
  },
  "auditor-scan": {
    iconWrap: "bg-emerald-500/10",
    icon: "text-emerald-600",
  },
  "employee-assets": {
    iconWrap: "bg-amber-500/10",
    icon: "text-amber-600",
  },
  "hr-distribution": {
    iconWrap: "bg-violet-500/10",
    icon: "text-violet-600",
  },
  "employee-request": {
    iconWrap: "bg-cyan-500/10",
    icon: "text-cyan-600",
  },
  "employee-acknowledge": {
    iconWrap: "bg-rose-500/10",
    icon: "text-rose-600",
  },
}

const menuStyles: Record<
  DemoMenuId,
  {
    iconWrap: string
    icon: string
  }
> = {
  home: {
    iconWrap: "bg-zinc-500/10",
    icon: "text-zinc-700",
  },
  order: {
    iconWrap: "bg-sky-500/10",
    icon: "text-sky-600",
  },
  receive: {
    iconWrap: "bg-emerald-500/10",
    icon: "text-emerald-600",
  },
  storage: {
    iconWrap: "bg-amber-500/10",
    icon: "text-amber-600",
  },
  distribution: {
    iconWrap: "bg-violet-500/10",
    icon: "text-violet-600",
  },
  "distribution-workflow": {
    iconWrap: "bg-violet-500/10",
    icon: "text-violet-600",
  },
  "missing-broken": {
    iconWrap: "bg-rose-500/10",
    icon: "text-rose-600",
  },
  dispose: {
    iconWrap: "bg-slate-500/10",
    icon: "text-slate-600",
  },
  settings: {
    iconWrap: "bg-zinc-500/10",
    icon: "text-zinc-700",
  },
  qr: {
    iconWrap: "bg-emerald-500/10",
    icon: "text-emerald-600",
  },
}

const dashboardCategoryRows = [
  { label: "Laptop", count: 2, share: 25, color: "bg-zinc-900" },
  { label: "Monitor", count: 1, share: 13, color: "bg-blue-500" },
  { label: "Peripheral", count: 1, share: 13, color: "bg-green-500" },
  { label: "Phone", count: 1, share: 13, color: "bg-amber-500" },
  { label: "Tablet", count: 1, share: 13, color: "bg-violet-500" },
  { label: "Furniture", count: 1, share: 13, color: "bg-rose-500" },
  { label: "Network", count: 1, share: 13, color: "bg-cyan-500" },
]

const dashboardValueRows = [
  { label: "Laptop", value: "8.2M ₮", share: 48, color: "bg-zinc-900" },
  { label: "Phone", value: "2.9M ₮", share: 29, color: "bg-amber-500" },
  { label: "Tablet", value: "2.2M ₮", share: 21, color: "bg-violet-500" },
  { label: "Furniture", value: "1.6M ₮", share: 15, color: "bg-rose-500" },
  { label: "Monitor", value: "1.3M ₮", share: 13, color: "bg-blue-500" },
  { label: "Network", value: "890K ₮", share: 8, color: "bg-cyan-500" },
  { label: "Peripheral", value: "195K ₮", share: 3, color: "bg-green-500" },
]

const dashboardStatusRows = [
  { label: "Assigned", count: 3, share: 38, color: "#2563eb" },
  { label: "Available", count: 3, share: 38, color: "#16a34a" },
  { label: "In Repair", count: 1, share: 13, color: "#d97706" },
  { label: "Pending Disposal", count: 1, share: 13, color: "#dc2626" },
]

const dashboardRegistrationBars = [
  { label: "Sep", value: 9 },
  { label: "Oct", value: 12 },
  { label: "Nov", value: 8 },
  { label: "Dec", value: 14 },
  { label: "Jan", value: 10 },
  { label: "Feb", value: 16 },
  { label: "Mar", value: 45 },
]

const pendingTasks = [
  { title: "Assignment approvals", count: 6, tone: "bg-amber-500" },
  { title: "Receiving confirmations", count: 5, tone: "bg-emerald-500" },
  { title: "Storage updates", count: 8, tone: "bg-blue-500" },
  { title: "Disposal reviews", count: 4, tone: "bg-rose-500" },
]

const workflowParticipants: Record<DemoWorkflow, string[]> = {
  qr: ["Inventory Head", "Employee"],
  distribution: ["HR", "Employee"],
}

function DashboardOverview() {
  const totalAssets = "1,247"
  const assignedAssets = "892"
  const pendingActions = "23"
  const thisMonth = "+45"

  const recentAssets = mockAssets.slice(0, 4)

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-[28px] bg-muted/40 p-4 md:p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <h3 className="text-2xl font-semibold tracking-tight">Dashboard</h3>
            <p className="text-sm text-muted-foreground">
              Overview of your asset management system
            </p>
          </div>
          <Button className="w-full gap-2 rounded-xl md:w-auto">
            <Plus className="h-4 w-4" />
            Register Asset
          </Button>
        </div>

        <div className="grid gap-3 xl:grid-cols-4 md:grid-cols-2">
          <Card className="rounded-3xl border-0 shadow-sm">
            <CardContent className="pt-6">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Total Assets</p>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted">
                  <Box className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
              <p className="text-4xl font-semibold tracking-tight">{totalAssets}</p>
              <p className="mt-2 text-sm font-medium text-emerald-600">+12%</p>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-0 shadow-sm">
            <CardContent className="pt-6">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Assigned</p>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted">
                  <Users className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
              <p className="text-4xl font-semibold tracking-tight">{assignedAssets}</p>
              <p className="mt-2 text-sm text-muted-foreground">71.5% utilization</p>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-0 bg-zinc-950 text-white shadow-sm">
            <CardContent className="pt-6">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm text-zinc-400">Pending Actions</p>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
                  <AlertTriangle className="h-4 w-4 text-zinc-300" />
                </div>
              </div>
              <p className="text-4xl font-semibold tracking-tight">{pendingActions}</p>
              <p className="mt-2 text-sm text-zinc-400">Require attention</p>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-0 shadow-sm">
            <CardContent className="pt-6">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">This Month</p>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted">
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
              <p className="text-4xl font-semibold tracking-tight">{thisMonth}</p>
              <p className="mt-2 text-sm text-muted-foreground">New registrations</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[2fr_1fr]">
        <Card className="rounded-3xl shadow-sm">
          <CardHeader>
            <CardTitle>Monthly Registrations</CardTitle>
            <CardDescription>Assets added per month</CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="flex h-44 items-end gap-4 rounded-2xl bg-muted/30 px-3 pb-4">
              {dashboardRegistrationBars.map((bar) => (
                <div key={bar.label} className="flex flex-1 flex-col items-center gap-2">
                  <div className="text-xs font-medium text-muted-foreground">
                    {bar.label === "Mar" ? bar.value : ""}
                  </div>
                  <div
                    className={`w-full rounded-xl ${
                      bar.label === "Mar" ? "bg-zinc-950" : "bg-zinc-200"
                    }`}
                    style={{ height: `${Math.max(bar.value * 2.2, 18)}px` }}
                  />
                  <span className="text-xs text-muted-foreground">{bar.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl shadow-sm">
          <CardHeader>
            <CardTitle>Status Overview</CardTitle>
            <CardDescription>Current fleet status</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-5 pt-2 md:flex-row xl:flex-col">
            <div className="flex items-center justify-center">
              <div
                className="relative flex h-32 w-32 items-center justify-center rounded-full"
                style={{
                  background:
                    "conic-gradient(#2563eb 0 38%, #16a34a 38% 76%, #d97706 76% 89%, #dc2626 89% 100%)",
                }}
              >
                <div className="flex h-20 w-20 flex-col items-center justify-center rounded-full bg-background text-center">
                  <span className="text-2xl font-semibold">8</span>
                  <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    Total
                  </span>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              {dashboardStatusRows.map((row) => (
                <div key={row.label} className="flex items-center justify-between gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: row.color }}
                    />
                    <span>{row.label}</span>
                  </div>
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <span>{row.count}</span>
                    <span>{row.share}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card className="rounded-3xl shadow-sm">
          <CardHeader>
            <CardTitle>Assets by Category</CardTitle>
            <CardDescription>Distribution across 7 categories</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {dashboardCategoryRows.map((row) => (
              <div key={row.label} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${row.color}`} />
                    <span>{row.label}</span>
                  </div>
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <span>{row.share}%</span>
                    <span className="font-medium text-foreground">{row.count}</span>
                  </div>
                </div>
                <div className="h-2 rounded-full bg-muted">
                  <div
                    className={`h-2 rounded-full ${row.color}`}
                    style={{ width: `${row.share * 2}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-3xl shadow-sm">
          <CardHeader>
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardTitle>Asset Value Breakdown</CardTitle>
                <CardDescription>Total fleet value by category</CardDescription>
              </div>
              <Badge variant="outline" className="rounded-full px-2.5">
                17.2M ₮
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {dashboardValueRows.map((row) => (
              <div key={row.label} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${row.color}`} />
                    <span>{row.label}</span>
                  </div>
                  <span className="font-medium">{row.value}</span>
                </div>
                <div className="h-2 rounded-full bg-muted">
                  <div
                    className={`h-2 rounded-full ${row.color}`}
                    style={{ width: `${row.share}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[2fr_1fr]">
        <Card className="rounded-3xl shadow-sm">
          <CardHeader>
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardTitle>Recent Assets</CardTitle>
                <CardDescription>Latest items added to the register</CardDescription>
              </div>
              <Button variant="ghost" className="gap-1 text-muted-foreground">
                View all
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-hidden rounded-2xl border">
              <div className="grid grid-cols-[1.2fr_2fr_1.2fr_1.1fr] gap-3 border-b bg-muted/40 px-4 py-3 text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                <span>Asset Tag</span>
                <span>Name</span>
                <span>Category</span>
                <span>Status</span>
              </div>
              {recentAssets.map((asset) => (
                <div
                  key={asset.id}
                  className="grid grid-cols-[1.2fr_2fr_1.2fr_1.1fr] gap-3 border-b px-4 py-3 text-sm last:border-b-0"
                >
                  <span className="font-medium">{asset.id}</span>
                  <span className="truncate">{asset.name}</span>
                  <span>{asset.category}</span>
                  <span>{asset.verified ? "Assigned" : "Available"}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl shadow-sm">
          <CardHeader>
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardTitle>Pending Tasks</CardTitle>
                <CardDescription>4 items</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingTasks.map((task) => (
              <div
                key={task.title}
                className="flex items-center justify-between rounded-2xl border px-3 py-3"
              >
                <div className="flex items-center gap-3">
                  <span className={`h-2.5 w-2.5 rounded-full ${task.tone}`} />
                  <span className="text-sm font-medium">{task.title}</span>
                </div>
                <Badge variant="secondary">{task.count}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function WorkflowOverview({
  workflow,
  screens,
  onOpenStep,
}: {
  workflow: DemoWorkflow
  screens: ReturnType<typeof getWorkflowSteps>
  onOpenStep: (href: string, nextRole: ReturnType<typeof getRoleOption>["id"]) => void
}) {
  const defaultScreen = screens[0]

  return (
    <div className="max-w-4xl space-y-4">
      <Card className="border-dashed bg-muted/30">
        <CardContent className="space-y-4 pt-6">
          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Workflow Roles
            </p>
            <div className="flex flex-wrap gap-2">
              {workflowParticipants[workflow].map((participant) => (
                <Badge
                  key={participant}
                  variant="outline"
                  className="rounded-full px-2.5"
                >
                  {participant}
                </Badge>
              ))}
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Click any step below to switch to that role and open the matching
            screen in the demo.
          </p>
        </CardContent>
      </Card>

      {defaultScreen ? (
        <Tabs defaultValue={defaultScreen.id} className="gap-4">
          <TabsList className="h-auto w-full justify-start rounded-2xl p-1">
            {screens.map((screen) => (
              <TabsTrigger
                key={screen.id}
                value={screen.id}
                className="rounded-xl px-4 py-2 text-left"
              >
                {screen.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {screens.map((screen) => {
            const Icon = screenIcons[screen.id]
            const style = screenStyles[screen.id]
            const ownerRole = getRoleOption(screen.ownerRole)

            return (
              <TabsContent key={screen.id} value={screen.id}>
                <Card className="group transition-colors hover:border-primary/50">
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <div
                        className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl ${style.iconWrap}`}
                      >
                        <Icon className={`h-6 w-6 ${style.icon}`} />
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <CardTitle className="text-lg">{screen.label}</CardTitle>
                          <Badge variant="secondary" className="text-xs">
                            {screen.badge}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {ownerRole.label}
                          </Badge>
                        </div>
                        <CardDescription>{screen.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button
                      className="w-full gap-2 group-hover:bg-primary/90"
                      onClick={() => onOpenStep(screen.href, screen.ownerRole)}
                    >
                      Switch to {ownerRole.label}
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            )
          })}
        </Tabs>
      ) : null}

      {workflow === "qr" ? (
        <Card className="border-dashed bg-muted/25">
          <CardHeader>
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-amber-500/10">
                <UserCheck className="h-6 w-6 text-amber-600" />
              </div>
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <CardTitle className="text-lg">When Employee Scans QR Code</CardTitle>
                  <Badge variant="secondary" className="text-xs">
                    Employee
                  </Badge>
                </div>
                <CardDescription>
                  After scanning the QR sticker, the flow jumps out of the workflow tabs and opens
                  the employee asset page directly.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-2xl border bg-background p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  1. Scan
                </p>
                <p className="mt-2 text-sm font-medium">Employee scans the QR sticker on the asset.</p>
              </div>
              <div className="rounded-2xl border bg-background p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  2. Jump
                </p>
                <p className="mt-2 text-sm font-medium">System opens the employee asset page for that specific asset.</p>
              </div>
              <div className="rounded-2xl border bg-background p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  3. Result
                </p>
                <p className="mt-2 text-sm font-medium">
                  Employee sees ownership, condition, history timeline, action buttons, and other
                  employees with their assigned asset details.
                </p>
              </div>
            </div>

            <div className="rounded-[24px] border bg-background p-5 shadow-sm">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline">Employee Asset Page</Badge>
                    <Badge variant="outline">History Timeline</Badge>
                    <Badge variant="outline">Assign Asset To Myself</Badge>
                    <Badge variant="outline">Employee Ownership Directory</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    This is the screen the employee should land on after scanning. It replaces the
                    old employee QR-scan tab.
                  </p>
                </div>
                <Button
                  className="gap-2"
                  onClick={() => onOpenStep("/employee/assets/MAC-2026-001", "employee")}
                >
                  Open Employee Result
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}

export default function HomePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { role, setRole } = useDemoRole()

  const activeMenuId = getActiveMenuId("/", searchParams)
  const activeRole = getRoleOption(role)
  const activeMenu = getResolvedMenuItem(role, activeMenuId)
  const activeMenuStyle = menuStyles[activeMenuId]
  const ActiveMenuIcon = menuIcons[activeMenuId]
  const activeWorkflow =
    activeMenuId === "distribution-workflow"
      ? "distribution"
      : activeMenuId === "qr"
        ? "qr"
        : null
  const workflowScreens = activeWorkflow ? getWorkflowSteps(activeWorkflow) : []
  const roleScreens = getScreensForRole(role)

  return (
    <div className="min-h-svh bg-background">
      <header className="border-b">
        <div className="container flex h-16 items-center gap-3 px-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Box className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-semibold">Asset Management System</h1>
            <p className="text-xs text-muted-foreground">Clickable Workflow Demo</p>
          </div>
          <Badge variant="outline" className="ml-auto">
            {activeRole.label}
          </Badge>
        </div>
      </header>

      <main className="container px-4 py-8">
        <div className="mb-10 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{activeMenu.label}</Badge>
            <Badge variant="outline">{activeRole.label}</Badge>
          </div>

          <div className="flex items-start gap-4">
            <div
              className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl ${activeMenuStyle.iconWrap}`}
            >
              <ActiveMenuIcon className={`h-7 w-7 ${activeMenuStyle.icon}`} />
            </div>
            <div className="space-y-3">
              <h2 className="text-3xl font-bold tracking-tight text-balance">
                {activeMenu.label}
              </h2>
              <p className="max-w-2xl text-muted-foreground text-balance">
                {activeMenu.description}
              </p>
              <p className="max-w-2xl text-sm text-muted-foreground text-balance">
                Signed in as <span className="font-medium text-foreground">{activeRole.label}</span>.
              </p>
            </div>
          </div>
        </div>

        {activeWorkflow ? (
          <WorkflowOverview
            workflow={activeWorkflow}
            screens={workflowScreens}
            onOpenStep={(href, nextRole) => {
              setRole(nextRole)
              router.push(href)
            }}
          />
        ) : activeMenuId === "home" ? (
          role === "employee" ? (
            <div className="grid gap-4 max-w-3xl">
              {roleScreens.map((screen) => {
                const Icon = screenIcons[screen.id]
                const style = screenStyles[screen.id]

                return (
                  <Card
                    key={screen.id}
                    className="group transition-colors hover:border-primary/50"
                  >
                    <CardHeader>
                      <div className="flex items-start gap-4">
                        <div
                          className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl ${style.iconWrap}`}
                        >
                          <Icon className={`h-6 w-6 ${style.icon}`} />
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-lg">{screen.label}</CardTitle>
                            <Badge variant="secondary" className="text-xs">
                              {screen.badge}
                            </Badge>
                          </div>
                          <CardDescription>{screen.description}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Link href={screen.href}>
                        <Button className="w-full gap-2 group-hover:bg-primary/90">
                          {screen.id === "employee-assets" ? "Verify Asset" : "Open Screen"}
                          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          ) : (
            <DashboardOverview />
          )
        ) : activeMenuId === "storage" ? (
          <StorageWorkspace />
        ) : (
          <Card className="max-w-2xl border-dashed">
            <CardContent className="py-10">
              <div className="mb-4 flex items-center gap-3">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl ${activeMenuStyle.iconWrap}`}
                >
                  <ActiveMenuIcon className={`h-6 w-6 ${activeMenuStyle.icon}`} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{activeMenu.label}</h3>
                  <p className="text-sm text-muted-foreground">
                    Placeholder menu state
                  </p>
                </div>
              </div>
              <p className="max-w-xl text-sm text-muted-foreground">
                This menu option is intentionally present for role-based navigation,
                but it stays as a placeholder for now. The sidebar visibility is live;
                the deeper workflow behind this menu has not been built yet.
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
