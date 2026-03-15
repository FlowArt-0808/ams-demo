"use client"

import { useState, useEffect } from "react"
import { X, ScanLine } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface MockQRScannerProps {
  isOpen: boolean
  onClose: () => void
  onScan: (assetId: string) => void
  mockAssetId?: string
}

export function MockQRScanner({
  isOpen,
  onClose,
  onScan,
  mockAssetId = "MAC-2026-001",
}: MockQRScannerProps) {
  const [scanning, setScanning] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (isOpen) {
      setScanning(true)
      setProgress(0)
      
      // Simulate scanning progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(progressInterval)
            return 100
          }
          return prev + 5
        })
      }, 100)

      // Auto-complete scan after 2 seconds
      const scanTimeout = setTimeout(() => {
        setScanning(false)
        onScan(mockAssetId)
      }, 2000)

      return () => {
        clearInterval(progressInterval)
        clearTimeout(scanTimeout)
      }
    }
  }, [isOpen, mockAssetId, onScan])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Close button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4 z-10 text-white hover:bg-white/20"
        onClick={onClose}
      >
        <X className="h-6 w-6" />
        <span className="sr-only">Close scanner</span>
      </Button>

      {/* Scanner viewport */}
      <div className="relative h-full w-full flex items-center justify-center">
        {/* Simulated camera view (dark with noise effect) */}
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-900 via-zinc-800 to-zinc-900" />
        
        {/* Scan frame */}
        <div className="relative z-10 w-64 h-64 md:w-80 md:h-80">
          {/* Corner brackets */}
          <div className="absolute top-0 left-0 w-8 h-8 border-l-4 border-t-4 border-emerald-500 rounded-tl-lg" />
          <div className="absolute top-0 right-0 w-8 h-8 border-r-4 border-t-4 border-emerald-500 rounded-tr-lg" />
          <div className="absolute bottom-0 left-0 w-8 h-8 border-l-4 border-b-4 border-emerald-500 rounded-bl-lg" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-r-4 border-b-4 border-emerald-500 rounded-br-lg" />

          {/* Scanning line animation */}
          {scanning && (
            <div
              className="absolute left-2 right-2 h-0.5 bg-gradient-to-r from-transparent via-emerald-500 to-transparent"
              style={{
                top: `${progress}%`,
                transition: "top 0.1s linear",
              }}
            />
          )}

          {/* QR placeholder */}
          <div className="absolute inset-8 border border-dashed border-white/30 rounded-lg flex items-center justify-center">
            <div className="grid grid-cols-3 gap-1 opacity-30">
              {[...Array(9)].map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "w-4 h-4 bg-white rounded-sm",
                    i === 4 && "bg-transparent"
                  )}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="absolute bottom-20 left-0 right-0 text-center">
          <div className="flex items-center justify-center gap-2 text-white mb-2">
            <ScanLine className="h-5 w-5 animate-pulse text-emerald-500" />
            <span className="text-lg font-medium">
              {scanning ? "Scanning..." : "Position QR code in frame"}
            </span>
          </div>
          <p className="text-sm text-white/60">
            Hold steady for best results
          </p>
          
          {/* Progress bar */}
          <div className="mt-4 mx-auto w-48 h-1 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-100"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
