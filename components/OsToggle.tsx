"use client"

import { Monitor, Laptop } from "lucide-react"
import { useOsStore } from "@/store/os"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"

export function OsToggle() {
  const { os, setOs } = useOsStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="flex items-center gap-1 p-1 bg-[hsl(var(--color-card))] border border-[hsl(var(--color-border))] rounded-xl h-10 w-24">
        <div className="flex-1 h-full rounded-lg animate-pulse bg-[hsl(var(--color-muted))]" />
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1 p-1 bg-[hsl(var(--color-card))] border border-[hsl(var(--color-border))] rounded-xl h-10">
      <button
        onClick={() => setOs("windows")}
        className={cn(
          "flex items-center justify-center gap-2 px-3 h-full rounded-lg text-sm font-medium transition-all duration-300",
          os === "windows"
            ? "bg-[hsl(var(--color-primary))] text-white shadow-md"
            : "text-[hsl(var(--color-muted-foreground))] hover:text-[hsl(var(--color-foreground))] hover:bg-[hsl(var(--color-muted))]"
        )}
        title="Windows Setup"
      >
        <Monitor className="h-4 w-4" />
        <span className="hidden sm:inline-block">Win</span>
      </button>
      <button
        onClick={() => setOs("mac")}
        className={cn(
          "flex items-center justify-center gap-2 px-3 h-full rounded-lg text-sm font-medium transition-all duration-300",
          os === "mac"
            ? "bg-[hsl(var(--color-primary))] text-white shadow-md"
            : "text-[hsl(var(--color-muted-foreground))] hover:text-[hsl(var(--color-foreground))] hover:bg-[hsl(var(--color-muted))]"
        )}
        title="Mac Setup"
      >
        <Laptop className="h-4 w-4" />
        <span className="hidden sm:inline-block">Mac</span>
      </button>
    </div>
  )
}
