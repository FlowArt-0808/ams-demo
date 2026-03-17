"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useState, type ComponentProps } from "react"
import QRCode from "qrcode"
import {
  ArrowUpDown,
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  Clock,
  Download,
  Laptop,
  Link2,
  MoreHorizontal,
  Monitor,
  Package2,
  Smartphone,
  QrCode,
  Search,
  ShieldAlert,
  Tablet,
  UserRound,
  Warehouse,
} from "lucide-react"
import { toast } from "sonner"

import { AssetStatusBadge } from "@/components/demo/asset-status-badge"
import { useDemoRole } from "@/components/demo/demo-role-provider"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  assetCategories,
  assetStatusLabels,
  assetStatuses,
  departments,
  getAllAssets,
  getAssignedAssetCount,
  getAssetHistory,
  getEmployeeById,
  mockCensuses,
  type Asset,
  type AssetCategory,
  type Census,
  type Employee,
} from "@/lib/mock-data"
import { cn } from "@/lib/utils"

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
})

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
})

function Card({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex flex-col gap-5 border-b border-border/70 bg-transparent py-5",
        className,
      )}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("grid gap-2 px-0", className)} {...props} />
}

function CardTitle({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("text-lg font-semibold leading-tight", className)} {...props} />
}

function CardDescription({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("text-sm text-muted-foreground", className)} {...props} />
}

function CardContent({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("px-0", className)} {...props} />
}

const conditionClasses = {
  "N/A": "border-zinc-300 bg-zinc-500/10 text-zinc-600",
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
type ExtendedAssetStatus = Asset["status"] | "MISSING" | "BROKEN"
type AssetSortKey =
  | "id"
  | "name"
  | "purchaseDate"
  | "category"
  | "location"
  | "condition"
  | "status"
  | "holder"
  | "purchaseCost"

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
  { id: "N/A", label: "N/A" },
  { id: "Good", label: "Good" },
  { id: "Fair", label: "Fair" },
  { id: "Damaged", label: "Damaged" },
] as const

const extendedStatusLabels: Record<ExtendedAssetStatus, string> = {
  ...assetStatusLabels,
  MISSING: "Missing",
  BROKEN: "Broken",
}

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

const searchableAssetFields = [
  "Asset ID",
  "Asset Name",
  "Serial Number",
  "Category",
  "Type",
  "Holder",
  "Location",
  "Department",
  "Condition",
  "Status",
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

export function StorageWorkspace() {
  const { role } = useDemoRole()
  const [activeTab, setActiveTab] = useState("inventory")
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [selectedStorageCategory, setSelectedStorageCategory] = useState<StorageCategoryGroupId | "all">("all")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedOwnership, setSelectedOwnership] = useState("all")
  const [selectedCondition, setSelectedCondition] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState<ExtendedAssetStatus | "all">("all")
  const [selectedLocation, setSelectedLocation] = useState("all")
  const [selectedHolder, setSelectedHolder] = useState("all")
  const [selectedDate, setSelectedDate] = useState("all")
  const [selectedDepartment, setSelectedDepartment] = useState("all")
  const [selectedAssetIds, setSelectedAssetIds] = useState<string[]>([])
  const [statusOverrides, setStatusOverrides] = useState<Record<string, ExtendedAssetStatus>>({})
  const [sortKey, setSortKey] = useState<AssetSortKey>("purchaseDate")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [selectedAssetId, setSelectedAssetId] = useState("MAC-2026-001")
  const [qrAssetQuery, setQrAssetQuery] = useState("")
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
  const selectedAssetHistory = selectedAsset ? getAssetHistory(selectedAsset.id).slice(0, 3) : []
  const qrAssetSuggestions = allAssets.filter((asset) => {
    const query = qrAssetQuery.trim().toLowerCase()

    if (!query) {
      return true
    }

    return `${asset.id} ${asset.name} ${asset.category} ${asset.location}`
      .toLowerCase()
      .includes(query)
  })
  const employeeHref = selectedAsset ? `/employee/assets/${selectedAsset.id}` : ""
  const employeeUrl =
    origin && employeeHref ? new URL(employeeHref, origin).toString() : employeeHref
  const getEffectiveStatus = (asset: Asset): ExtendedAssetStatus =>
    statusOverrides[asset.id] ?? asset.status
  const getEffectiveCondition = (asset: Asset) =>
    getEffectiveStatus(asset) === "MISSING" || getEffectiveStatus(asset) === "BROKEN"
      ? "N/A"
      : asset.condition

  const filteredAssets = allAssets.filter((asset) => {
    const ownership = getOwnershipLabel(asset)
    const storageGroupLabel =
      storageCategoryGroups.find((group) => group.types.includes(asset.category))?.label ?? "Uncategorized"
    const effectiveStatus = getEffectiveStatus(asset)
    const haystack = [
      asset.id,
      asset.name,
      asset.serialNumber,
      asset.category,
      storageGroupLabel,
      asset.description,
      getEffectiveCondition(asset),
      extendedStatusLabels[effectiveStatus],
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
    const matchesStorageCategory =
      selectedStorageCategory === "all" ||
      storageCategoryGroups
        .find((group) => group.id === selectedStorageCategory)
        ?.types.includes(asset.category)
    const matchesCategory = selectedCategory === "all" || asset.category === selectedCategory
    const matchesOwnership =
      selectedOwnership === "all" ||
      (selectedOwnership === "assigned" && Boolean(asset.assignedTo)) ||
      (selectedOwnership === "storage" && !asset.assignedTo)
    const matchesCondition =
      selectedCondition === "all" || getEffectiveCondition(asset) === selectedCondition
    const matchesStatus = selectedStatus === "all" || effectiveStatus === selectedStatus
    const matchesLocation = selectedLocation === "all" || asset.location === selectedLocation
    const matchesHolder = selectedHolder === "all" || ownership.name === selectedHolder
    const matchesDate =
      selectedDate === "all" || new Date(asset.purchaseDate).getFullYear().toString() === selectedDate
    const matchesDepartment =
      selectedDepartment === "all" || ownership.department === selectedDepartment

    return (
      matchesStorageCategory &&
      matchesSearch &&
      matchesCategory &&
      matchesOwnership &&
      matchesCondition &&
      matchesStatus &&
      matchesLocation &&
      matchesHolder &&
      matchesDate &&
      matchesDepartment
    )
  })
  const sortedAssets = [...filteredAssets].sort((left, right) => {
    const leftOwner = getOwnershipLabel(left)
    const rightOwner = getOwnershipLabel(right)
    const leftStatus = getEffectiveStatus(left)
    const rightStatus = getEffectiveStatus(right)

    const leftValue =
      sortKey === "id"
        ? left.id
        : sortKey === "name"
          ? left.name
          : sortKey === "purchaseDate"
            ? new Date(left.purchaseDate).getTime()
            : sortKey === "category"
              ? left.category
              : sortKey === "location"
                ? left.location
                : sortKey === "condition"
                  ? left.condition
                  : sortKey === "status"
                    ? extendedStatusLabels[leftStatus]
                    : sortKey === "holder"
                      ? leftOwner.name
                      : left.purchaseCost

    const rightValue =
      sortKey === "id"
        ? right.id
        : sortKey === "name"
          ? right.name
          : sortKey === "purchaseDate"
            ? new Date(right.purchaseDate).getTime()
            : sortKey === "category"
              ? right.category
              : sortKey === "location"
                ? right.location
                : sortKey === "condition"
                  ? right.condition
                  : sortKey === "status"
                    ? extendedStatusLabels[rightStatus]
                    : sortKey === "holder"
                      ? rightOwner.name
                      : right.purchaseCost

    if (typeof leftValue === "number" && typeof rightValue === "number") {
      return sortDirection === "asc" ? leftValue - rightValue : rightValue - leftValue
    }

    return sortDirection === "asc"
      ? String(leftValue).localeCompare(String(rightValue))
      : String(rightValue).localeCompare(String(leftValue))
  })

  const assignedCount = allAssets.filter((asset) => asset.assignedTo).length
  const storageCount = allAssets.filter((asset) => !asset.assignedTo).length
  const flaggedCount = allAssets.filter(
    (asset) =>
      getEffectiveStatus(asset) === "PENDING_RETRIEVAL" ||
      getEffectiveStatus(asset) === "OVERDUE_RETRIEVAL" ||
      getEffectiveStatus(asset) === "IN_REPAIR" ||
      getEffectiveStatus(asset) === "PENDING_DISPOSAL",
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
    (asset) =>
      getEffectiveStatus(asset) === "PENDING_RETRIEVAL" ||
      getEffectiveStatus(asset) === "OVERDUE_RETRIEVAL" ||
      getEffectiveStatus(asset) === "IN_REPAIR" ||
      getEffectiveStatus(asset) === "PENDING_DISPOSAL",
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
        (asset) =>
          getEffectiveStatus(asset) === "PENDING_RETRIEVAL" ||
          getEffectiveStatus(asset) === "OVERDUE_RETRIEVAL" ||
          getEffectiveStatus(asset) === "IN_REPAIR" ||
          getEffectiveStatus(asset) === "PENDING_DISPOSAL",
      ).length,
    }
  })
  const selectedStorageGroup =
    storageCategoryGroups.find((group) => group.id === selectedStorageCategory) ?? null
  const typeCounts = assetCategories
    .filter((category) =>
      selectedStorageGroup ? selectedStorageGroup.types.includes(category) : true,
    )
    .map((category) => {
    const assets = allAssets.filter((asset) => asset.category === category)

    return {
      category,
      count: assets.length,
      assigned: assets.filter((asset) => Boolean(asset.assignedTo)).length,
      flagged: assets.filter(
        (asset) =>
          getEffectiveStatus(asset) === "PENDING_RETRIEVAL" ||
          getEffectiveStatus(asset) === "OVERDUE_RETRIEVAL" ||
          getEffectiveStatus(asset) === "IN_REPAIR" ||
          getEffectiveStatus(asset) === "PENDING_DISPOSAL",
      ).length,
    }
  })
  const activeFilterCount = [
    selectedStorageCategory !== "all",
    selectedCategory !== "all",
    selectedOwnership !== "all",
    selectedCondition !== "all",
    selectedStatus !== "all",
    selectedLocation !== "all",
    selectedHolder !== "all",
    selectedDate !== "all",
    selectedDepartment !== "all",
  ].filter(Boolean).length
  const purchaseYears = Array.from(
    new Set(allAssets.map((asset) => new Date(asset.purchaseDate).getFullYear().toString())),
  ).sort((left, right) => Number(right) - Number(left))
  const categoryMenuOptions = assetCategories.filter((category) =>
    selectedStorageGroup ? selectedStorageGroup.types.includes(category) : true,
  )
  const locationMenuOptions = Array.from(new Set(allAssets.map((asset) => asset.location))).sort(
    (left, right) => left.localeCompare(right),
  )
  const holderMenuOptions = Array.from(
    new Set(allAssets.map((asset) => getOwnershipLabel(asset).name)),
  ).sort((left, right) => left.localeCompare(right))

  useEffect(() => {
    setOrigin(window.location.origin)
  }, [])

  useEffect(() => {
    if (selectedAsset) {
      setQrAssetQuery(`${selectedAsset.id} | ${selectedAsset.name}`)
    }
  }, [selectedAsset?.id])

  useEffect(() => {
    setQrDataUrl("")
  }, [selectedAsset?.id])

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
    setSelectedAssetIds((current) => current.filter((id) => id !== asset.id))

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

  const handleDisposeSelectedAssets = () => {
    if (selectedAssetIds.length === 0) {
      return
    }

    setStatusOverrides((current) =>
      Object.fromEntries([
        ...Object.entries(current),
        ...selectedAssetIds.map((id) => [id, "PENDING_DISPOSAL" as const]),
      ]),
    )
    toast.success("Selected assets marked for disposal", {
      description: `${selectedAssetIds.length} asset(s) moved to pending disposal.`,
    })
  }

  const handleArchiveSelectedAssets = () => {
    if (selectedAssetIds.length === 0) {
      return
    }

    setArchivedAssetIds((current) => [...new Set([...current, ...selectedAssetIds])])
    toast.success("Selected assets archived", {
      description: `${selectedAssetIds.length} asset(s) hidden from the working list.`,
    })
    setSelectedAssetIds([])
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

  const handleGenerateQrCode = async () => {
    if (!selectedAsset || !employeeUrl) {
      toast.error("Choose an asset first.")
      return
    }

    try {
      const dataUrl = await QRCode.toDataURL(employeeUrl, {
        width: 320,
        margin: 2,
        errorCorrectionLevel: "M",
        color: {
          dark: "#111827",
          light: "#FFFFFF",
        },
      })

      setQrDataUrl(dataUrl)
    } catch {
      setQrDataUrl("")
      toast.error("Unable to generate the QR code label.")
    }
  }

  const resetFilters = () => {
    setSearchQuery("")
    setSelectedOwnership("all")
    setSelectedCondition("all")
    setSelectedStatus("all")
    setSelectedLocation("all")
    setSelectedHolder("all")
    setSelectedDate("all")
    setSelectedDepartment("all")
  }

  const markAssetVerified = (assetId: string) => {
    setVerifiedAssetIds((current) =>
      current.includes(assetId) ? current : [...current, assetId],
    )
    toast.success("Asset marked as verified", {
      description: `${assetId} is now counted in the storage census view.`,
    })
  }

  const allVisibleSelected =
    sortedAssets.length > 0 && sortedAssets.every((asset) => selectedAssetIds.includes(asset.id))

  const toggleSort = (key: AssetSortKey) => {
    if (sortKey === key) {
      setSortDirection((current) => (current === "asc" ? "desc" : "asc"))
      return
    }

    setSortKey(key)
    setSortDirection(key === "purchaseDate" || key === "purchaseCost" ? "desc" : "asc")
  }

  const applySort = (key: AssetSortKey, direction: "asc" | "desc") => {
    setSortKey(key)
    setSortDirection(direction)
  }

  const renderHeaderDropdown = ({
    label,
    columnKey,
    menuLabel,
    selectedValue,
    allLabel,
    onClear,
    onSortAsc,
    onSortDesc,
    options,
  }: {
    label: string
    columnKey: AssetSortKey
    menuLabel: string
    selectedValue: string
    allLabel: string
    onClear: () => void
    onSortAsc: () => void
    onSortDesc: () => void
    options: Array<{
      checked: boolean
      label: string
      onSelect: () => void
    }>
  }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-auto gap-1 px-0 font-medium">
          {label}
          <ArrowUpDown className="h-3.5 w-3.5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-52">
        <DropdownMenuLabel>{label}</DropdownMenuLabel>
        <DropdownMenuItem onClick={onSortAsc}>
          Sort ascending
          {sortKey === columnKey && sortDirection === "asc" ? " • active" : ""}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onSortDesc}>
          Sort descending
          {sortKey === columnKey && sortDirection === "desc" ? " • active" : ""}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>{menuLabel}</DropdownMenuLabel>
        <DropdownMenuCheckboxItem
          checked={selectedValue === "all"}
          onCheckedChange={() => onClear()}
        >
          {allLabel}
        </DropdownMenuCheckboxItem>
        {options.map((option) => (
          <DropdownMenuCheckboxItem
            key={option.label}
            checked={option.checked}
            onCheckedChange={() => option.onSelect()}
          >
            {option.label}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )

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
            <TabsTrigger value="inventory" className="rounded-xl px-4 py-2">
              Inventory
            </TabsTrigger>
          <TabsTrigger value="census" className="rounded-xl px-4 py-2">
            Census (тооллого)
          </TabsTrigger>
          <TabsTrigger
            value="create-qr-code"
            className="rounded-xl border border-amber-500/60 bg-amber-50 px-4 py-2 font-semibold text-amber-700 shadow-[0_10px_24px_-18px_rgba(245,158,11,0.95)] hover:bg-amber-100 data-[state=active]:border-amber-500 data-[state=active]:bg-amber-500 data-[state=active]:text-white data-[state=active]:shadow-[0_14px_28px_-16px_rgba(245,158,11,0.95)]"
          >
            <QrCode className="h-4 w-4" />
            Create QR Code
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inventory" className="space-y-4">
          <Card className="rounded-[28px] border-0 shadow-sm">
            <CardHeader>
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <CardTitle>Inventory</CardTitle>
                  <CardDescription>
                    Search, filter, and work the storage asset list from one table.
                  </CardDescription>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">{filteredAssets.length} visible</Badge>
                  <Badge variant="outline">{activeFilterCount} active filters</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <p className="text-sm font-medium">Search</p>
                <div className="relative">
                  <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => {
                      window.setTimeout(() => setIsSearchFocused(false), 120)
                    }}
                    className="pl-9"
                    placeholder="Search assets, owners, serial numbers, location, or cost..."
                  />
                  {isSearchFocused ? (
                    <div className="absolute top-[calc(100%+0.5rem)] z-20 w-full rounded-2xl border bg-background p-4 shadow-lg">
                      <p className="text-sm font-medium">Searchable fields</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        You can search across these fields from one input.
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {searchableAssetFields.map((field) => (
                          <button
                            key={field}
                            type="button"
                            className="rounded-full border px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-foreground/20 hover:text-foreground"
                            onMouseDown={(event) => event.preventDefault()}
                            onClick={() => setSearchQuery(field)}
                          >
                            {field}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="space-y-3 rounded-[24px] border bg-background p-4">
                <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                  <div>
                    <p className="text-sm font-medium">Filters</p>
                    <p className="text-sm text-muted-foreground">
                      Narrow the table without leaving this page.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                      <Select
                        value={selectedStatus}
                        onValueChange={(value) => setSelectedStatus(value as ExtendedAssetStatus | "all")}
                      >
                      <SelectTrigger className="h-11 min-w-[160px] rounded-full border bg-background px-4">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Status: All</SelectItem>
                        {assetStatuses.map((status) => (
                          <SelectItem key={status} value={status}>
                            {assetStatusLabels[status]}
                          </SelectItem>
                        ))}
                        <SelectItem value="MISSING">Missing</SelectItem>
                        <SelectItem value="BROKEN">Broken</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={selectedOwnership} onValueChange={setSelectedOwnership}>
                      <SelectTrigger className="h-11 min-w-[170px] rounded-full border bg-background px-4">
                        <SelectValue placeholder="Ownership" />
                      </SelectTrigger>
                      <SelectContent>
                        {ownershipOptions.map((option) => (
                          <SelectItem key={option.id} value={option.id}>
                            {option.id === "all" ? "Ownership: All" : option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select value={selectedCondition} onValueChange={setSelectedCondition}>
                      <SelectTrigger className="h-11 min-w-[165px] rounded-full border bg-background px-4">
                        <SelectValue placeholder="Condition" />
                      </SelectTrigger>
                      <SelectContent>
                        {conditionOptions.map((option) => (
                          <SelectItem key={option.id} value={option.id}>
                            {option.id === "all" ? "Condition: All" : option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select value={selectedDate} onValueChange={setSelectedDate}>
                      <SelectTrigger className="h-11 min-w-[145px] rounded-full border bg-background px-4">
                        <SelectValue placeholder="Date" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Date: All</SelectItem>
                        {purchaseYears.map((year) => (
                          <SelectItem key={year} value={year}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select
                      value={selectedStorageCategory}
                      onValueChange={(value) =>
                        setSelectedStorageCategory(value as StorageCategoryGroupId | "all")
                      }
                    >
                      <SelectTrigger className="h-11 min-w-[170px] rounded-full border bg-background px-4">
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Category: All</SelectItem>
                        {storageCategoryGroups.map((group) => (
                          <SelectItem key={group.id} value={group.id}>
                            {group.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="h-11 min-w-[150px] rounded-full border bg-background px-4">
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Type: All</SelectItem>
                        {typeCounts.map(({ category }) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex flex-wrap gap-2">
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
                      <Badge variant="secondary">Status: {extendedStatusLabels[selectedStatus]}</Badge>
                    ) : null}
                    {selectedDate !== "all" ? (
                      <Badge variant="secondary">Date: {selectedDate}</Badge>
                    ) : null}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {selectedAssetIds.length > 0 ? (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" className="h-11 rounded-full px-5">
                            More options ({selectedAssetIds.length})
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="min-w-52">
                          <DropdownMenuItem onClick={handleDisposeSelectedAssets}>
                            Mark as disposal
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toast.success("Export queued", {
                            description: `${selectedAssetIds.length} selected asset(s) prepared for export.`,
                          })}>
                            Export selected
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => setSelectedAssetIds([])}>
                            Clear selection
                          </DropdownMenuItem>
                          {canArchiveAssets ? (
                            <DropdownMenuItem
                              variant="destructive"
                              onClick={handleArchiveSelectedAssets}
                            >
                              Delete selected
                            </DropdownMenuItem>
                          ) : null}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : null}
                    <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                      <SelectTrigger className="h-11 min-w-[170px] rounded-full border bg-background px-4">
                        <SelectValue placeholder="Department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Department: All</SelectItem>
                        {departments.map((department) => (
                          <SelectItem key={department} value={department}>
                            {department}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Button
                      variant="ghost"
                      className="h-11 rounded-full px-5"
                      onClick={() => {
                        setSelectedStorageCategory("all")
                        setSelectedCategory("all")
                        resetFilters()
                      }}
                    >
                      Reset all
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-muted-foreground">
                  Showing <span className="font-medium text-foreground">{filteredAssets.length}</span> assets in one table.
                </p>
                <Badge variant="outline">Storage asset list</Badge>
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
                <div className="overflow-hidden rounded-[28px] border bg-background">
                  <Table className="min-w-[1120px]">
                    <TableHeader className="bg-muted/35">
                      <TableRow className="border-b hover:bg-muted/35">
                        <TableHead className="w-12 px-4">
                          <Checkbox
                            checked={allVisibleSelected}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedAssetIds(sortedAssets.map((asset) => asset.id))
                                return
                              }

                              setSelectedAssetIds([])
                            }}
                            aria-label="Select all visible assets"
                          />
                        </TableHead>
                        <TableHead className="w-14">№</TableHead>
                        <TableHead>
                          <Button variant="ghost" className="h-auto px-0 font-medium" onClick={() => toggleSort("id")}>
                            Asset ID
                            <ArrowUpDown className="h-3.5 w-3.5" />
                          </Button>
                        </TableHead>
                        <TableHead>
                          <Button variant="ghost" className="h-auto px-0 font-medium" onClick={() => toggleSort("name")}>
                            Asset Name
                            <ArrowUpDown className="h-3.5 w-3.5" />
                          </Button>
                        </TableHead>
                        <TableHead>
                          <Button variant="ghost" className="h-auto px-0 font-medium" onClick={() => toggleSort("purchaseDate")}>
                            Date
                            <ArrowUpDown className="h-3.5 w-3.5" />
                          </Button>
                        </TableHead>
                        <TableHead>
                          {renderHeaderDropdown({
                            label: "Category",
                            columnKey: "category",
                            menuLabel: "Filter category",
                            selectedValue: selectedCategory,
                            allLabel: "All categories",
                            onClear: () => setSelectedCategory("all"),
                            onSortAsc: () => applySort("category", "asc"),
                            onSortDesc: () => applySort("category", "desc"),
                            options: categoryMenuOptions.map((category) => ({
                              checked: selectedCategory === category,
                              label: category,
                              onSelect: () => setSelectedCategory(category),
                            })),
                          })}
                        </TableHead>
                        <TableHead>
                          {renderHeaderDropdown({
                            label: "Location",
                            columnKey: "location",
                            menuLabel: "Filter location",
                            selectedValue: selectedLocation,
                            allLabel: "All locations",
                            onClear: () => setSelectedLocation("all"),
                            onSortAsc: () => applySort("location", "asc"),
                            onSortDesc: () => applySort("location", "desc"),
                            options: locationMenuOptions.map((location) => ({
                              checked: selectedLocation === location,
                              label: location,
                              onSelect: () => setSelectedLocation(location),
                            })),
                          })}
                        </TableHead>
                        <TableHead>
                          {renderHeaderDropdown({
                            label: "Condition",
                            columnKey: "condition",
                            menuLabel: "Filter condition",
                            selectedValue: selectedCondition,
                            allLabel: "All conditions",
                            onClear: () => setSelectedCondition("all"),
                            onSortAsc: () => applySort("condition", "asc"),
                            onSortDesc: () => applySort("condition", "desc"),
                            options: conditionOptions
                              .filter((option) => option.id !== "all")
                              .map((option) => ({
                                checked: selectedCondition === option.id,
                                label: option.label,
                                onSelect: () => setSelectedCondition(option.id),
                              })),
                          })}
                        </TableHead>
                        <TableHead>
                          {renderHeaderDropdown({
                            label: "Status",
                            columnKey: "status",
                            menuLabel: "Filter status",
                            selectedValue: selectedStatus,
                            allLabel: "All statuses",
                            onClear: () => setSelectedStatus("all"),
                            onSortAsc: () => applySort("status", "asc"),
                            onSortDesc: () => applySort("status", "desc"),
                            options: Object.entries(extendedStatusLabels).map(([value, text]) => ({
                              checked: selectedStatus === value,
                              label: text,
                              onSelect: () => setSelectedStatus(value as ExtendedAssetStatus),
                            })),
                          })}
                        </TableHead>
                        <TableHead>
                          {renderHeaderDropdown({
                            label: "Holder",
                            columnKey: "holder",
                            menuLabel: "Filter holder",
                            selectedValue: selectedHolder,
                            allLabel: "All holders",
                            onClear: () => setSelectedHolder("all"),
                            onSortAsc: () => applySort("holder", "asc"),
                            onSortDesc: () => applySort("holder", "desc"),
                            options: holderMenuOptions.map((holder) => ({
                              checked: selectedHolder === holder,
                              label: holder,
                              onSelect: () => setSelectedHolder(holder),
                            })),
                          })}
                        </TableHead>
                        <TableHead className="text-right">
                          <Button variant="ghost" className="h-auto px-0 font-medium" onClick={() => toggleSort("purchaseCost")}>
                            Purchase Cost
                            <ArrowUpDown className="h-3.5 w-3.5" />
                          </Button>
                        </TableHead>
                        <TableHead className="px-4 text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedAssets.map((asset, index) => {
                        const owner = getEmployeeById(asset.assignedTo)
                        const ownership = getOwnershipLabel(asset)
                        const effectiveStatus = getEffectiveStatus(asset)

                        return (
                          <TableRow key={asset.id} className="border-b last:border-b-0">
                            <TableCell className="px-4">
                              <Checkbox
                                checked={selectedAssetIds.includes(asset.id)}
                                onCheckedChange={(checked) => {
                                  setSelectedAssetIds((current) =>
                                    checked
                                      ? [...new Set([...current, asset.id])]
                                      : current.filter((id) => id !== asset.id),
                                  )
                                }}
                                aria-label={`Select ${asset.id}`}
                              />
                            </TableCell>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell className="font-medium">{asset.id}</TableCell>
                            <TableCell>
                              <div className="min-w-0">
                                <p className="max-w-[240px] truncate font-medium">{asset.name}</p>
                                <p className="text-xs text-muted-foreground">{asset.serialNumber}</p>
                              </div>
                            </TableCell>
                            <TableCell>{dateFormatter.format(new Date(asset.purchaseDate))}</TableCell>
                            <TableCell>
                              <Badge variant="secondary" className="rounded-full">
                                {asset.category}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div>
                                <p>{asset.location}</p>
                                <p className="text-xs text-muted-foreground">{ownership.department}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className={`${conditionClasses[getEffectiveCondition(asset)]} rounded-full`}>
                                {getEffectiveCondition(asset)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <AssetStatusBadge status={effectiveStatus} />
                            </TableCell>
                            <TableCell>
                              {owner ? (
                                <button
                                  type="button"
                                  onClick={() => setSelectedEmployee(owner)}
                                  className="text-left transition-opacity hover:opacity-80"
                                >
                                  <p className="font-medium text-primary">{ownership.name}</p>
                                  <p className="text-xs text-muted-foreground">{ownership.subtitle}</p>
                                </button>
                              ) : (
                                <div>
                                  <p className="font-medium">{ownership.name}</p>
                                  <p className="text-xs text-muted-foreground">{ownership.subtitle}</p>
                                </div>
                              )}
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {currencyFormatter.format(asset.purchaseCost)}
                            </TableCell>
                            <TableCell className="px-4">
                              <div className="flex justify-end">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="h-8 w-8 rounded-full text-muted-foreground"
                                      aria-label={`Open actions for ${asset.id}`}
                                    >
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem asChild>
                                      <Link href={`/storage/assets/${asset.id}`}>View details</Link>
                                    </DropdownMenuItem>
                                    {canArchiveAssets ? (
                                      <>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                          variant="destructive"
                                          onClick={() => handleArchiveAsset(asset)}
                                        >
                                          Delete
                                        </DropdownMenuItem>
                                      </>
                                    ) : null}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}

              <p className="text-xs text-muted-foreground">
                Inventory can archive an asset from this working list in the demo; the real system
                would keep the audit trail and historical record.
              </p>
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
                <div className="flex flex-wrap gap-3">
                  <Button asChild variant="outline" className="rounded-xl">
                    <Link href="/hr/census">Create a Census</Link>
                  </Button>
                  <Button asChild className="rounded-xl">
                    <Link href="/auditor/scan">Open Auditor Scanner</Link>
                  </Button>
                </div>
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
                    <div className="overflow-hidden rounded-2xl border">
                      <Table>
                        <TableHeader className="bg-muted/35">
                          <TableRow className="hover:bg-muted/35">
                            <TableHead className="px-4">Asset</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Location</TableHead>
                            <TableHead>Holder</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="px-4 text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                      {pendingVerificationAssets.slice(0, 6).map((asset) => {
                        const owner = getEmployeeById(asset.assignedTo)
                        const ownership = getOwnershipLabel(asset)

                        return (
                          <TableRow key={asset.id}>
                            <TableCell className="px-4">
                              <div>
                                <p className="font-medium">{asset.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {asset.id} | {asset.serialNumber}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary" className="rounded-full">
                                {asset.category}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div>
                                <p>{asset.location}</p>
                                <p className="text-xs text-muted-foreground">{ownership.department}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              {owner ? (
                                <button
                                  type="button"
                                  onClick={() => setSelectedEmployee(owner)}
                                  className="text-left transition-opacity hover:opacity-80"
                                >
                                  <p className="font-medium text-primary">{ownership.name}</p>
                                  <p className="text-xs text-muted-foreground">{ownership.subtitle}</p>
                                </button>
                              ) : (
                                <div>
                                  <p className="font-medium">{ownership.name}</p>
                                  <p className="text-xs text-muted-foreground">{ownership.subtitle}</p>
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="rounded-full">
                                Pending census
                              </Badge>
                            </TableCell>
                            <TableCell className="px-4">
                              <div className="flex justify-end gap-2">
                                <Button
                                  size="sm"
                                  className="rounded-lg"
                                  onClick={() => markAssetVerified(asset.id)}
                                >
                                  <CheckCircle2 className="h-4 w-4" />
                                  Mark verified
                                </Button>
                                <Button asChild size="sm" variant="outline" className="rounded-lg">
                                  <Link href={`/storage/assets/${asset.id}`}>Asset detail</Link>
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                        </TableBody>
                      </Table>
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

        <TabsContent value="create-qr-code" className="space-y-4">
          <Card className="rounded-[28px] border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Create a QR label</CardTitle>
              <CardDescription>
                Generate a QR code for an asset and open the linked asset page when needed.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 xl:grid-cols-[1.15fr,0.85fr]">
              <div className="space-y-4">
                <div className="grid gap-3 md:grid-cols-[1.4fr,0.6fr]">
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Select asset</p>
                    <div className="rounded-2xl border bg-background">
                      <div className="relative border-b">
                        <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          value={qrAssetQuery}
                          onChange={(event) => setQrAssetQuery(event.target.value)}
                          placeholder="Type asset ID or name..."
                          className="border-0 pl-10 shadow-none focus-visible:ring-0"
                        />
                      </div>
                      <div className="max-h-52 overflow-y-auto p-2">
                        {qrAssetSuggestions.slice(0, 8).map((asset) => (
                          <button
                            key={asset.id}
                            type="button"
                            className={`flex w-full items-start justify-between rounded-xl px-3 py-2 text-left transition-colors hover:bg-muted ${
                              selectedAsset?.id === asset.id ? "bg-muted" : ""
                            }`}
                            onClick={() => {
                              setSelectedAssetId(asset.id)
                              setQrAssetQuery(`${asset.id} | ${asset.name}`)
                            }}
                          >
                            <div className="min-w-0">
                              <p className="font-medium">{asset.id}</p>
                              <p className="truncate text-sm text-muted-foreground">{asset.name}</p>
                            </div>
                            <Badge variant="outline" className="ml-3">{asset.category}</Badge>
                          </button>
                        ))}
                        {qrAssetSuggestions.length === 0 ? (
                          <div className="px-3 py-6 text-sm text-muted-foreground">
                            No assets match that search.
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium">Linked page</p>
                    <Button asChild variant="outline" className="w-full justify-start rounded-xl">
                      <Link href={employeeHref}>
                        <Link2 className="h-4 w-4" />
                        Open linked page
                      </Link>
                    </Button>
                  </div>
                </div>

                {selectedAsset && (
                  <div className="grid gap-4">
                    <Card className="overflow-hidden rounded-3xl border-dashed">
                      <CardContent className="p-0">
                        <div className="grid gap-0 lg:grid-cols-[220px_minmax(0,1fr)]">
                          <div className="relative min-h-[220px] bg-muted/20">
                            <Image
                              src="/placeholder.jpg"
                              alt={`${selectedAsset.name} asset image`}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="space-y-5 p-6">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <div>
                                <p className="text-sm text-muted-foreground">Selected asset</p>
                                <p className="text-xl font-semibold">{selectedAsset.name}</p>
                                <p className="text-sm text-muted-foreground">{selectedAsset.id}</p>
                              </div>
                              <AssetStatusBadge status={selectedAsset.status} />
                            </div>

                            <p className="text-sm text-muted-foreground">{selectedAsset.description}</p>

                            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                              <div className="rounded-2xl border bg-background p-4">
                                <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">Type</p>
                                <p className="mt-2 font-medium">{selectedAsset.category}</p>
                              </div>
                              <div className="rounded-2xl border bg-background p-4">
                                <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">Category</p>
                                <p className="mt-2 font-medium">IT Equipment</p>
                              </div>
                              <div className="rounded-2xl border bg-background p-4">
                                <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">Condition</p>
                                <p className="mt-2 font-medium">{selectedAsset.condition}</p>
                              </div>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2">
                              <div className="rounded-2xl border bg-background p-4">
                                <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">Owner</p>
                                <p className="mt-2 font-medium">{getOwnershipLabel(selectedAsset).name}</p>
                                <p className="text-sm text-muted-foreground">{getOwnershipLabel(selectedAsset).department}</p>
                              </div>
                              <div className="rounded-2xl border bg-background p-4">
                                <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">Location</p>
                                <p className="mt-2 font-medium">{selectedAsset.location}</p>
                                <p className="text-sm text-muted-foreground">{currencyFormatter.format(selectedAsset.purchaseCost)}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="rounded-3xl border-dashed">
                      <CardHeader>
                        <CardTitle className="text-base">Recent history</CardTitle>
                        <CardDescription>Latest movement and ownership events for this asset.</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {selectedAssetHistory.map((event) => (
                          <div key={event.id} className="rounded-2xl border bg-background p-4">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <div>
                                <p className="font-medium">{event.title}</p>
                                <p className="text-xs text-muted-foreground">{new Date(event.date).toLocaleDateString()}</p>
                              </div>
                              <Badge variant="outline">{event.ownerLabel}</Badge>
                            </div>
                            <p className="mt-2 text-sm text-muted-foreground">{event.description}</p>
                            <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                              <Badge variant="outline">{event.location}</Badge>
                              <Badge variant="outline">{event.condition}</Badge>
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </div>
                )}

                <div className="flex flex-wrap gap-3">
                  <Button onClick={handleGenerateQrCode} className="rounded-xl">
                    <QrCode className="h-4 w-4" />
                    Generate a QR Code
                  </Button>
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
                      <CardDescription>Scans to the linked asset page.</CardDescription>
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
                          Generate a QR code
                        </div>
                      )}
                      {qrDataUrl ? (
                        <div>
                          <p className="font-semibold">{selectedAsset?.id}</p>
                          <p className="text-sm text-muted-foreground">{selectedAsset?.name}</p>
                        </div>
                      ) : null}
                    </div>
                  </div>

                  {qrDataUrl ? (
                    <div className="rounded-2xl border border-dashed bg-background p-4">
                      <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                        Encoded destination
                      </p>
                      <p className="mt-2 break-all text-sm font-medium">{employeeUrl || employeeHref}</p>
                    </div>
                  ) : null}
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
                        A few assets that fit this session's scope so the record feels concrete.
                      </CardDescription>
                    </div>
                    <Badge variant="outline">
                      {Math.min(selectedCensusInScopeAssets.length, 4)} shown
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {selectedCensusInScopeAssets.length > 0 ? (
                    <div className="overflow-hidden rounded-2xl border">
                      <Table>
                        <TableHeader className="bg-muted/35">
                          <TableRow className="hover:bg-muted/35">
                            <TableHead className="px-4">Asset</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Owner</TableHead>
                            <TableHead>Department</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                      {selectedCensusInScopeAssets.slice(0, 4).map((asset) => {
                        const ownership = getOwnershipLabel(asset)

                        return (
                          <TableRow key={asset.id}>
                            <TableCell className="px-4">
                              <div>
                                <p className="font-medium">{asset.name}</p>
                                <p className="text-xs text-muted-foreground">{asset.id}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary" className="rounded-full">
                                {asset.category}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <AssetStatusBadge status={asset.status} />
                            </TableCell>
                            <TableCell>{ownership.name}</TableCell>
                            <TableCell>{ownership.department}</TableCell>
                          </TableRow>
                        )
                      })}
                        </TableBody>
                      </Table>
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
