/**
 * Client-side app page component that uses URL preset loading
 * This must be a separate component to properly handle Suspense boundaries
 */

"use client"

import { useState } from "react"
import packagesData from "@/data/packages.json"
import type { Package } from "@/types/package"
import { Catalog } from "@/components/Catalog"
import { Sidebar } from "@/components/Sidebar"
import { Navbar } from "@/components/Navbar"
import { CommandModal } from "@/components/CommandModal"
import { usePresetFromURL } from "@/hooks/usePresetFromUrl"
import { useSelectionStore } from "@/store/selection"

export function AppPageClient() {
  const packages = packagesData as Package[]
  const [searchQuery, setSearchQuery] = useState("")
  const [commandModalOpen, setCommandModalOpen] = useState(false)

  // Load preset from URL on mount
  const { loaded: presetLoaded, error: presetError, packageCount: loadedPackageCount } = usePresetFromURL()

  const { selectedIds } = useSelectionStore()

  const handleCommandClick = () => {
    setCommandModalOpen(true)
  }

  const handleAISearch = (query: string) => {
    // TODO: Implement AI search
    console.log("AI search:", query)
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[hsl(var(--color-background))]">
      {/* Background decoration */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[hsl(var(--color-primary)/0.05)] rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[hsl(var(--color-accent)/0.05)] rounded-full blur-3xl" />
      </div>

      {/* Navbar with glassmorphism */}
      <Navbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onAISearch={handleAISearch}
        onCommandClick={handleCommandClick}
      />

      {/* Body */}
      <div className="relative flex flex-1 overflow-hidden px-4 pb-4">
        {/* Main Catalog */}
        <main className="flex-1 flex flex-col min-w-0 pr-2">
          <Catalog packages={packages} searchQuery={searchQuery} />
        </main>
        
        {/* Sidebar — hidden on mobile, visible lg+ */}
        <Sidebar packages={packages} onCommandClick={handleCommandClick} />
      </div>

      {/* Command Modal */}
      <CommandModal
        open={commandModalOpen}
        onClose={() => setCommandModalOpen(false)}
        selectedIds={Array.from(selectedIds)}
      />
    </div>
  )
}
