/**
 * Client-side app page component that uses URL preset loading
 * This must be a separate component to properly handle Suspense boundaries
 */

"use client"

import packagesData from "@/data/packages.json"
import type { Package } from "@/types/package"
import { Catalog } from "@/components/Catalog"
import { Sidebar } from "@/components/Sidebar"
import { Navbar } from "@/components/Navbar"
import { useState } from "react"
import { usePresetFromURL } from "@/hooks/usePresetFromUrl"

export function AppPageClient() {
  const packages = packagesData as Package[]
  const [searchQuery, setSearchQuery] = useState("")

  // Load preset from URL on mount
  const { loaded: presetLoaded, error: presetError, packageCount: loadedPackageCount } = usePresetFromURL()

  const handleCommandClick = () => {
    // TODO: Open command modal
    console.log("Command clicked, selected packages will be shown")
  }

  const handleAISearch = (query: string) => {
    // TODO: Implement AI search
    console.log("AI search:", query)
  }

  return (
    <div className="flex flex-col min-h-screen bg-[hsl(var(--color-background))]">
      {/* Navbar with glassmorphism */}
      <Navbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onAISearch={handleAISearch}
        onCommandClick={handleCommandClick}
      />

      {/* Body */}
      <div className="flex flex-1 overflow-hidden px-4 pb-4">
        {/* Main Catalog */}
        <main className="flex-1 overflow-y-auto">
          <Catalog packages={packages} searchQuery={searchQuery} />
        </main>
        {/* Sidebar — hidden on mobile, visible md+ */}
        <aside className="hidden md:flex flex-col w-80 border-l border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))] rounded-lg ml-4">
          <Sidebar packages={packages} />
        </aside>
      </div>

      {/* Mobile bottom bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))]">
        <Sidebar packages={packages} />
      </div>
    </div>
  )
}
