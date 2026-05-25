"use client"

import { useEffect, useState, useRef } from "react"
import { useVirtualizer } from "@tanstack/react-virtual"
import type { Package, Category } from "@/types/package"
import { useSelectionStore } from "@/store/selection"
import { CategoryFilter } from "./CategoryFilter"
import { PackageCard } from "./PackageCard"
import { Search, Package as PackageIcon } from "lucide-react"

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
  if (width >= 1280) return 3 // xl:grid-cols-3
  if (width >= 768) return 2  // md:grid-cols-2
  return 1                    // grid-cols-1
}

const ESTIMATED_ROW_HEIGHT = 180 // Estimated height for each row

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
    overscan: 3, // Render 3 extra rows above/below viewport
  })

  if (!mounted) {
    return (
      <div className="space-y-6">
        {/* Category filter skeleton */}
        <div className="flex gap-2 overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-10 w-24 animate-pulse rounded-xl bg-[hsl(var(--color-muted))]" />
          ))}
        </div>
        {/* Cards skeleton */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="h-40 animate-pulse rounded-xl bg-[hsl(var(--color-muted))]" />
          ))}
        </div>
      </div>
    )
  }

  const virtualItems = virtualizer.getVirtualItems()

  return (
    <div className="flex flex-col h-full space-y-6">
      {/* Category Filter */}
      <CategoryFilter
        selected={activeCategory}
        onChange={setActiveCategory}
        counts={categoryCounts}
      />

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-[hsl(var(--color-muted-foreground))]">
          Showing <span className="font-semibold text-[hsl(var(--color-foreground))]">{filteredPackages.length}</span> of {packages.length} packages
        </p>
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            Clear search
          </button>
        )}
      </div>

      {/* Package Grid or Empty State */}
      {filteredPackages.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500/10 to-violet-500/10 ring-1 ring-[hsl(var(--color-border))]">
            {searchQuery ? (
              <Search className="h-12 w-12 text-cyan-400" />
            ) : (
              <PackageIcon className="h-12 w-12 text-violet-400" />
            )}
          </div>
          <h3 className="mb-3 text-xl font-semibold text-[hsl(var(--color-foreground))]">
            {searchQuery ? "No packages found" : "No packages in this category"}
          </h3>
          <p className="mb-8 max-w-md text-sm text-[hsl(var(--color-muted-foreground))] leading-relaxed">
            {searchQuery
              ? `We couldn't find any packages matching "${searchQuery}". Try different keywords or browse all packages.`
              : "There are no packages in this category yet. Try selecting a different category."}
          </p>
          {searchQuery && (
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                onClick={() => setSearchQuery("")}
                className="btn-primary"
              >
                <Search className="h-4 w-4 mr-2" />
                Clear Search
              </button>
              <button
                onClick={() => setActiveCategory("All")}
                className="btn-secondary"
              >
                <PackageIcon className="h-4 w-4 mr-2" />
                Browse All Packages
              </button>
            </div>
          )}
        </div>
      ) : (
        <div
          ref={parentRef}
          className="flex-1 overflow-y-auto pr-2 -mr-2 min-h-0"
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
                    padding: '0.5rem 0',
                  }}
                >
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
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
