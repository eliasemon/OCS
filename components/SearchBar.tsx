"use client"

import { Search, X, Clock, Trash2, Sparkles, Command } from "lucide-react"
import { KeyboardEvent, useEffect, useState, useCallback, useRef } from "react"
import { cn } from "@/lib/utils"

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  onAISearch?: (query: string) => void
}

const RECENT_SEARCHES_KEY = "installora-recent-searches"
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
          {/* Search Icon */}
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[hsl(var(--color-muted-foreground))]">
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
              setTimeout(() => setShowRecent(false), 200)
            }}
            onKeyDown={handleKeyDown}
            placeholder={aiEnabled ? "Describe what you need..." : "Search packages, IDs, or tags..."}
            className={cn(
              "w-full rounded-xl py-3 pl-11 pr-24",
              "text-sm text-[hsl(var(--color-foreground))]",
              "placeholder:text-[hsl(var(--color-muted-foreground))]",
              "transition-all duration-300",
              "focus:outline-none",
              focused 
                ? "bg-[hsl(var(--color-card))] border border-[hsl(var(--color-primary)/0.5)] shadow-[var(--shadow-glow-primary)]" 
                : "bg-[hsl(var(--color-card))] border border-[hsl(var(--color-border))] hover:border-[hsl(var(--color-border-hover))]"
            )}
            autoComplete="off"
          />

          {/* Right side actions */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {value && (
              <button
                onClick={handleClear}
                className="p-1 rounded-md text-[hsl(var(--color-muted-foreground))] transition-colors hover:text-[hsl(var(--color-foreground))] hover:bg-[hsl(var(--color-muted))]"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            {!value && (
              <kbd className="hidden sm:inline-flex items-center gap-1 rounded-md border border-[hsl(var(--color-border))] bg-[hsl(var(--color-muted))] px-2 py-1 text-[10px] font-medium text-[hsl(var(--color-muted-foreground))]">
                <Command className="h-3 w-3" />K
              </kbd>
            )}
          </div>
        </div>

        {/* AI Toggle */}
        <button
          type="button"
          onClick={() => setAiEnabled(!aiEnabled)}
          className={cn(
            "flex items-center gap-2 px-4 py-3 rounded-xl transition-all duration-300 border",
            aiEnabled 
              ? "bg-[hsl(var(--color-primary)/0.1)] border-[hsl(var(--color-primary)/0.5)] text-[hsl(var(--color-primary))]" 
              : "glass border-[hsl(var(--color-border))] text-[hsl(var(--color-muted-foreground))] hover:border-[hsl(var(--color-border-hover))]"
          )}
        >
          <Sparkles className={cn(
            "h-4 w-4 transition-all duration-300",
            aiEnabled && "animate-pulse text-[hsl(var(--color-primary))]"
          )} />
          <span className="text-sm font-medium hidden sm:block">AI</span>
        </button>
      </div>

      {/* AI Hint */}
      {aiEnabled && (
        <p className="text-xs text-[hsl(var(--color-primary))] mt-2 ml-1 animate-fade-in">
          Press Enter to search with AI
        </p>
      )}

      {/* Recent Searches Dropdown */}
      {showRecent && hasRecentSearches && (
        <div className="absolute z-50 mt-2 w-full rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))] shadow-xl overflow-hidden animate-scale-in">
          <div className="flex items-center justify-between border-b border-[hsl(var(--color-border))] px-4 py-3">
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
                className="w-full px-4 py-2.5 text-left text-sm text-[hsl(var(--color-muted-foreground))] transition-colors hover:bg-[hsl(var(--color-muted))] hover:text-[hsl(var(--color-foreground))] flex items-center gap-3"
              >
                <Clock className="h-3.5 w-3.5 flex-shrink-0 opacity-50" />
                <span className="truncate">{search}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
