"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { locations } from "@/lib/mock-data"
import { Spinner } from "@/components/ui/spinner"

interface VerificationFormProps {
  currentLocation: string
  currentCondition: "Good" | "Fair" | "Damaged"
  onSubmit: (data: {
    location: string
    condition: "Good" | "Fair" | "Damaged"
    possessionVerified: boolean
  }) => void
  isSubmitting?: boolean
}

export function VerificationForm({
  currentLocation,
  currentCondition,
  onSubmit,
  isSubmitting = false,
}: VerificationFormProps) {
  const [location, setLocation] = useState(currentLocation)
  const [condition, setCondition] = useState<"Good" | "Fair" | "Damaged">(currentCondition)
  const [possessionVerified, setPossessionVerified] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({ location, condition, possessionVerified })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="location">Confirm Location</Label>
        <Select value={location} onValueChange={setLocation}>
          <SelectTrigger id="location">
            <SelectValue placeholder="Select location" />
          </SelectTrigger>
          <SelectContent>
            {locations.map((loc) => (
              <SelectItem key={loc} value={loc}>
                {loc}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="condition">Asset Condition</Label>
        <Select value={condition} onValueChange={(v) => setCondition(v as "Good" | "Fair" | "Damaged")}>
          <SelectTrigger id="condition">
            <SelectValue placeholder="Select condition" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Good">Good</SelectItem>
            <SelectItem value="Fair">Fair</SelectItem>
            <SelectItem value="Damaged">Damaged</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-3 rounded-lg border p-4">
        <Checkbox
          id="possession"
          checked={possessionVerified}
          onCheckedChange={(checked) => setPossessionVerified(checked === true)}
        />
        <Label htmlFor="possession" className="text-sm leading-relaxed cursor-pointer">
          I confirm that I have physically verified possession of this asset
        </Label>
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={!possessionVerified || isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Spinner className="mr-2" />
            Submitting...
          </>
        ) : (
          "Submit Verification"
        )}
      </Button>
    </form>
  )
}
