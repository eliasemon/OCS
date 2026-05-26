"use client"

import Link from "next/link"
import { Zap, Terminal, Sparkles } from "lucide-react"
import { ThemeToggle } from "@/components/ThemeToggle"
import { OsToggle } from "@/components/OsToggle"
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
    <nav className="sticky top-0 z-50 px-4 py-4">
      <div className="max-w-7xl mx-auto">
        <div className="glass rounded-2xl px-6 py-3 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 flex-shrink-0 group">
            <div className="h-10 w-10 rounded-xl bg-[hsl(var(--color-primary))] flex items-center justify-center shadow-lg group-hover:shadow-[var(--shadow-glow-primary)] transition-shadow duration-300">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-xl text-[hsl(var(--color-foreground))] hidden sm:block">OCS</span>
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
          <div className="flex items-center gap-3 flex-shrink-0">
            <OsToggle />
            <ThemeToggle />
            
            {/* Command Button */}
            <button
              onClick={onCommandClick}
              className={cn(
                "relative inline-flex items-center justify-center rounded-xl px-4 py-2.5",
                "text-sm font-semibold transition-all duration-300",
                "hover:scale-[1.02] active:scale-100",
                selectedCount > 0
                  ? "bg-[hsl(var(--color-primary))] text-white shadow-lg shadow-[var(--shadow-glow-primary)]"
                  : "bg-[hsl(var(--color-card))] border border-[hsl(var(--color-border))] hover:border-[hsl(var(--color-border-hover))] text-[hsl(var(--color-foreground))] hover:bg-[hsl(var(--color-card-elevated))]"
              )}
            >
              <Terminal className="mr-2 h-4 w-4" />
              {selectedCount > 0 ? (
                <span className="flex items-center gap-2">
                  Install
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-xs font-bold">
                    {selectedCount}
                  </span>
                </span>
              ) : (
                "Command"
              )}
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
