"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import QRCode from "qrcode"
import {
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
import { RolePerspectivePanel } from "@/components/demo/role-perspective-panel"
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
  type Asset,
  type AssetCategory,
  type Employee,
} from "@/lib/mock-data"
import { type DemoRole } from "@/lib/demo-navigation"

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

function getStorageRoleContent(role: DemoRole) {
  if (role === "hr") {
    return {
      responsibilities: [
        "Review ownership, holder context, and condition before distribution or exception follow-up.",
        "Use asset cards to jump into internal detail or the employee-facing QR page when verifying what a holder should see.",
      ],
      visibility: [
        "Full asset cards with ownership, condition, location, and quick access into the internal record.",
        "Employee ownership dialog and QR tools for cross-checking what an employee-facing link resolves to.",
      ],
    }
  }

  if (role === "system-admin") {
    return {
      responsibilities: [
        "Exercise both the inventory and HR perspectives from one shared register.",
        "Validate that asset cards, ownership lookups, and QR handoffs stay consistent across roles.",
      ],
      visibility: [
        "Everything shown to inventory and HR, including archive controls and internal detail access.",
        "The same shared asset cards with role-dependent actions available in one place.",
      ],
    }
  }

  return {
    responsibilities: [
      "Maintain the asset register, keep card details current, and archive demo items from the working list when needed.",
      "Generate QR links and inspect internal asset records before distribution, recovery, or disposal handoff.",
    ],
    visibility: [
      "All asset cards with ownership, cost, condition, and status metadata for storage operations.",
      "Archive controls, QR generation, and direct links into internal asset detail pages.",
    ],
  }
}

export function StorageWorkspace() {
  const { role, setRole } = useDemoRole()
  const [activeTab, setActiveTab] = useState("categories")
  const [searchQuery, setSearchQuery] = useState("")
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
  const storageRoleContent = getStorageRoleContent(role)
  const categoryCounts = assetCategories.map((category) => {
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
    if (selectedCategory === "all" && activeTab === "category-assets") {
      setActiveTab("categories")
    }
  }, [activeTab, selectedCategory])

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

  return (
    <div className="space-y-6">
      <RolePerspectivePanel
        currentRole={role}
        onRoleChange={setRole}
        roles={["inventory-head", "hr"]}
        title="Storage perspective"
        description="Switch between the internal storage roles that share this register."
        responsibilities={storageRoleContent.responsibilities}
        visibility={storageRoleContent.visibility}
      />

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
            Categories
          </TabsTrigger>
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
              <CardTitle>Browse asset categories</CardTitle>
              <CardDescription>
                Categories are the first layer in storage. Click a category card to open that
                category's assets in its own tab.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium">Browse by category</p>
                    <p className="text-sm text-muted-foreground">
                      Click a category card to switch into that category tab.
                    </p>
                  </div>
                  <Badge variant="outline">{categoryCounts.length} categories</Badge>
                </div>

                <div className="grid gap-4 xl:grid-cols-3 md:grid-cols-2">
                  {categoryCounts.map(({ category, count, assigned, flagged }) => {
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
                                  Category view
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
                            <div className="space-y-1">
                              <p className="text-sm text-muted-foreground">
                                Open the {category.toLowerCase()} tab and browse those asset cards.
                              </p>
                            </div>
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

        <TabsContent value="category-assets" className="space-y-4">
          <Card className="rounded-[28px] border-0 shadow-sm">
            <CardHeader>
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <CardTitle>{selectedCategory} asset cards</CardTitle>
                  <CardDescription>
                    Search and filter within the selected category, then open the matching asset cards.
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  className="rounded-xl"
                  onClick={() => setActiveTab("categories")}
                >
                  Back to categories
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
                      Use filters separately from search to narrow the category view.
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
                      {selectedCategory !== "all" ? (
                        <Badge variant="secondary">Category: {selectedCategory}</Badge>
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
    </div>
  )
}
