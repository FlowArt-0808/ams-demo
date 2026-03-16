"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import QRCode from "qrcode"
import {
  Download,
  Link2,
  Package2,
  QrCode,
  Search,
  ShieldAlert,
  Trash2,
  UserRound,
  Warehouse,
} from "lucide-react"
import { toast } from "sonner"

import { AssetStatusBadge } from "@/components/demo/asset-status-badge"
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
  getEmployeeById,
  type Asset,
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
  const [activeTab, setActiveTab] = useState("see-all-assets")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
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
    const matchesStatus = selectedStatus === "all" || asset.status === selectedStatus
    const matchesDepartment =
      selectedDepartment === "all" || ownership.department === selectedDepartment

    return matchesSearch && matchesCategory && matchesStatus && matchesDepartment
  })

  const assignedCount = allAssets.filter((asset) => asset.assignedTo).length
  const storageCount = allAssets.filter((asset) => !asset.assignedTo).length
  const flaggedCount = allAssets.filter(
    (asset) => asset.status === "IN_REPAIR" || asset.status === "PENDING_DISPOSAL",
  ).length

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

  const handleArchiveAsset = (asset: Asset) => {
    setArchivedAssetIds((current) => [...current, asset.id])

    if (selectedAssetId === asset.id) {
      const fallbackAsset = allAssets.find((item) => item.id !== asset.id)
      if (fallbackAsset) {
        setSelectedAssetId(fallbackAsset.id)
      }
    }

    toast.success(`${asset.id} archived from the working list`, {
      description: "The row is hidden from this demo view, but audit history is retained.",
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
          <TabsTrigger value="see-all-assets" className="rounded-xl px-4 py-2">
            See All Assets
          </TabsTrigger>
          <TabsTrigger
            value="create-qr-code"
            className="rounded-xl border border-amber-500/60 bg-amber-50 px-4 py-2 font-semibold text-amber-700 shadow-[0_10px_24px_-18px_rgba(245,158,11,0.95)] hover:bg-amber-100 data-[state=active]:border-amber-500 data-[state=active]:bg-amber-500 data-[state=active]:text-white data-[state=active]:shadow-[0_14px_28px_-16px_rgba(245,158,11,0.95)]"
          >
            <QrCode className="h-4 w-4" />
            Create QR Code
          </TabsTrigger>
        </TabsList>

        <TabsContent value="see-all-assets" className="space-y-4">
          <Card className="rounded-[28px] border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Search and filter the asset register</CardTitle>
              <CardDescription>
                Search across details, condition, ownership, and value. Ownership names open an
                employee detail dialog, while View detail opens the full internal asset record.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 xl:grid-cols-[2fr,1fr,1fr,1fr]">
                <div className="relative">
                  <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    className="pl-9"
                    placeholder="Search asset tag, serial number, condition, owner, value..."
                  />
                </div>

                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All categories</SelectItem>
                    {assetCategories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    {assetStatuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {assetStatusLabels[status]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All departments</SelectItem>
                    {departments.map((department) => (
                      <SelectItem key={department} value={department}>
                        {department}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="overflow-hidden rounded-3xl border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40">
                      <TableHead className="px-4 font-semibold text-blue-700">View Details</TableHead>
                      <TableHead>Asset tag</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Cost</TableHead>
                      <TableHead>Ownership</TableHead>
                      <TableHead>Condition</TableHead>
                      <TableHead className="w-16 text-right">Delete</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAssets.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="px-4 py-12 text-center">
                          <div className="space-y-2">
                            <p className="font-medium">No assets match the current filters.</p>
                            <p className="text-sm text-muted-foreground">
                              Try a broader search or reset one of the filters above.
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredAssets.map((asset) => {
                        const owner = getEmployeeById(asset.assignedTo)
                        const ownership = getOwnershipLabel(asset)

                        return (
                          <TableRow key={asset.id}>
                            <TableCell className="px-4">
                              <Button
                                asChild
                                size="sm"
                                variant="outline"
                                className="rounded-full border-blue-500/60 bg-blue-50 font-semibold text-blue-700 shadow-[0_10px_24px_-16px_rgba(59,130,246,0.9)] hover:bg-blue-100 hover:text-blue-800"
                              >
                                <Link href={`/storage/assets/${asset.id}`}>View Details</Link>
                              </Button>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <p className="font-medium">{asset.id}</p>
                                <p className="text-xs text-muted-foreground">{asset.name}</p>
                              </div>
                            </TableCell>
                            <TableCell>{asset.category}</TableCell>
                            <TableCell>
                              <AssetStatusBadge status={asset.status} />
                            </TableCell>
                            <TableCell className="font-medium">
                              {currencyFormatter.format(asset.purchaseCost)}
                            </TableCell>
                            <TableCell>
                              {owner ? (
                                <button
                                  type="button"
                                  onClick={() => setSelectedEmployee(owner)}
                                  className="space-y-1 text-left transition-opacity hover:opacity-80"
                                >
                                  <p className="font-medium text-primary">{ownership.name}</p>
                                  <p className="text-xs text-muted-foreground">{ownership.subtitle}</p>
                                </button>
                              ) : (
                                <div className="space-y-1">
                                  <p className="font-medium">{ownership.name}</p>
                                  <p className="text-xs text-muted-foreground">{ownership.subtitle}</p>
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={conditionClasses[asset.condition]}
                              >
                                {asset.condition}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                size="icon-sm"
                                variant="ghost"
                                aria-label={`Archive ${asset.id}`}
                                onClick={() => handleArchiveAsset(asset)}
                              >
                                <Trash2 className="h-4 w-4 text-muted-foreground" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        )
                      })
                    )}
                  </TableBody>
                </Table>
              </div>

              <p className="text-xs text-muted-foreground">
                Delete icons archive an asset from this working list in the demo; the real system
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
