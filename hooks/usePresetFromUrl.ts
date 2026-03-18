/**
 * usePresetFromURL Hook
 *
 * React hook to load package selections from URL parameters.
 * Enables URL-based preset sharing without backend.
 */

"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { parsePresetFromUrl } from "@/lib/urlShare"
import { getPresetById } from "@/lib/presets"
import { useSelectionStore } from "@/store/selection"

interface PresetFromUrlResult {
  loaded: boolean
  presetId?: string
  packageCount: number
  error?: string
}

/**
 * Hook to load preset from URL parameters on mount
 *
 * IMPORTANT: This hook uses useSearchParams() and must be wrapped
 * in a Suspense boundary when used in Server Components.
 *
 * Usage:
 * ```tsx
 * <Suspense fallback={<Loading />}>
 *   <YourComponent />
 * </Suspense>
 *
 * // In YourComponent:
 * const { loaded, presetId, packageCount, error } = usePresetFromURL()
 * ```
 */
export function usePresetFromURL(): PresetFromUrlResult {
  const searchParams = useSearchParams()
  const { loadPreset } = useSelectionStore()
  const [result, setResult] = useState<PresetFromUrlResult>({
    loaded: false,
    packageCount: 0,
  })

  useEffect(() => {
    const presetData = parsePresetFromUrl(searchParams)

    if (!presetData) {
      setResult({ loaded: true, packageCount: 0 })
      return
    }

    try {
      if (presetData.presetId) {
        // Load built-in preset
        const preset = getPresetById(presetData.presetId)
        if (preset) {
          loadPreset(preset.packageIds)
          setResult({
            loaded: true,
            presetId: preset.id,
            packageCount: preset.packageIds.length,
          })
        } else {
          setResult({
            loaded: true,
            packageCount: 0,
            error: `Preset "${presetData.presetId}" not found`,
          })
        }
      } else if (presetData.packages.length > 0) {
        // Load custom package list from URL
        loadPreset(presetData.packages)
        setResult({
          loaded: true,
          packageCount: presetData.packages.length,
        })
      } else {
        setResult({
          loaded: true,
          packageCount: 0,
          error: "No packages found in URL",
        })
      }
    } catch (error) {
      setResult({
        loaded: true,
        packageCount: 0,
        error: error instanceof Error ? error.message : "Failed to load preset",
      })
    }
  }, [searchParams, loadPreset])

  return result
}

/**
 * Hook to generate a shareable URL for current selection
 */
export function useShareUrl(packageIds: string[]) {
  const [shareUrl, setShareUrl] = useState<string>("")
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return

    const url = new URL(window.location.href)

    // Clear existing params
    url.searchParams.delete("packages")
    url.searchParams.delete("preset")

    // Add new package IDs
    if (packageIds.length > 0) {
      const encoded = packageIds.join(",")
      url.searchParams.set("packages", encoded)
    }

    setShareUrl(url.toString())
  }, [packageIds])

  const copy = async (): Promise<boolean> => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      return true
    } catch {
      return false
    }
  }

  return { shareUrl, copy, copied }
}
