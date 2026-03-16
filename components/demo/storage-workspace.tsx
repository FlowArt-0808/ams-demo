"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import QRCode from "qrcode"
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  Clock,
  Download,
  Laptop,
  Link2,
  Monitor,
  Package2,
  Smartphone,
  QrCode,
  Search,
  ShieldAlert,
  Tablet,
  Trash2,
  UserRound,
  Warehouse,
} from "lucide-react"
import { toast } from "sonner"

import { AssetStatusBadge } from "@/components/demo/asset-status-badge"
import { useDemoRole } from "@/components/demo/demo-role-provider"
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  assetCategories,
  assetStatusLabels,
  assetStatuses,
  departments,
  getAllAssets,
  getAssignedAssetCount,
  getEmployeeById,
  mockCensuses,
  type Asset,
  type AssetCategory,
  type Census,
  type Employee,
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

const categoryStyles: Record<
  AssetCategory,
  {
    icon: typeof Laptop
    iconWrap: string
    iconClass: string
    panelClass: string
  }
> = {
  Laptop: {
    icon: Laptop,
    iconWrap: "bg-sky-500/10",
    iconClass: "text-sky-600",
    panelClass: "bg-gradient-to-br from-sky-100 via-sky-50 to-white",
  },
  Monitor: {
    icon: Monitor,
    iconWrap: "bg-indigo-500/10",
    iconClass: "text-indigo-600",
    panelClass: "bg-gradient-to-br from-indigo-100 via-indigo-50 to-white",
  },
  Phone: {
    icon: Smartphone,
    iconWrap: "bg-emerald-500/10",
    iconClass: "text-emerald-600",
    panelClass: "bg-gradient-to-br from-emerald-100 via-emerald-50 to-white",
  },
  Tablet: {
    icon: Tablet,
    iconWrap: "bg-amber-500/10",
    iconClass: "text-amber-600",
    panelClass: "bg-gradient-to-br from-amber-100 via-amber-50 to-white",
  },
  Other: {
    icon: Package2,
    iconWrap: "bg-zinc-500/10",
    iconClass: "text-zinc-700",
    panelClass: "bg-gradient-to-br from-zinc-100 via-zinc-50 to-white",
  },
}

type StorageCategoryGroupId = "it-equipment" | "furniture" | "sport"

const storageCategoryGroups: Array<{
  id: StorageCategoryGroupId
  label: string
  description: string
  icon: typeof Laptop
  iconWrap: string
  iconClass: string
  panelClass: string
  types: AssetCategory[]
}> = [
  {
    id: "it-equipment",
    label: "IT Equipment",
    description: "Laptops, monitors, phones, tablets, and related devices.",
    icon: Laptop,
    iconWrap: "bg-sky-500/10",
    iconClass: "text-sky-600",
    panelClass: "bg-gradient-to-br from-sky-100 via-sky-50 to-white",
    types: ["Laptop", "Monitor", "Phone", "Tablet", "Other"],
  },
  {
    id: "furniture",
    label: "Furniture",
    description: "Desks, chairs, and workplace fixtures tracked in storage.",
    icon: Warehouse,
    iconWrap: "bg-amber-500/10",
    iconClass: "text-amber-600",
    panelClass: "bg-gradient-to-br from-amber-100 via-amber-50 to-white",
    types: [],
  },
  {
    id: "sport",
    label: "Sport",
    description: "Wellness and activity inventory, ready when demo data expands.",
    icon: ShieldAlert,
    iconWrap: "bg-emerald-500/10",
    iconClass: "text-emerald-600",
    panelClass: "bg-gradient-to-br from-emerald-100 via-emerald-50 to-white",
    types: [],
  },
]

const ownershipOptions = [
  { id: "all", label: "All ownership" },
  { id: "assigned", label: "Assigned" },
  { id: "storage", label: "In storage" },
] as const

const conditionOptions = [
  { id: "all", label: "All conditions" },
  { id: "Good", label: "Good" },
  { id: "Fair", label: "Fair" },
  { id: "Damaged", label: "Damaged" },
] as const

const storageHistoricalCensuses: Census[] = [
  {
    id: "CEN-2025-002",
    name: "Q3 2025 Storage Spot Census",
    scope: "Department",
    scopeValue: "Storage",
    startDate: "2025-09-03",
    deadline: "2025-09-12",
    status: "Completed",
    totalAssets: 64,
    verifiedAssets: 64,
    createdAt: "2025-08-29T09:15:00Z",
  },
  {
    id: "CEN-2025-001",
    name: "Q2 2025 IT Equipment Census",
    scope: "Asset Category",
    scopeValue: "Laptop",
    startDate: "2025-06-10",
    deadline: "2025-06-24",
    status: "Completed",
    totalAssets: 118,
    verifiedAssets: 113,
    createdAt: "2025-06-01T08:30:00Z",
  },
  {
    id: "CEN-2024-004",
    name: "Year-End Storage Reconciliation",
    scope: "Full Company",
    startDate: "2024-12-05",
    deadline: "2024-12-20",
    status: "Completed",
    totalAssets: 221,
    verifiedAssets: 219,
    createdAt: "2024-11-28T11:00:00Z",
  },
  {
    id: "CEN-2024-002",
    name: "Remote Device Follow-up Census",
    scope: "Department",
    scopeValue: "Engineering",
    startDate: "2024-05-04",
    deadline: "2024-05-15",
    status: "Overdue",
    totalAssets: 37,
    verifiedAssets: 31,
    createdAt: "2024-04-27T07:45:00Z",
  },
]

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-dashed pb-3 text-sm last:border-b-0 last:pb-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  )
}

function getOwnershipLabel(asset: Asset) {
  const owner = getEmployeeById(asset.assignedTo)

  if (!owner) {
    return {
      name: "In storage",
      subtitle: asset.location,
      department: "Storage",
    }
  }

  return {
    name: owner.name,
    subtitle: owner.title,
    department: owner.department,
  }
}

export function StorageWorkspace() {
  const { role } = useDemoRole()
  const [activeTab, setActiveTab] = useState("categories")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStorageCategory, setSelectedStorageCategory] = useState<StorageCategoryGroupId | "all">("all")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedOwnership, setSelectedOwnership] = useState("all")
  const [selectedCondition, setSelectedCondition] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedDepartment, setSelectedDepartment] = useState("all")
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [selectedAssetId, setSelectedAssetId] = useState("MAC-2026-001")
  const [archivedAssetIds, setArchivedAssetIds] = useState<string[]>([])
  const [origin, setOrigin] = useState("")
  const [qrDataUrl, setQrDataUrl] = useState("")
  const [verifiedAssetIds, setVerifiedAssetIds] = useState<string[]>([])
  const [selectedCensus, setSelectedCensus] = useState<Census | null>(null)
  const [activeCensusView, setActiveCensusView] = useState<"overview" | "current-session">(
    "overview",
  )

  const allAssets = getAllAssets().filter((asset) => !archivedAssetIds.includes(asset.id))
  const selectedAsset = allAssets.find((asset) => asset.id === selectedAssetId) ?? allAssets[0]
  const employeeHref = selectedAsset ? `/employee/assets/${selectedAsset.id}` : ""
  const employeeUrl =
    origin && employeeHref ? new URL(employeeHref, origin).toString() : employeeHref

  const filteredAssets = allAssets.filter((asset) => {
    const ownership = getOwnershipLabel(asset)
    const haystack = [
      asset.id,
      asset.name,
      asset.serialNumber,
      asset.description,
      asset.condition,
      assetStatusLabels[asset.status],
      ownership.name,
      ownership.subtitle,
      ownership.department,
      asset.location,
      String(asset.purchaseCost),
      String(asset.currentBookValue),
    ]
      .join(" ")
      .toLowerCase()

    const matchesSearch =
      searchQuery.trim().length === 0 || haystack.includes(searchQuery.trim().toLowerCase())
    const matchesCategory = selectedCategory === "all" || asset.category === selectedCategory
    const matchesOwnership =
      selectedOwnership === "all" ||
      (selectedOwnership === "assigned" && Boolean(asset.assignedTo)) ||
      (selectedOwnership === "storage" && !asset.assignedTo)
    const matchesCondition =
      selectedCondition === "all" || asset.condition === selectedCondition
    const matchesStatus = selectedStatus === "all" || asset.status === selectedStatus
    const matchesDepartment =
      selectedDepartment === "all" || ownership.department === selectedDepartment

    return (
      matchesSearch &&
      matchesCategory &&
      matchesOwnership &&
      matchesCondition &&
      matchesStatus &&
      matchesDepartment
    )
  })

  const assignedCount = allAssets.filter((asset) => asset.assignedTo).length
  const storageCount = allAssets.filter((asset) => !asset.assignedTo).length
  const flaggedCount = allAssets.filter(
    (asset) => asset.status === "IN_REPAIR" || asset.status === "PENDING_DISPOSAL",
  ).length
  const canArchiveAssets = role === "inventory-head" || role === "system-admin"
  const storageCensusSessions = [...mockCensuses, ...storageHistoricalCensuses].sort(
    (left, right) =>
      new Date(right.startDate).getTime() - new Date(left.startDate).getTime(),
  )
  const activeCensuses = storageCensusSessions.filter((census) => census.status === "Active")
  const currentCensusSession = activeCensuses[0] ?? null
  const previousCensusSessions = storageCensusSessions.filter(
    (census) => census.id !== currentCensusSession?.id,
  )
  const currentCensusProgress = currentCensusSession
    ? Math.round((currentCensusSession.verifiedAssets / currentCensusSession.totalAssets) * 100)
    : 0
  const verifiedCount = allAssets.filter(
    (asset) => asset.verified || verifiedAssetIds.includes(asset.id),
  ).length
  const pendingVerificationAssets = allAssets.filter(
    (asset) => !asset.verified && !verifiedAssetIds.includes(asset.id),
  )
  const discrepancyAssets = allAssets.filter(
    (asset) => asset.status === "IN_REPAIR" || asset.status === "PENDING_DISPOSAL",
  )
  const selectedCensusProgress = selectedCensus
    ? Math.round((selectedCensus.verifiedAssets / selectedCensus.totalAssets) * 100)
    : 0
  const selectedCensusInScopeAssets = selectedCensus
    ? allAssets.filter((asset) => {
        if (selectedCensus.scope === "Full Company") {
          return true
        }

        if (selectedCensus.scope === "Asset Category") {
          return asset.category === selectedCensus.scopeValue
        }

        return getOwnershipLabel(asset).department === selectedCensus.scopeValue
      })
    : []
  const storageCategoryCounts = storageCategoryGroups.map((group) => {
    const assets = allAssets.filter((asset) => group.types.includes(asset.category))

    return {
      ...group,
      count: assets.length,
      assigned: assets.filter((asset) => Boolean(asset.assignedTo)).length,
      flagged: assets.filter(
        (asset) => asset.status === "IN_REPAIR" || asset.status === "PENDING_DISPOSAL",
      ).length,
    }
  })
  const selectedStorageGroup =
    storageCategoryGroups.find((group) => group.id === selectedStorageCategory) ?? null
  const typeCounts = assetCategories
    .filter((category) => selectedStorageGroup?.types.includes(category))
    .map((category) => {
    const assets = allAssets.filter((asset) => asset.category === category)

    return {
      category,
      count: assets.length,
      assigned: assets.filter((asset) => Boolean(asset.assignedTo)).length,
      flagged: assets.filter(
        (asset) => asset.status === "IN_REPAIR" || asset.status === "PENDING_DISPOSAL",
      ).length,
    }
  })
  const activeFilterCount = [
    selectedOwnership !== "all",
    selectedCondition !== "all",
    selectedStatus !== "all",
    selectedDepartment !== "all",
  ].filter(Boolean).length

  useEffect(() => {
    setOrigin(window.location.origin)
  }, [])

  useEffect(() => {
    if (!selectedAsset || !employeeUrl) {
      setQrDataUrl("")
      return
    }

    let cancelled = false

    QRCode.toDataURL(employeeUrl, {
      width: 320,
      margin: 2,
      errorCorrectionLevel: "M",
      color: {
        dark: "#111827",
        light: "#FFFFFF",
      },
    })
      .then((dataUrl: string) => {
        if (!cancelled) {
          setQrDataUrl(dataUrl)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setQrDataUrl("")
          toast.error("Unable to generate the QR code label.")
        }
      })

    return () => {
      cancelled = true
    }
  }, [employeeUrl, selectedAsset?.id])

  useEffect(() => {
    if (selectedStorageCategory === "all" && (activeTab === "types" || activeTab === "category-assets")) {
      setActiveTab("categories")
      return
    }

    if (selectedCategory === "all" && activeTab === "category-assets") {
      setActiveTab("types")
    }
  }, [activeTab, selectedCategory, selectedStorageCategory])

  useEffect(() => {
    if (activeTab !== "census" && activeCensusView !== "overview") {
      setActiveCensusView("overview")
      return
    }

    if (!currentCensusSession && activeCensusView === "current-session") {
      setActiveCensusView("overview")
    }
  }, [activeCensusView, activeTab, currentCensusSession])

  const handleArchiveAsset = (asset: Asset) => {
    setArchivedAssetIds((current) => [...current, asset.id])

    if (selectedAssetId === asset.id) {
      const fallbackAsset = allAssets.find((item) => item.id !== asset.id)
      if (fallbackAsset) {
        setSelectedAssetId(fallbackAsset.id)
      }
    }

    toast.success(`${asset.id} archived from the working list`, {
      description: "The asset card is hidden from this demo view, but audit history is retained.",
    })
  }

  const handleCopyEmployeeLink = async () => {
    if (!employeeUrl) {
      toast.error("QR link is not ready yet.")
      return
    }

    try {
      await navigator.clipboard.writeText(employeeUrl)
      toast.success("Employee asset link copied", {
        description: employeeUrl,
      })
    } catch {
      toast.error("Clipboard access is unavailable in this browser.")
    }
  }

  const resetFilters = () => {
    setSearchQuery("")
    setSelectedOwnership("all")
    setSelectedCondition("all")
    setSelectedStatus("all")
    setSelectedDepartment("all")
  }

  const openCategoryTab = (category: AssetCategory) => {
    setSelectedCategory(category)
    setSearchQuery("")
    setSelectedOwnership("all")
    setSelectedCondition("all")
    setSelectedStatus("all")
    setSelectedDepartment("all")
    setActiveTab("category-assets")
  }

  const openStorageCategoryTab = (categoryId: StorageCategoryGroupId) => {
    setSelectedStorageCategory(categoryId)
    setSelectedCategory("all")
    setSearchQuery("")
    setSelectedOwnership("all")
    setSelectedCondition("all")
    setSelectedStatus("all")
    setSelectedDepartment("all")
    setActiveTab("types")
  }

  const markAssetVerified = (assetId: string) => {
    setVerifiedAssetIds((current) =>
      current.includes(assetId) ? current : [...current, assetId],
    )
    toast.success("Asset marked as verified", {
      description: `${assetId} is now counted in the storage census view.`,
    })
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="rounded-3xl border-0 shadow-sm">
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10">
              <Package2 className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Asset Register</p>
              <p className="text-3xl font-semibold tracking-tight">{allAssets.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-0 shadow-sm">
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10">
              <Warehouse className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">In Storage</p>
              <p className="text-3xl font-semibold tracking-tight">{storageCount}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-0 shadow-sm">
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/10">
              <ShieldAlert className="h-6 w-6 text-rose-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Flagged Assets</p>
              <p className="text-3xl font-semibold tracking-tight">{flaggedCount}</p>
              <p className="text-xs text-muted-foreground">{assignedCount} assigned overall</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="gap-4">
          <TabsList className="h-auto w-full justify-start rounded-2xl p-1 md:w-fit">
            <TabsTrigger value="categories" className="rounded-xl px-4 py-2">
              All Assets (Audit)
            </TabsTrigger>
          <TabsTrigger value="census" className="rounded-xl px-4 py-2">
            Census (тооллого)
          </TabsTrigger>
          {selectedStorageGroup ? (
            <TabsTrigger value="types" className="rounded-xl px-4 py-2">
              {selectedStorageGroup.label} Types
            </TabsTrigger>
          ) : null}
          {selectedCategory !== "all" ? (
            <TabsTrigger value="category-assets" className="rounded-xl px-4 py-2">
              {selectedCategory} Assets
            </TabsTrigger>
          ) : null}
          <TabsTrigger
            value="create-qr-code"
            className="rounded-xl border border-amber-500/60 bg-amber-50 px-4 py-2 font-semibold text-amber-700 shadow-[0_10px_24px_-18px_rgba(245,158,11,0.95)] hover:bg-amber-100 data-[state=active]:border-amber-500 data-[state=active]:bg-amber-500 data-[state=active]:text-white data-[state=active]:shadow-[0_14px_28px_-16px_rgba(245,158,11,0.95)]"
          >
            <QrCode className="h-4 w-4" />
            Create QR Code
          </TabsTrigger>
        </TabsList>

        <TabsContent value="categories" className="space-y-4">
          <Card className="rounded-[28px] border-0 shadow-sm">
            <CardHeader>
              <CardTitle>All Assets (Audit)</CardTitle>
              <CardDescription>
                Start with a category card, then drill into types and individual asset cards.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium">Browse by category</p>
                    <p className="text-sm text-muted-foreground">
                      Click a category card to switch into its types tab.
                    </p>
                  </div>
                  <Badge variant="outline">{storageCategoryCounts.length} categories</Badge>
                </div>

                <div className="grid gap-4 xl:grid-cols-3 md:grid-cols-2">
                  {storageCategoryCounts.map(({ id, label, description, count, assigned, flagged, icon: Icon, iconClass, iconWrap, panelClass }) => {

                    return (
                      <Card
                        key={id}
                        className={`overflow-hidden rounded-[28px] transition-colors ${
                          selectedStorageCategory === id
                            ? "border-primary shadow-sm"
                            : "border-dashed shadow-none hover:border-primary/40"
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => openStorageCategoryTab(id)}
                          className="block w-full text-left"
                        >
                          <div className={`relative aspect-[16/10] border-b border-dashed ${panelClass}`}>
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.9),transparent_45%)]" />
                            <div className="absolute top-4 right-4">
                              <Badge variant="secondary">{count} assets</Badge>
                            </div>
                            <div className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-3">
                              <div className="space-y-1">
                                <Badge variant="outline" className="bg-background/85">
                                  Category view
                                </Badge>
                                <p className="text-xl font-semibold">{label}</p>
                              </div>
                              <div
                                className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-background/90 shadow-sm ${iconWrap}`}
                              >
                                <Icon className={`h-6 w-6 ${iconClass}`} />
                              </div>
                            </div>
                          </div>

                          <CardContent className="space-y-4 pt-6">
                            <p className="text-sm text-muted-foreground">{description}</p>
                            <div className="flex flex-wrap gap-2">
                              <Badge variant="outline">{assigned} assigned</Badge>
                              <Badge variant="outline">{count - assigned} in storage</Badge>
                              <Badge variant="outline">{flagged} flagged</Badge>
                            </div>
                          </CardContent>
                        </button>
                      </Card>
                    )
                  })}
                </div>
              </div>

            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="census" className="space-y-4">
          <Card className="rounded-[28px] border-0 shadow-sm">
            <CardHeader>
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <CardTitle>Storage Census (тооллого)</CardTitle>
                  <CardDescription>
                    Use storage as the operational side of Census (тооллого): track active periods, verify pending assets, and jump into the full census tools when needed.
                  </CardDescription>
                </div>
                <Button asChild className="rounded-xl">
                  <Link href="/auditor/scan">Open Auditor Scanner</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs
                value={activeCensusView}
                onValueChange={(value) =>
                  setActiveCensusView(value as "overview" | "current-session")
                }
                className="gap-6"
              >
                <TabsList className="h-auto w-full justify-start rounded-2xl p-1 md:w-fit">
                  <TabsTrigger value="overview" className="rounded-xl px-4 py-2">
                    Overview
                  </TabsTrigger>
                  {currentCensusSession ? (
                    <TabsTrigger value="current-session" className="rounded-xl px-4 py-2">
                      Current Session
                    </TabsTrigger>
                  ) : null}
                </TabsList>

                <TabsContent value="overview" className="mt-0 space-y-6">
              <div className="grid gap-4 md:grid-cols-4">
                <Card className="rounded-3xl border-dashed shadow-none">
                  <CardContent className="flex items-center gap-4 pt-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500/10">
                      <ClipboardList className="h-6 w-6 text-sky-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Current Census (тооллого)</p>
                      <p className="text-3xl font-semibold tracking-tight">
                        {currentCensusSession ? 1 : 0}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {currentCensusSession ? `${currentCensusProgress}% complete` : "No active session"}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-3xl border-dashed shadow-none">
                  <CardContent className="flex items-center gap-4 pt-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/10">
                      <Clock className="h-6 w-6 text-violet-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Previous Sessions</p>
                      <p className="text-3xl font-semibold tracking-tight">
                        {previousCensusSessions.length}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Historical results kept for reference
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-3xl border-dashed shadow-none">
                  <CardContent className="flex items-center gap-4 pt-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10">
                      <CheckCircle2 className="h-6 w-6 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Pending Verification</p>
                      <p className="text-3xl font-semibold tracking-tight">
                        {pendingVerificationAssets.length}
                      </p>
                      <p className="text-xs text-muted-foreground">Still waiting in the live queue</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-3xl border-dashed shadow-none">
                  <CardContent className="flex items-center gap-4 pt-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/10">
                      <AlertTriangle className="h-6 w-6 text-rose-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Discrepancies</p>
                      <p className="text-3xl font-semibold tracking-tight">{discrepancyAssets.length}</p>
                      <p className="text-xs text-muted-foreground">{verifiedCount} assets already verified</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-4 xl:grid-cols-[1.15fr,0.85fr]">
                <Card className="rounded-[28px] border-dashed shadow-none">
                  <CardHeader>
                    <CardTitle>Current active Census (тооллого) session</CardTitle>
                    <CardDescription>
                      Storage works inside the live session here, while older sessions remain visible as history below.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {currentCensusSession ? (
                      <button
                        type="button"
                        onClick={() => setActiveCensusView("current-session")}
                        className="w-full rounded-[28px] border border-dashed bg-muted/15 p-5 text-left transition-colors hover:border-primary/40 hover:bg-muted/30"
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="secondary">{currentCensusSession.status}</Badge>
                          <Badge variant="outline">{currentCensusSession.scope}</Badge>
                          {currentCensusSession.scopeValue ? (
                            <Badge variant="outline">{currentCensusSession.scopeValue}</Badge>
                          ) : null}
                        </div>

                        <div className="mt-4 space-y-2">
                          <p className="text-xl font-semibold">{currentCensusSession.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {currentCensusSession.verifiedAssets} / {currentCensusSession.totalAssets} verified
                          </p>
                        </div>

                        <div className="mt-4 space-y-2">
                          <div className="h-2 rounded-full bg-muted">
                            <div
                              className="h-2 rounded-full bg-primary"
                              style={{ width: `${currentCensusProgress}%` }}
                            />
                          </div>
                          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
                            <span>
                              {new Date(currentCensusSession.startDate).toLocaleDateString()} -{" "}
                              {new Date(currentCensusSession.deadline).toLocaleDateString()}
                            </span>
                            <span>{currentCensusProgress}% complete</span>
                          </div>
                        </div>
                      </button>
                    ) : (
                      <div className="rounded-3xl border border-dashed bg-muted/20 px-4 py-10 text-center">
                        <p className="font-medium">No active Census (тооллого) right now.</p>
                        <p className="mt-2 text-sm text-muted-foreground">
                          Open the HR census manager to create or start a new verification period.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

              </div>
              <Card className="rounded-[28px] border-dashed shadow-none">
                <CardHeader>
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <CardTitle>Previous census sessions</CardTitle>
                      <CardDescription>
                        Earlier sessions remain visible as finished history with different outcomes, while the current one stays actionable above.
                      </CardDescription>
                    </div>
                    <Badge variant="outline">{previousCensusSessions.length} previous sessions</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 xl:grid-cols-3 md:grid-cols-2">
                    {previousCensusSessions.map((census) => {
                      const progress =
                        census.totalAssets > 0
                          ? Math.round((census.verifiedAssets / census.totalAssets) * 100)
                          : 0

                      return (
                        <button
                          key={census.id}
                          type="button"
                          onClick={() => setSelectedCensus(census)}
                          className="w-full rounded-[28px] border border-dashed bg-muted/15 p-4 text-left transition-colors hover:border-primary/40 hover:bg-muted/30"
                        >
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="secondary">{census.status}</Badge>
                            <Badge variant="outline">{census.scope}</Badge>
                          </div>
                          <div className="mt-4 space-y-1">
                            <p className="font-medium">{census.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {census.scopeValue ?? "All in scope"}
                            </p>
                          </div>
                          <div className="mt-4 grid gap-3 sm:grid-cols-2">
                            <div className="rounded-2xl bg-background p-3">
                              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                                Result
                              </p>
                              <p className="mt-2 font-medium">
                                {census.verifiedAssets} / {census.totalAssets}
                              </p>
                            </div>
                            <div className="rounded-2xl bg-background p-3">
                              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                                Completion
                              </p>
                              <p className="mt-2 font-medium">{progress}%</p>
                            </div>
                          </div>
                          <p className="mt-4 text-xs text-muted-foreground">
                            {new Date(census.startDate).toLocaleDateString()} -{" "}
                            {new Date(census.deadline).toLocaleDateString()}
                          </p>
                        </button>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

                </TabsContent>

                <TabsContent value="current-session" className="mt-0 space-y-6">
                  <Card className="rounded-[28px] border-dashed shadow-none">
                    <CardHeader>
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div>
                          <CardTitle>{currentCensusSession?.name ?? "Current Census Session"}</CardTitle>
                          <CardDescription>
                            This tab is the live working space for the active storage-side census session.
                          </CardDescription>
                        </div>
                        <Button
                          variant="outline"
                          className="rounded-xl"
                          onClick={() => setActiveCensusView("overview")}
                        >
                          Back to Overview
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {currentCensusSession ? (
                        <>
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="secondary">{currentCensusSession.status}</Badge>
                            <Badge variant="outline">{currentCensusSession.scope}</Badge>
                            {currentCensusSession.scopeValue ? (
                              <Badge variant="outline">{currentCensusSession.scopeValue}</Badge>
                            ) : null}
                            <Badge variant="outline">{pendingVerificationAssets.length} pending</Badge>
                          </div>
                          <div className="space-y-2">
                            <div className="h-2 rounded-full bg-muted">
                              <div
                                className="h-2 rounded-full bg-primary"
                                style={{ width: `${currentCensusProgress}%` }}
                              />
                            </div>
                            <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
                              <span className="text-muted-foreground">
                                {currentCensusSession.verifiedAssets} / {currentCensusSession.totalAssets} verified
                              </span>
                              <span className="font-medium">{currentCensusProgress}% complete</span>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="rounded-3xl border border-dashed bg-muted/20 px-4 py-10 text-center">
                          <p className="font-medium">No active session is available right now.</p>
                          <p className="mt-2 text-sm text-muted-foreground">
                            Return to overview or start a new census from the HR side.
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

              <Card className="rounded-[28px] border-dashed shadow-none">
                <CardHeader>
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <CardTitle>Pending verification assets</CardTitle>
                      <CardDescription>
                        Storage can work this queue directly and mark assets as verified for the demo session.
                      </CardDescription>
                    </div>
                    <Badge variant="outline">{pendingVerificationAssets.length} pending</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {pendingVerificationAssets.length > 0 ? (
                    <div className="grid gap-4 xl:grid-cols-3 md:grid-cols-2">
                      {pendingVerificationAssets.slice(0, 6).map((asset) => {
                        const owner = getEmployeeById(asset.assignedTo)
                        const ownership = getOwnershipLabel(asset)

                        return (
                          <Card key={asset.id} className="overflow-hidden rounded-[28px] border-dashed shadow-none">
                            <div className="relative aspect-[16/10] border-b border-dashed bg-muted/30">
                              <Image
                                src="/placeholder.jpg"
                                alt={`${asset.name} preview`}
                                fill
                                className="object-cover"
                              />
                              <div className="absolute inset-0 bg-zinc-950/20" />
                              <div className="absolute right-4 bottom-4 left-4 flex flex-wrap items-center gap-2">
                                <Badge variant="secondary" className="bg-background/90 backdrop-blur">
                                  {asset.category}
                                </Badge>
                                <Badge variant="outline" className="bg-background/90">
                                  Pending census
                                </Badge>
                              </div>
                            </div>

                            <CardContent className="space-y-4 pt-6">
                              <div className="space-y-1">
                                <p className="text-lg font-semibold">{asset.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {asset.id} | {asset.serialNumber}
                                </p>
                              </div>

                              <div className="grid gap-3 sm:grid-cols-2">
                                <div className="rounded-2xl bg-muted/35 p-3">
                                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                                    Ownership
                                  </p>
                                  {owner ? (
                                    <button
                                      type="button"
                                      onClick={() => setSelectedEmployee(owner)}
                                      className="mt-2 space-y-1 text-left transition-opacity hover:opacity-80"
                                    >
                                      <p className="font-medium text-primary">{ownership.name}</p>
                                      <p className="text-sm text-muted-foreground">{ownership.subtitle}</p>
                                    </button>
                                  ) : (
                                    <div className="mt-2 space-y-1">
                                      <p className="font-medium">{ownership.name}</p>
                                      <p className="text-sm text-muted-foreground">{ownership.subtitle}</p>
                                    </div>
                                  )}
                                </div>

                                <div className="rounded-2xl bg-muted/35 p-3">
                                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                                    Location
                                  </p>
                                  <p className="mt-2 font-medium">{asset.location}</p>
                                  <p className="text-sm text-muted-foreground">{ownership.department}</p>
                                </div>
                              </div>

                              <div className="flex flex-wrap gap-2">
                                <Button
                                  className="rounded-xl"
                                  onClick={() => markAssetVerified(asset.id)}
                                >
                                  <CheckCircle2 className="h-4 w-4" />
                                  Mark verified
                                </Button>
                                <Button asChild variant="outline" className="rounded-xl">
                                  <Link href={`/storage/assets/${asset.id}`}>Asset detail</Link>
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="rounded-3xl border border-dashed bg-muted/20 px-4 py-12 text-center">
                      <p className="font-medium">No pending verification assets.</p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Everything in the storage-side census queue is already verified for this demo session.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="types" className="space-y-4">
          <Card className="rounded-[28px] border-0 shadow-sm">
            <CardHeader>
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <CardTitle>{selectedStorageGroup?.label ?? "Category"} types</CardTitle>
                  <CardDescription>
                    Choose a type inside this storage category to open the matching asset cards.
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  className="rounded-xl"
                  onClick={() => setActiveTab("categories")}
                >
                  Back to All Assets
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {typeCounts.length > 0 ? (
                <div className="grid gap-4 xl:grid-cols-3 md:grid-cols-2">
                  {typeCounts.map(({ category, count, assigned, flagged }) => {
                    const style = categoryStyles[category]
                    const Icon = style.icon

                    return (
                      <Card
                        key={category}
                        className={`overflow-hidden rounded-[28px] transition-colors ${
                          selectedCategory === category
                            ? "border-primary shadow-sm"
                            : "border-dashed shadow-none hover:border-primary/40"
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => openCategoryTab(category)}
                          className="block w-full text-left"
                        >
                          <div className={`relative aspect-[16/10] border-b border-dashed ${style.panelClass}`}>
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.9),transparent_45%)]" />
                            <div className="absolute top-4 right-4">
                              <Badge variant="secondary">{count} assets</Badge>
                            </div>
                            <div className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-3">
                              <div className="space-y-1">
                                <Badge variant="outline" className="bg-background/85">
                                  Type view
                                </Badge>
                                <p className="text-xl font-semibold">{category}</p>
                              </div>
                              <div
                                className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-background/90 shadow-sm ${style.iconWrap}`}
                              >
                                <Icon className={`h-6 w-6 ${style.iconClass}`} />
                              </div>
                            </div>
                          </div>

                          <CardContent className="space-y-4 pt-6">
                            <p className="text-sm text-muted-foreground">
                              Open the {category.toLowerCase()} asset tab and browse that type.
                            </p>
                            <div className="flex flex-wrap gap-2">
                              <Badge variant="outline">{assigned} assigned</Badge>
                              <Badge variant="outline">{count - assigned} in storage</Badge>
                              <Badge variant="outline">{flagged} flagged</Badge>
                            </div>
                          </CardContent>
                        </button>
                      </Card>
                    )
                  })}
                </div>
              ) : (
                <div className="rounded-3xl border border-dashed bg-muted/20 px-4 py-12 text-center">
                  <div className="space-y-2">
                    <p className="font-medium">No types are seeded for this category yet.</p>
                    <p className="text-sm text-muted-foreground">
                      This category structure is ready, but the current demo data is still focused on IT equipment.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="category-assets" className="space-y-4">
          <Card className="rounded-[28px] border-0 shadow-sm">
            <CardHeader>
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <CardTitle>{selectedCategory} asset cards</CardTitle>
                  <CardDescription>
                    Search and filter within the selected type, then open the matching asset cards.
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  className="rounded-xl"
                  onClick={() => setActiveTab("types")}
                >
                  Back to Types
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">Search</p>
                <div className="relative">
                  <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    className="pl-9"
                    placeholder={`Search within ${selectedCategory.toLowerCase()} assets...`}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3 rounded-[24px] border border-dashed bg-muted/20 p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-sm font-medium">Filters</p>
                    <p className="text-sm text-muted-foreground">
                      Use filters separately from search to narrow the selected type.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline">{activeFilterCount} active filters</Badge>
                    <Button
                      variant="ghost"
                      className="rounded-xl"
                      onClick={resetFilters}
                      disabled={activeFilterCount === 0}
                    >
                      Reset filters
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      Status
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant={selectedStatus === "all" ? "default" : "outline"}
                        className="rounded-full"
                        onClick={() => setSelectedStatus("all")}
                      >
                        Any status
                      </Button>
                      {assetStatuses.map((status) => (
                        <Button
                          key={status}
                          variant={selectedStatus === status ? "default" : "outline"}
                          className="rounded-full"
                          onClick={() => setSelectedStatus(status)}
                        >
                          {assetStatusLabels[status]}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      Ownership
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {ownershipOptions.map((option) => (
                        <Button
                          key={option.id}
                          variant={selectedOwnership === option.id ? "default" : "outline"}
                          className="rounded-full"
                          onClick={() => setSelectedOwnership(option.id)}
                        >
                          {option.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      Condition
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {conditionOptions.map((option) => (
                        <Button
                          key={option.id}
                          variant={selectedCondition === option.id ? "default" : "outline"}
                          className="rounded-full"
                          onClick={() => setSelectedCondition(option.id)}
                        >
                          {option.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-3 lg:grid-cols-[1fr,auto] lg:items-end">
                    <div className="space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                        Department
                      </p>
                      <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                        <SelectTrigger className="w-full lg:max-w-xs">
                          <SelectValue placeholder="Department" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Any department</SelectItem>
                          {departments.map((department) => (
                            <SelectItem key={department} value={department}>
                              {department}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex flex-wrap gap-2 lg:justify-end">
                      {selectedStorageGroup ? (
                        <Badge variant="secondary">Category: {selectedStorageGroup.label}</Badge>
                      ) : null}
                      {selectedCategory !== "all" ? (
                        <Badge variant="secondary">Type: {selectedCategory}</Badge>
                      ) : null}
                      {selectedOwnership !== "all" ? (
                        <Badge variant="secondary">Ownership: {ownershipOptions.find((option) => option.id === selectedOwnership)?.label}</Badge>
                      ) : null}
                      {selectedCondition !== "all" ? (
                        <Badge variant="secondary">Condition: {selectedCondition}</Badge>
                      ) : null}
                      {selectedStatus !== "all" ? (
                        <Badge variant="secondary">Status: {assetStatusLabels[selectedStatus as keyof typeof assetStatusLabels]}</Badge>
                      ) : null}
                      {selectedDepartment !== "all" ? (
                        <Badge variant="secondary">Department: {selectedDepartment}</Badge>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-muted-foreground">
                  Showing <span className="font-medium text-foreground">{filteredAssets.length}</span>{" "}
                  {selectedCategory === "all"
                    ? "assets as cards."
                    : `${selectedCategory.toLowerCase()} assets as cards.`}
                </p>
                <Badge variant="outline">Card-first register view</Badge>
              </div>

              {filteredAssets.length === 0 ? (
                <div className="rounded-3xl border border-dashed bg-muted/20 px-4 py-12 text-center">
                  <div className="space-y-2">
                    <p className="font-medium">No assets match the current filters.</p>
                    <p className="text-sm text-muted-foreground">
                      Try a broader search or reset one of the filters above.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid gap-4 xl:grid-cols-3 md:grid-cols-2">
                  {filteredAssets.map((asset) => {
                    const owner = getEmployeeById(asset.assignedTo)
                    const ownership = getOwnershipLabel(asset)

                    return (
                      <Card key={asset.id} className="overflow-hidden rounded-[28px] border-dashed shadow-none">
                        <div className="relative aspect-[16/10] border-b border-dashed bg-muted/30">
                          <Image
                            src="/placeholder.jpg"
                            alt={`${asset.name} preview`}
                            fill
                            className="object-cover"
                          />
                          <div className="absolute inset-0 bg-zinc-950/20" />
                          <div className="absolute right-4 bottom-4 left-4 flex flex-wrap items-center gap-2">
                            <Badge variant="secondary" className="bg-background/90 backdrop-blur">
                              {asset.category}
                            </Badge>
                            <AssetStatusBadge status={asset.status} />
                            <Badge variant="outline" className={`${conditionClasses[asset.condition]} bg-background/90`}>
                              {asset.condition}
                            </Badge>
                          </div>
                        </div>

                        <CardContent className="space-y-4 pt-6">
                          <div className="space-y-1">
                            <p className="text-lg font-semibold">{asset.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {asset.id} | {asset.serialNumber}
                            </p>
                          </div>

                          <p className="text-sm text-muted-foreground">{asset.description}</p>

                          <div className="grid gap-3 sm:grid-cols-2">
                            <div className="rounded-2xl bg-muted/35 p-3">
                              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                                Ownership
                              </p>
                              {owner ? (
                                <button
                                  type="button"
                                  onClick={() => setSelectedEmployee(owner)}
                                  className="mt-2 space-y-1 text-left transition-opacity hover:opacity-80"
                                >
                                  <p className="font-medium text-primary">{ownership.name}</p>
                                  <p className="text-sm text-muted-foreground">{ownership.subtitle}</p>
                                </button>
                              ) : (
                                <div className="mt-2 space-y-1">
                                  <p className="font-medium">{ownership.name}</p>
                                  <p className="text-sm text-muted-foreground">{ownership.subtitle}</p>
                                </div>
                              )}
                            </div>

                            <div className="rounded-2xl bg-muted/35 p-3">
                              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                                Location
                              </p>
                              <p className="mt-2 font-medium">{asset.location}</p>
                              <p className="text-sm text-muted-foreground">{ownership.department}</p>
                            </div>
                          </div>

                          <div className="grid gap-3 sm:grid-cols-2">
                            <div className="rounded-2xl border border-dashed p-3">
                              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                                Purchase Cost
                              </p>
                              <p className="mt-2 font-medium">
                                {currencyFormatter.format(asset.purchaseCost)}
                              </p>
                            </div>
                            <div className="rounded-2xl border border-dashed p-3">
                              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                                Book Value
                              </p>
                              <p className="mt-2 font-medium">
                                {currencyFormatter.format(asset.currentBookValue)}
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <Button asChild className="rounded-xl">
                              <Link href={`/storage/assets/${asset.id}`}>Asset detail</Link>
                            </Button>
                            <Button asChild variant="outline" className="rounded-xl">
                              <Link href={`/employee/assets/${asset.id}`}>Employee QR page</Link>
                            </Button>
                            {canArchiveAssets ? (
                              <Button
                                variant="ghost"
                                className="rounded-xl text-muted-foreground"
                                aria-label={`Archive ${asset.id}`}
                                onClick={() => handleArchiveAsset(asset)}
                              >
                                <Trash2 className="h-4 w-4" />
                                Archive
                              </Button>
                            ) : null}
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}

              <p className="text-xs text-muted-foreground">
                Inventory can archive an asset from this working list in the demo; the real system
                would keep the audit trail and historical record.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="create-qr-code" className="space-y-4">
          <Card className="rounded-[28px] border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Create an employee QR label</CardTitle>
              <CardDescription>
                Each QR code points to an employee-facing page. Authorized roles can still use the
                internal asset detail record separately.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 xl:grid-cols-[1.15fr,0.85fr]">
              <div className="space-y-4">
                <div className="grid gap-3 md:grid-cols-[1.4fr,0.6fr]">
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Choose asset</p>
                    <Select
                      value={selectedAsset?.id ?? ""}
                      onValueChange={(value) => setSelectedAssetId(value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select an asset" />
                      </SelectTrigger>
                      <SelectContent>
                        {allAssets.map((asset) => (
                          <SelectItem key={asset.id} value={asset.id}>
                            {asset.id} | {asset.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium">Employee page</p>
                    <Button asChild variant="outline" className="w-full justify-start rounded-xl">
                      <Link href={employeeHref}>
                        <Link2 className="h-4 w-4" />
                        Open page
                      </Link>
                    </Button>
                  </div>
                </div>

                {selectedAsset && (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Card className="rounded-3xl border-dashed">
                      <CardContent className="space-y-3 pt-6">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-sm text-muted-foreground">Selected asset</p>
                            <p className="text-lg font-semibold">{selectedAsset.id}</p>
                          </div>
                          <AssetStatusBadge status={selectedAsset.status} />
                        </div>
                        <p className="text-sm font-medium">{selectedAsset.name}</p>
                        <p className="text-sm text-muted-foreground">{selectedAsset.description}</p>
                      </CardContent>
                    </Card>

                    <Card className="rounded-3xl border-dashed">
                      <CardContent className="space-y-3 pt-6">
                        <DetailRow label="Owner" value={getOwnershipLabel(selectedAsset).name} />
                        <DetailRow label="Location" value={selectedAsset.location} />
                        <DetailRow
                          label="Cost"
                          value={currencyFormatter.format(selectedAsset.purchaseCost)}
                        />
                      </CardContent>
                    </Card>
                  </div>
                )}

                <div className="flex flex-wrap gap-3">
                  <Button onClick={handleCopyEmployeeLink} className="rounded-xl">
                    <Link2 className="h-4 w-4" />
                    Copy employee link
                  </Button>
                  {selectedAsset && (
                    <Button asChild variant="outline" className="rounded-xl">
                      <Link href={`/storage/assets/${selectedAsset.id}`}>Open internal detail</Link>
                    </Button>
                  )}
                  {qrDataUrl ? (
                    <Button asChild variant="outline" className="rounded-xl">
                      <a href={qrDataUrl} download={`${selectedAsset?.id}-qr.png`}>
                        <Download className="h-4 w-4" />
                        Download QR PNG
                      </a>
                    </Button>
                  ) : (
                    <Button variant="outline" className="rounded-xl" disabled>
                      <Download className="h-4 w-4" />
                      Download QR PNG
                    </Button>
                  )}
                </div>
              </div>

              <Card className="rounded-[28px] border bg-muted/20 shadow-none">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-zinc-900 text-white">
                      <QrCode className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">QR label preview</CardTitle>
                      <CardDescription>Scans to the employee-facing asset page.</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-[28px] bg-white p-5 shadow-sm">
                    <div className="mx-auto flex w-full max-w-[260px] flex-col items-center gap-4 text-center">
                      {qrDataUrl ? (
                        <img
                          src={qrDataUrl}
                          alt={`QR code for ${selectedAsset?.id ?? "selected asset"}`}
                          className="h-[220px] w-[220px]"
                        />
                      ) : (
                        <div className="flex h-[220px] w-[220px] items-center justify-center rounded-3xl border border-dashed text-sm text-muted-foreground">
                          QR preview loading
                        </div>
                      )}
                      <div>
                        <p className="font-semibold">{selectedAsset?.id}</p>
                        <p className="text-sm text-muted-foreground">{selectedAsset?.name}</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-dashed bg-background p-4">
                    <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                      Encoded destination
                    </p>
                    <p className="mt-2 break-all text-sm font-medium">{employeeUrl || employeeHref}</p>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={Boolean(selectedEmployee)} onOpenChange={() => setSelectedEmployee(null)}>
        <DialogContent className="max-w-xl rounded-[28px]">
          {selectedEmployee && (
            <>
              <DialogHeader>
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10">
                    <UserRound className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="space-y-1">
                    <DialogTitle>{selectedEmployee.name}</DialogTitle>
                    <DialogDescription>
                      {selectedEmployee.title} | {selectedEmployee.department}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="grid gap-4 md:grid-cols-[0.95fr,1.05fr]">
                <Card className="rounded-3xl border-dashed shadow-none">
                  <CardContent className="space-y-3 pt-6">
                    <DetailRow label="Employee ID" value={selectedEmployee.id} />
                    <DetailRow label="Email" value={selectedEmployee.email} />
                    <DetailRow label="Phone" value={selectedEmployee.phone} />
                    <DetailRow label="Branch" value={selectedEmployee.branch} />
                  </CardContent>
                </Card>

                <Card className="rounded-3xl border-dashed shadow-none">
                  <CardContent className="space-y-3 pt-6">
                    <DetailRow
                      label="Assigned assets"
                      value={String(getAssignedAssetCount(selectedEmployee.id))}
                    />
                    <DetailRow label="Department" value={selectedEmployee.department} />
                    <DetailRow label="Role" value={selectedEmployee.title} />
                    <DetailRow label="Visibility" value="Relevant internal roles only" />
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(selectedCensus)} onOpenChange={() => setSelectedCensus(null)}>
        <DialogContent className="max-w-4xl rounded-[28px]">
          {selectedCensus ? (
            <>
              <DialogHeader>
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">{selectedCensus.status}</Badge>
                    <Badge variant="outline">{selectedCensus.scope}</Badge>
                    {selectedCensus.scopeValue ? (
                      <Badge variant="outline">{selectedCensus.scopeValue}</Badge>
                    ) : null}
                  </div>
                  <div>
                    <DialogTitle>{selectedCensus.name}</DialogTitle>
                    <DialogDescription>{selectedCensus.id}</DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="grid gap-4 md:grid-cols-4">
                <Card className="rounded-3xl border-dashed shadow-none">
                  <CardContent className="space-y-2 pt-6">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      Completion
                    </p>
                    <p className="text-3xl font-semibold tracking-tight">
                      {selectedCensusProgress}%
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {selectedCensus.verifiedAssets} of {selectedCensus.totalAssets} verified
                    </p>
                  </CardContent>
                </Card>

                <Card className="rounded-3xl border-dashed shadow-none">
                  <CardContent className="space-y-2 pt-6">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      Remaining
                    </p>
                    <p className="text-3xl font-semibold tracking-tight">
                      {selectedCensus.totalAssets - selectedCensus.verifiedAssets}
                    </p>
                    <p className="text-sm text-muted-foreground">Still unresolved in this session</p>
                  </CardContent>
                </Card>

                <Card className="rounded-3xl border-dashed shadow-none">
                  <CardContent className="space-y-2 pt-6">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      In Scope
                    </p>
                    <p className="text-3xl font-semibold tracking-tight">
                      {selectedCensus.totalAssets}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {selectedCensus.scopeValue ?? "Full company scope"}
                    </p>
                  </CardContent>
                </Card>

                <Card className="rounded-3xl border-dashed shadow-none">
                  <CardContent className="space-y-2 pt-6">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      Created
                    </p>
                    <p className="text-lg font-semibold">
                      {new Date(selectedCensus.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-muted-foreground">Session creation date</p>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-3">
                <div className="h-2 rounded-full bg-muted">
                  <div
                    className="h-2 rounded-full bg-primary"
                    style={{ width: `${selectedCensusProgress}%` }}
                  />
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
                  <span className="text-muted-foreground">
                    {new Date(selectedCensus.startDate).toLocaleDateString()} -{" "}
                    {new Date(selectedCensus.deadline).toLocaleDateString()}
                  </span>
                  <span className="font-medium">{selectedCensusProgress}% complete</span>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Card className="rounded-3xl border-dashed shadow-none">
                  <CardContent className="space-y-3 pt-6">
                    <DetailRow label="Scope" value={selectedCensus.scope} />
                    <DetailRow label="Scope value" value={selectedCensus.scopeValue ?? "All in scope"} />
                    <DetailRow label="Status" value={selectedCensus.status} />
                  </CardContent>
                </Card>

                <Card className="rounded-3xl border-dashed shadow-none">
                  <CardContent className="space-y-3 pt-6">
                    <DetailRow
                      label="Date range"
                      value={`${new Date(selectedCensus.startDate).toLocaleDateString()} - ${new Date(selectedCensus.deadline).toLocaleDateString()}`}
                    />
                    <DetailRow
                      label="Progress"
                      value={`${selectedCensus.verifiedAssets} / ${selectedCensus.totalAssets}`}
                    />
                    <DetailRow
                      label="Remaining"
                      value={String(selectedCensus.totalAssets - selectedCensus.verifiedAssets)}
                    />
                  </CardContent>
                </Card>
              </div>

              <Card className="rounded-[28px] border-dashed shadow-none">
                <CardHeader>
                  <CardTitle>Session outcome</CardTitle>
                  <CardDescription>
                    A quick read of how this census session finished or where it currently stands.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="rounded-3xl border border-dashed bg-muted/20 p-4">
                    <p className="font-medium">
                      {selectedCensus.status === "Completed"
                        ? "This session finished and its results are now historical."
                        : selectedCensus.status === "Active"
                          ? "This session is still live and should be worked from the current-session tab."
                          : selectedCensus.status === "Overdue"
                            ? "This session missed its deadline and still has unresolved verification work."
                            : "This session is still being prepared before it becomes active."}
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Scope: {selectedCensus.scopeValue ?? "All in scope"} | Verified:{" "}
                      {selectedCensus.verifiedAssets} / {selectedCensus.totalAssets}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-[28px] border-dashed shadow-none">
                <CardHeader>
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <CardTitle>Example assets in this session</CardTitle>
                      <CardDescription>
                        A few asset cards that fit this session's scope so the record feels concrete.
                      </CardDescription>
                    </div>
                    <Badge variant="outline">
                      {Math.min(selectedCensusInScopeAssets.length, 4)} shown
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {selectedCensusInScopeAssets.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                      {selectedCensusInScopeAssets.slice(0, 4).map((asset) => {
                        const ownership = getOwnershipLabel(asset)

                        return (
                          <Card
                            key={asset.id}
                            className="overflow-hidden rounded-[28px] border-dashed shadow-none"
                          >
                            <div className="relative aspect-[16/10] border-b border-dashed bg-muted/30">
                              <Image
                                src="/placeholder.jpg"
                                alt={`${asset.name} preview`}
                                fill
                                className="object-cover"
                              />
                              <div className="absolute inset-0 bg-zinc-950/20" />
                              <div className="absolute right-4 bottom-4 left-4 flex flex-wrap items-center gap-2">
                                <Badge variant="secondary" className="bg-background/90 backdrop-blur">
                                  {asset.category}
                                </Badge>
                                <AssetStatusBadge status={asset.status} />
                              </div>
                            </div>

                            <CardContent className="space-y-3 pt-5">
                              <div className="space-y-1">
                                <p className="font-semibold">{asset.name}</p>
                                <p className="text-xs text-muted-foreground">{asset.id}</p>
                              </div>
                              <div className="rounded-2xl bg-muted/25 p-3">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                                  Ownership
                                </p>
                                <p className="mt-2 font-medium">{ownership.name}</p>
                                <p className="text-sm text-muted-foreground">{ownership.department}</p>
                              </div>
                            </CardContent>
                          </Card>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="rounded-3xl border border-dashed bg-muted/20 px-4 py-10 text-center">
                      <p className="font-medium">No matching demo assets were found for this scope.</p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        The census record is still available even when the current demo asset set is smaller than the historical session scope.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="flex flex-wrap gap-2">
                <Button asChild className="rounded-xl">
                  <Link href="/auditor/scan">Open Auditor Scanner</Link>
                </Button>
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  )
}
