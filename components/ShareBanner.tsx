"use client"

import { useEffect, useState } from "react"
import { useSelectionStore } from "@/store/selection"
import { X } from "lucide-react"

interface ShareBannerProps {
  appIds: readonly string[]
  presetId: string | null
  count: number
}

export function ShareBanner({ appIds, presetId, count }: ShareBannerProps) {
  const { loadPreset } = useSelectionStore()
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (appIds.length > 0) {
      loadPreset(appIds)
    }
  }, [appIds, loadPreset])

  if (dismissed || count === 0) return null

  return (
    <div className="mb-6 flex items-center justify-between rounded-lg border border-amber-500/30 bg-amber-950/20 px-4 py-3">
      <div className="flex items-center gap-3">
        <span className="text-xl">🔗</span>
        <div>
          <p className="font-medium text-amber-200">
            {count} {count === 1 ? "app" : "apps"} pre-selected from a shared link
          </p>
          {presetId && (
            <p className="text-sm text-amber-300/70">Using preset: {presetId}</p>
          )}
        </div>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="flex h-8 w-8 items-center justify-center rounded-md text-amber-300 transition-colors hover:bg-amber-900/30"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
