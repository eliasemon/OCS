"use client"

import Link from "next/link"
import { Zap, Terminal } from "lucide-react"
import { ThemeToggle } from "@/components/ThemeToggle"
import { SearchBar } from "@/components/SearchBar"
import { useSelectionStore } from "@/store/selection"
import { cn } from "@/lib/utils"

interface NavbarProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  onAISearch?: (query: string) => void
  onCommandClick?: () => void
}

export function Navbar({
  searchQuery,
  onSearchChange,
  onAISearch,
  onCommandClick
}: NavbarProps) {
  const { count: selectedCount } = useSelectionStore()

  return (
    <nav className="sticky top-4 z-50 mx-4">
      <div className="max-w-7xl mx-auto">
        <div className="glass rounded-xl px-6 py-4 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 flex-shrink-0">
            <div className="h-10 w-10 bg-gradient-to-br from-cyan-500 to-emerald-500 rounded-lg flex items-center justify-center shadow-lg">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <span className="font-bold text-xl">OCS</span>
          </Link>

          {/* Search */}
          <div className="flex-1 max-w-xl min-w-0">
            <SearchBar
              value={searchQuery}
              onChange={onSearchChange}
              onAISearch={onAISearch}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4 flex-shrink-0">
            <ThemeToggle />
            <button
              onClick={onCommandClick}
              className={cn(
                "inline-flex items-center justify-center rounded-lg px-4 py-2",
                "text-sm font-medium transition-all duration-200",
                "hover:scale-105 active:scale-100",
                selectedCount > 0
                  ? "bg-[hsl(var(--color-primary))] text-[hsl(var(--color-primary-foreground))] shadow-lg"
                  : "bg-[hsl(var(--color-card))] border border-[hsl(var(--color-border))] text-[hsl(var(--color-foreground))]"
              )}
            >
              <Terminal className="mr-2 h-4 w-4" />
              {selectedCount > 0 ? `Install ${selectedCount}` : "Command"}
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
