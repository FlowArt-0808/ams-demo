"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Plus,
  ArrowLeft,
  ClipboardList,
  Calendar,
  Users,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Send,
  MoreHorizontal,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { CensusForm } from "@/components/demo/census-form"
import { mockCensuses, type Census } from "@/lib/mock-data"
import { toast } from "sonner"

const statusConfig = {
  Draft: {
    color: "bg-zinc-500/10 text-zinc-600 border-zinc-500/20",
    icon: Clock,
  },
  Active: {
    color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    icon: CheckCircle2,
  },
  Completed: {
    color: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    icon: CheckCircle2,
  },
  Overdue: {
    color: "bg-red-500/10 text-red-600 border-red-500/20",
    icon: AlertTriangle,
  },
}

export default function HRCensusPage() {
  const [censuses, setCensuses] = useState<Census[]>(mockCensuses)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedCensus, setSelectedCensus] = useState<Census | null>(null)

  const handleCreateCensus = (data: Omit<Census, "id" | "status" | "totalAssets" | "verifiedAssets" | "createdAt">) => {
    const newCensus: Census = {
      ...data,
      id: `CEN-2026-${String(censuses.length + 1).padStart(3, "0")}`,
      status: "Draft",
      totalAssets: Math.floor(Math.random() * 50) + 10,
      verifiedAssets: 0,
      createdAt: new Date().toISOString(),
    }
    setCensuses([newCensus, ...censuses])
    toast.success("Census created successfully", {
      description: `"${data.name}" is now ready to be started.`,
    })
  }

  const handleStartCensus = (censusId: string) => {
    setCensuses(
      censuses.map((c) =>
        c.id === censusId ? { ...c, status: "Active" as const } : c
      )
    )
    toast.success("Census started", {
      description: "Email notifications have been sent to all affected employees.",
    })
  }

  const handleViewDetails = (census: Census) => {
    setSelectedCensus(census)
  }

  // Aggregate metrics across all active censuses
  const activeCensuses = censuses.filter((c) => c.status === "Active")
  const totalAssetsToVerify = activeCensuses.reduce((sum, c) => sum + c.totalAssets, 0)
  const verifiedAssets = activeCensuses.reduce((sum, c) => sum + c.verifiedAssets, 0)
  const pendingAssets = totalAssetsToVerify - verifiedAssets
  
  // Mock discrepancies (assets flagged as missing or issues)
  const discrepancies = activeCensuses.length > 0 ? 2 : 0
  
  // Calculate overdue tasks (for demo, show some if we have active censuses)
  const overdueTasks = activeCensuses.some(c => new Date(c.deadline) < new Date()) ? 3 : 0

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Link href="/?workflow=qr">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-lg font-semibold">Census Management</h1>
              <p className="text-sm text-muted-foreground">HR Manager Portal</p>
            </div>
          </div>
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Census
          </Button>
        </div>
      </header>

      <main className="container px-4 py-8">
        {/* Operational Metrics Overview */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-500/10">
                  <ClipboardList className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{pendingAssets}</p>
                  <p className="text-sm text-muted-foreground">Pending Verification</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-500/10">
                  <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{verifiedAssets}</p>
                  <p className="text-sm text-muted-foreground">Verified This Period</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-500/10">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{discrepancies}</p>
                  <p className="text-sm text-muted-foreground">Discrepancies Found</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-zinc-500/10">
                  <Clock className="h-6 w-6 text-zinc-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{overdueTasks}</p>
                  <p className="text-sm text-muted-foreground">Overdue Tasks</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Census List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">All Censuses</h2>
          
          <div className="grid gap-4">
            {censuses.map((census) => {
              const StatusIcon = statusConfig[census.status].icon
              const progress = census.totalAssets > 0
                ? (census.verifiedAssets / census.totalAssets) * 100
                : 0

              return (
                <Card key={census.id} className="overflow-hidden">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <CardTitle className="text-lg">{census.name}</CardTitle>
                          <Badge className={statusConfig[census.status].color}>
                            <StatusIcon className="mr-1 h-3 w-3" />
                            {census.status}
                          </Badge>
                        </div>
                        <CardDescription>
                          {census.scope}
                          {census.scopeValue && ` - ${census.scopeValue}`}
                        </CardDescription>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {census.status === "Draft" && (
                            <DropdownMenuItem onClick={() => handleStartCensus(census.id)}>
                              <Send className="mr-2 h-4 w-4" />
                              Start Census
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => handleViewDetails(census)}>View Details</DropdownMenuItem>
                          <DropdownMenuItem>Export Report</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-6 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {new Date(census.startDate).toLocaleDateString()} -{" "}
                          {new Date(census.deadline).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>
                          {census.verifiedAssets} / {census.totalAssets} assets verified
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{Math.round(progress)}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </main>

      {/* Create Census Dialog */}
      <CensusForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleCreateCensus}
      />

      {/* Census Details Dialog */}
      <Dialog open={!!selectedCensus} onOpenChange={() => setSelectedCensus(null)}>
        <DialogContent className="max-w-lg">
          {selectedCensus && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <DialogTitle>{selectedCensus.name}</DialogTitle>
                  <Badge className={statusConfig[selectedCensus.status].color}>
                    {selectedCensus.status}
                  </Badge>
                </div>
                <DialogDescription>
                  Census ID: {selectedCensus.id}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <Separator />
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Scope</p>
                    <p className="font-medium capitalize">{selectedCensus.scope}</p>
                    {selectedCensus.scopeValue && (
                      <p className="text-sm text-muted-foreground">{selectedCensus.scopeValue}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Created</p>
                    <p className="font-medium">
                      {new Date(selectedCensus.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Start Date</p>
                    <p className="font-medium">
                      {new Date(selectedCensus.startDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Deadline</p>
                    <p className="font-medium">
                      {new Date(selectedCensus.deadline).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <Separator />

                <div>
                  <p className="text-sm text-muted-foreground mb-2">Verification Progress</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Assets Verified</span>
                      <span className="font-medium">
                        {selectedCensus.verifiedAssets} / {selectedCensus.totalAssets}
                      </span>
                    </div>
                    <Progress 
                      value={selectedCensus.totalAssets > 0 
                        ? (selectedCensus.verifiedAssets / selectedCensus.totalAssets) * 100 
                        : 0
                      } 
                      className="h-2" 
                    />
                    <p className="text-xs text-muted-foreground">
                      {selectedCensus.totalAssets - selectedCensus.verifiedAssets} assets remaining
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="flex gap-2">
                  {selectedCensus.status === "Draft" && (
                    <Button 
                      className="flex-1" 
                      onClick={() => {
                        handleStartCensus(selectedCensus.id)
                        setSelectedCensus({...selectedCensus, status: "Active"})
                      }}
                    >
                      <Send className="mr-2 h-4 w-4" />
                      Start Census
                    </Button>
                  )}
                  <Button variant="outline" onClick={() => setSelectedCensus(null)}>
                    Close
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
