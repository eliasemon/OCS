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
    <div className="mb-6 flex items-center justify-between rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-accent))/0.1] px-4 py-3">
      <div className="flex items-center gap-3">
        <span className="text-xl">🔗</span>
        <div>
          <p className="font-medium text-[hsl(var(--color-foreground))]">
            {count} {count === 1 ? "app" : "apps"} pre-selected from a shared link
          </p>
          {presetId && (
            <p className="text-sm text-[hsl(var(--color-muted-foreground))]">Using preset: {presetId}</p>
          )}
        </div>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="flex h-8 w-8 items-center justify-center rounded-md text-[hsl(var(--color-muted-foreground))] transition-colors hover:bg-[hsl(var(--color-muted))] hover:text-[hsl(var(--color-foreground))]"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
