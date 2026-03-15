"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { departments, assetCategories } from "@/lib/mock-data"
import type { Census } from "@/lib/mock-data"
import { Spinner } from "@/components/ui/spinner"

interface CensusFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (census: Omit<Census, "id" | "status" | "totalAssets" | "verifiedAssets" | "createdAt">) => void
}

export function CensusForm({ isOpen, onClose, onSubmit }: CensusFormProps) {
  const [name, setName] = useState("")
  const [scope, setScope] = useState<"Full Company" | "Department" | "Asset Category">("Full Company")
  const [scopeValue, setScopeValue] = useState("")
  const [startDate, setStartDate] = useState("")
  const [deadline, setDeadline] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800))
    
    onSubmit({
      name,
      scope,
      scopeValue: scope !== "Full Company" ? scopeValue : undefined,
      startDate,
      deadline,
    })
    
    setIsSubmitting(false)
    resetForm()
    onClose()
  }

  const resetForm = () => {
    setName("")
    setScope("Full Company")
    setScopeValue("")
    setStartDate("")
    setDeadline("")
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Census</DialogTitle>
          <DialogDescription>
            Set up a new asset verification census. Notifications will be sent to all affected employees.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="census-name">Census Name</Label>
            <Input
              id="census-name"
              placeholder="e.g., Q2 2026 Laptop Audit"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="scope">Scope</Label>
            <Select value={scope} onValueChange={(v) => setScope(v as typeof scope)}>
              <SelectTrigger id="scope">
                <SelectValue placeholder="Select scope" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Full Company">Full Company</SelectItem>
                <SelectItem value="Department">Department</SelectItem>
                <SelectItem value="Asset Category">Asset Category</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {scope === "Department" && (
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Select value={scopeValue} onValueChange={setScopeValue}>
                <SelectTrigger id="department">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {scope === "Asset Category" && (
            <div className="space-y-2">
              <Label htmlFor="category">Asset Category</Label>
              <Select value={scopeValue} onValueChange={setScopeValue}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {assetCategories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-date">Start Date</Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deadline">Deadline</Label>
              <Input
                id="deadline"
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Spinner className="mr-2" />
                  Creating...
                </>
              ) : (
                "Create Census"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
