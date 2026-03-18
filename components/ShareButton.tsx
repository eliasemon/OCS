/**
 * Share Button Component
 *
 * Button to generate and copy shareable URL for current selection.
 */

"use client"

import { useState, useCallback } from "react"
import { Share2, Check, Link } from "lucide-react"
import { useSelectionStore } from "@/store/selection"
import { useShareUrl } from "@/hooks/usePresetFromUrl"
import { cn } from "@/lib/utils"

interface ShareButtonProps {
  className?: string
  variant?: "default" | "compact"
}

export function ShareButton({ className, variant = "default" }: ShareButtonProps) {
  const selectedIds = useSelectionStore((state) => Array.from(state.selectedIds))
  const { shareUrl, copy, copied } = useShareUrl(selectedIds)
  const [isCopied, setIsCopied] = useState(false)

  const handleShare = useCallback(async () => {
    const success = await copy()
    if (success) {
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    }
  }, [copy])

  if (selectedIds.length === 0) {
    return null
  }

  if (variant === "compact") {
    return (
      <button
        onClick={handleShare}
        className={cn(
          "inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
          "bg-cyan-600 text-white hover:bg-cyan-500",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          className
        )}
        title={`Share ${selectedIds.length} package${selectedIds.length > 1 ? 's' : ''}`}
      >
        {isCopied ? (
          <Check className="h-4 w-4" />
        ) : (
          <Link className="h-4 w-4" />
        )}
        <span className="hidden sm:inline">{isCopied ? "Copied!" : "Share"}</span>
      </button>
    )
  }

  return (
    <button
      onClick={handleShare}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors",
        "bg-gray-800 text-gray-100 ring-1 ring-gray-700 hover:bg-gray-700",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        className
      )}
    >
      {isCopied ? (
        <>
          <Check className="h-4 w-4 text-emerald-400" />
          <span>URL Copied!</span>
        </>
      ) : (
        <>
          <Share2 className="h-4 w-4" />
          <span>Share Selection ({selectedIds.length})</span>
        </>
      )}
    </button>
  )
}

/**
 * Inline share button for smaller spaces
 */
export function InlineShareButton({ className }: { className?: string }) {
  return <ShareButton variant="compact" className={className} />
}
