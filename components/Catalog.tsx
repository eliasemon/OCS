"use client"

import { useEffect, useState, useRef } from "react"
import { useVirtualizer } from "@tanstack/react-virtual"
import type { Package, Category } from "@/types/package"
import { useSelectionStore } from "@/store/selection"
import { CategoryFilter } from "./CategoryFilter"
import { PackageCard } from "./PackageCard"
import { Search } from "lucide-react"

interface CatalogProps {
  packages: Package[]
  initialSelected?: readonly string[]
  searchQuery?: string
  onSearchChange?: (query: string) => void
}

// Helper to group packages into rows for responsive grid
function groupPackagesIntoRows(packages: Package[], columns: number) {
  const rows: Package[][] = []
  for (let i = 0; i < packages.length; i += columns) {
    rows.push(packages.slice(i, i + columns))
  }
  return rows
}

// Get number of columns based on window width
function getColumnsCount(width: number): number {
  if (width >= 1024) return 3 // lg:grid-cols-3
  if (width >= 640) return 2  // sm:grid-cols-2
  return 1                    // grid-cols-1
}

const ESTIMATED_ROW_HEIGHT = 220 // Estimated height for each row

export function Catalog({ packages, initialSelected, searchQuery: externalSearchQuery, onSearchChange }: CatalogProps) {
  const { loadPreset } = useSelectionStore()
  const [internalSearchQuery, setInternalSearchQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState<Category>("All")
  const [mounted, setMounted] = useState(false)
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024)

  // Use external search query if provided, otherwise use internal state
  const searchQuery = externalSearchQuery ?? internalSearchQuery
  const setSearchQuery = onSearchChange ?? setInternalSearchQuery

  // Ref for the scrollable container
  const parentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
    if (initialSelected && initialSelected.length > 0) {
      loadPreset(initialSelected)
    }

    // Handle window resize to update column count
    const handleResize = () => setWindowWidth(window.innerWidth)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [initialSelected, loadPreset])

  const filteredPackages = packages.filter((pkg) => {
    const matchesCategory = activeCategory === "All" || pkg.category === activeCategory
    const matchesSearch =
      searchQuery === "" ||
      pkg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pkg.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pkg.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))

    return matchesCategory && matchesSearch
  })

  const categoryCounts: Record<string, number> = {
    All: packages.length,
    ...packages.reduce((acc, pkg) => {
      acc[pkg.category] = (acc[pkg.category] || 0) + 1
      return acc
    }, {} as Record<string, number>),
  }

  // Group packages into rows based on current column count
  const columns = getColumnsCount(windowWidth)
  const packageRows = groupPackagesIntoRows(filteredPackages, columns)

  // Create virtual row scanner for our package rows
  const virtualizer = useVirtualizer({
    count: packageRows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ESTIMATED_ROW_HEIGHT,
    overscan: 2, // Render 2 extra rows above/below viewport
  })

  if (!mounted) {
    return (
      <div className="space-y-6">
        <div className="h-12 animate-pulse rounded-lg bg-gray-900" />
        <div className="h-10 animate-pulse rounded-lg bg-gray-900" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-40 animate-pulse rounded-xl bg-gray-900" />
          ))}
        </div>
      </div>
    )
  }

  const virtualItems = virtualizer.getVirtualItems()

  return (
    <div className="space-y-6">
      {/* Only show CategoryFilter internally if using external search */}
      <CategoryFilter
        selected={activeCategory}
        onChange={setActiveCategory}
        counts={categoryCounts}
      />

      <div className="text-sm text-gray-400">
        Showing {filteredPackages.length} of {packages.length} packages
      </div>

      {filteredPackages.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-cyan-950/50 to-blue-950/50 ring-1 ring-cyan-500/20">
            <Search className="h-10 w-10 text-cyan-400" />
          </div>
          <h3 className="mb-3 text-xl font-semibold text-gray-100">
            {searchQuery ? "No packages found" : "No packages in this category"}
          </h3>
          <p className="mb-6 max-w-md text-sm text-gray-400">
            {searchQuery
              ? `We couldn't find any packages matching "${searchQuery}". Try different keywords or browse all packages.`
              : "There are no packages in this category yet. Try selecting a different category."}
          </p>
          {searchQuery && (
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                onClick={() => setSearchQuery("")}
                className="inline-flex items-center justify-center rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-gray-100 transition-colors hover:bg-cyan-500"
              >
                Clear Search
              </button>
              <button
                onClick={() => setActiveCategory("All")}
                className="inline-flex items-center justify-center rounded-lg bg-gray-800 px-4 py-2 text-sm font-semibold text-gray-100 ring-1 ring-gray-700 transition-colors hover:bg-gray-700"
              >
                Browse All Packages
              </button>
            </div>
          )}
        </div>
      ) : (
        <div
          ref={parentRef}
          className="h-[calc(100vh-16rem)] overflow-auto"
          style={{
            willChange: 'transform',
            transform: 'translateZ(0)',
          }}
        >
          <div
            style={{
              height: `${virtualizer.getTotalSize()}px`,
              width: '100%',
              position: 'relative',
            }}
          >
            {virtualItems.map((virtualItem) => {
              const rowPackages = packageRows[virtualItem.index]
              return (
                <div
                  key={virtualItem.key}
                  data-index={virtualItem.index}
                  ref={virtualizer.measureElement}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    transform: `translateY(${virtualItem.start}px)`,
                    padding: '1rem 0',
                  }}
                >
                  <div className="grid grid-cols-1 gap-4 px-4 sm:grid-cols-2 lg:grid-cols-3">
                    {rowPackages.map((pkg) => (
                      <PackageCard key={pkg.id} package={pkg} />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
