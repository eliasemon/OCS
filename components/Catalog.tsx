"use client"

import { useEffect, useState } from "react"
import type { Package, Category } from "@/types/package"
import { useSelectionStore } from "@/store/selection"
import { SearchBar } from "./SearchBar"
import { CategoryFilter } from "./CategoryFilter"
import { PackageCard } from "./PackageCard"
import { Search } from "lucide-react"

interface CatalogProps {
  packages: Package[]
  initialSelected?: readonly string[]
}

export function Catalog({ packages, initialSelected }: CatalogProps) {
  const { loadPreset } = useSelectionStore()
  const [searchQuery, setSearchQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState<Category>("All")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (initialSelected && initialSelected.length > 0) {
      loadPreset(initialSelected)
    }
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

  return (
    <div className="space-y-6">
      <SearchBar value={searchQuery} onChange={setSearchQuery} />

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
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-900">
            <Search className="h-8 w-8 text-gray-500" />
          </div>
          <h3 className="mb-2 text-lg font-semibold text-gray-100">
            No packages match your search
          </h3>
          <p className="text-sm text-gray-400">
            Try adjusting your search or category filter
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredPackages.map((pkg) => (
            <PackageCard key={pkg.id} package={pkg} />
          ))}
        </div>
      )}
    </div>
  )
}
