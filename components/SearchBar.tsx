"use client"

import { Search, X, Clock, Trash2, Sparkles } from "lucide-react"
import { KeyboardEvent, useEffect, useState, useCallback, useRef, useMemo } from "react"
import { cn } from "@/lib/utils"

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  onAISearch?: (query: string) => void
}

const RECENT_SEARCHES_KEY = "ocs-recent-searches"
const MAX_RECENT_SEARCHES = 5
const DEBOUNCE_MS = 300

export function SearchBar({ value, onChange, onAISearch }: SearchBarProps) {
  const [focused, setFocused] = useState(false)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [showRecent, setShowRecent] = useState(false)
  const [debouncedValue, setDebouncedValue] = useState(value)
  const [aiEnabled, setAiEnabled] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Load recent searches from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_SEARCHES_KEY)
      if (stored) {
        const searches = JSON.parse(stored)
        setRecentSearches(Array.isArray(searches) ? searches : [])
      }
    } catch (error) {
      console.error("Failed to load recent searches:", error)
    }
  }, [])

  // Save search to recent searches
  const saveToRecent = useCallback((search: string) => {
    if (!search.trim()) return

    setRecentSearches((prev) => {
      const filtered = prev.filter((s) => s !== search)
      const updated = [search, ...filtered].slice(0, MAX_RECENT_SEARCHES)

      try {
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated))
      } catch (error) {
        console.error("Failed to save recent searches:", error)
      }

      return updated
    })
  }, [])

  // Debounce input changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (debouncedValue !== value) {
        setDebouncedValue(value)
        onChange(value)

        // Save to recent searches when user stops typing
        if (value.trim() && value !== debouncedValue) {
          saveToRecent(value)
        }
      }
    }, DEBOUNCE_MS)

    return () => clearTimeout(timer)
  }, [value, debouncedValue, onChange, saveToRecent])

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "k") {
      e.preventDefault()
      ;(e.target as HTMLInputElement).focus()
    }
    if (e.key === "Escape") {
      ;(e.target as HTMLInputElement).blur()
      setShowRecent(false)
    }
    if (e.key === "Enter" && aiEnabled && value.trim()) {
      e.preventDefault()
      onAISearch?.(value)
    }
  }

  const handleClear = () => {
    onChange("")
    setDebouncedValue("")
    ;(document.activeElement as HTMLInputElement)?.focus()
  }

  const handleRecentSearch = (search: string) => {
    onChange(search)
    setDebouncedValue(search)
    setShowRecent(false)
  }

  const handleClearRecent = () => {
    setRecentSearches([])
    try {
      localStorage.removeItem(RECENT_SEARCHES_KEY)
    } catch (error) {
      console.error("Failed to clear recent searches:", error)
    }
  }

  // Close recent searches when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowRecent(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const hasRecentSearches = recentSearches.length > 0 && !value

  return (
    <div className="relative" ref={containerRef}>
      <div className="flex items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--color-muted-foreground))]">
            <Search className="h-4 w-4" />
          </div>

          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => {
              setFocused(true)
              if (hasRecentSearches) {
                setShowRecent(true)
              }
            }}
            onBlur={() => {
              setFocused(false)
              // Delay hiding recent searches to allow clicking on them
              setTimeout(() => setShowRecent(false), 200)
            }}
            onKeyDown={handleKeyDown}
            placeholder={aiEnabled ? "Describe what you need..." : "Search packages..."}
            className={cn(
              "w-full rounded-lg border bg-[hsl(var(--color-card))] py-2.5 pl-10 pr-10",
              "text-sm text-[hsl(var(--color-foreground))]",
              "placeholder:text-[hsl(var(--color-muted-foreground))]",
              "transition-colors duration-200",
              "focus:outline-none",
              focused ? "border-[hsl(var(--color-primary))] ring-1 ring-[hsl(var(--color-primary))]" : "border-[hsl(var(--color-border))]"
            )}
            autoComplete="off"
          />

          {value && (
            <button
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--color-muted-foreground))] transition-colors hover:text-[hsl(var(--color-foreground))]"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}

          {!value && (
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
              <kbd className="hidden rounded border border-[hsl(var(--color-border))] bg-[hsl(var(--color-muted))] px-1.5 py-0.5 text-[10px] font-medium text-[hsl(var(--color-muted-foreground))] sm:inline-block">
                ⌘K
              </kbd>
            </div>
          )}
        </div>

        {/* AI Toggle */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg glass">
          <Sparkles className={cn(
            "h-4 w-4 transition-colors",
            aiEnabled ? "text-cyan-400" : "text-[hsl(var(--color-muted-foreground))]"
          )} />
          <button
            type="button"
            onClick={() => setAiEnabled(!aiEnabled)}
            role="switch"
            aria-checked={aiEnabled}
            aria-label="Enable AI search"
            className={cn(
              "relative h-5 w-9 rounded-full transition-colors duration-200",
              "focus:outline-none focus:ring-2 focus:ring-[hsl(var(--color-primary))] focus:ring-offset-2",
              aiEnabled ? "bg-[hsl(var(--color-primary))]" : "bg-[hsl(var(--color-muted))]"
            )}
          >
            <span
              className={cn(
                "absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform duration-200",
                aiEnabled ? "translate-x-4" : "translate-x-0.5"
              )}
            />
          </button>
        </div>
      </div>

      {/* AI Hint */}
      {aiEnabled && (
        <p className="text-xs text-[hsl(var(--color-muted-foreground))] mt-2">
          Press Enter to search with AI
        </p>
      )}

      {/* Recent Searches Dropdown */}
      {showRecent && hasRecentSearches && (
        <div className="absolute z-50 mt-2 w-full rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))] shadow-xl">
          <div className="flex items-center justify-between border-b border-[hsl(var(--color-border))] px-3 py-2">
            <div className="flex items-center gap-2 text-xs font-medium text-[hsl(var(--color-muted-foreground))]">
              <Clock className="h-3.5 w-3.5" />
              Recent Searches
            </div>
            <button
              onClick={handleClearRecent}
              className="flex items-center gap-1 text-xs text-[hsl(var(--color-muted-foreground))] transition-colors hover:text-[hsl(var(--color-foreground))]"
              aria-label="Clear recent searches"
            >
              <Trash2 className="h-3 w-3" />
              Clear
            </button>
          </div>
          <div className="max-h-48 overflow-y-auto py-1">
            {recentSearches.map((search, index) => (
              <button
                key={index}
                onClick={() => handleRecentSearch(search)}
                className="w-full px-3 py-2 text-left text-sm text-[hsl(var(--color-muted-foreground))] transition-colors hover:bg-[hsl(var(--color-muted))] hover:text-[hsl(var(--color-foreground))]"
              >
                <div className="flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5 flex-shrink-0" />
                  <span className="truncate">{search}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
