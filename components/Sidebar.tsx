"use client"

import { useState } from "react"
import { useSelectionStore } from "@/store/selection"
import { PresetManager } from "./PresetManager"
import { Button } from "./ui/button"
import { ScrollArea } from "./ui/scroll-area"
import { Separator } from "./ui/separator"
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet"
import { X, Check, ShoppingBag, Sparkles, Terminal } from "lucide-react"
import type { Package } from "@/types/package"
import { cn } from "@/lib/utils"
import { PackageIcon } from "./PackageIcon"

interface SidebarProps {
  packages: Package[]
  onCommandClick?: () => void
}

export function Sidebar({ packages, onCommandClick }: SidebarProps) {
  const { selectedIds, isSelected, togglePackage, clearAll, count } = useSelectionStore()
  const [mobileOpen, setMobileOpen] = useState(false)

  const selectedPackages = packages.filter((pkg) => selectedIds.has(pkg.id))

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-5">
        <h2 className="flex items-center gap-3 text-lg font-semibold text-[hsl(var(--color-foreground))]">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[hsl(var(--color-primary)/0.2)]">
            <ShoppingBag className="h-5 w-5 text-[hsl(var(--color-primary))]" />
          </div>
          <div>
            <span>Selected Apps</span>
            {count > 0 && (
              <span className="ml-2 inline-flex h-6 items-center justify-center rounded-full bg-[hsl(var(--color-primary))] px-2.5 text-xs font-bold text-white">
                {count}
              </span>
            )}
          </div>
        </h2>
        {count > 0 && (
          <button
            onClick={clearAll}
            className="text-sm text-[hsl(var(--color-muted-foreground))] transition-colors hover:text-[hsl(var(--color-destructive))] font-medium"
          >
            Clear all
          </button>
        )}
      </div>

      <Separator className="bg-[hsl(var(--color-border))]" />

      {/* Selected Packages List */}
      <ScrollArea className="flex-1 min-h-0">
        {count === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl border border-dashed border-[hsl(var(--color-border))] bg-[hsl(var(--color-muted))]">
              <ShoppingBag className="h-8 w-8 text-[hsl(var(--color-muted-foreground))]" />
            </div>
            <p className="text-sm font-medium text-[hsl(var(--color-foreground))] mb-1">No apps selected</p>
            <p className="text-xs text-[hsl(var(--color-muted-foreground))]">Click on packages to add them</p>
          </div>
        ) : (
          <div className="p-3 space-y-2">
            {selectedPackages.map((pkg, index) => (
              <div
                key={pkg.id}
                className={cn(
                  "flex items-center gap-3 rounded-xl p-3 transition-all duration-300",
                  "bg-[hsl(var(--color-card))] border border-[hsl(var(--color-border))]",
                  "hover:border-[hsl(var(--color-primary)/0.3)] hover:bg-[hsl(var(--color-muted))]",
                  "animate-fade-in-up"
                )}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex-shrink-0 p-2 rounded-lg bg-[hsl(var(--color-muted))]">
                  <PackageIcon package={pkg} size={24} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-[hsl(var(--color-foreground))]">{pkg.name}</p>
                  <p className="truncate text-xs text-[hsl(var(--color-muted-foreground))]">{pkg.id}</p>
                </div>
                <button
                  onClick={() => togglePackage(pkg.id)}
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-200",
                    "text-[hsl(var(--color-muted-foreground))]",
                    "hover:bg-[hsl(var(--color-destructive)/0.1)] hover:text-[hsl(var(--color-destructive))]"
                  )}
                  aria-label={`Remove ${pkg.name}`}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      <Separator className="bg-[hsl(var(--color-border))]" />

      {/* Preset Manager */}
      <div className="p-4">
        <PresetManager />
      </div>

      <Separator className="bg-[hsl(var(--color-border))]" />

      {/* Generate Button */}
      <div className="p-5">
        <Button
          onClick={onCommandClick}
          disabled={count === 0}
          className={cn(
            "w-full h-12 rounded-xl font-semibold text-base transition-all duration-300",
            "flex items-center justify-center gap-2",
            count > 0
              ? "bg-[hsl(var(--color-primary))] text-white shadow-[var(--shadow-glow-primary)] hover:scale-[1.02]"
              : "bg-[hsl(var(--color-muted))] text-[hsl(var(--color-muted-foreground))] cursor-not-allowed"
          )}
        >
          <Terminal className="h-5 w-5" />
          {count === 0 ? "Select apps first" : `Generate Command`}
        </Button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:sticky lg:top-0 lg:flex lg:h-full lg:w-80 lg:flex-col lg:rounded-2xl lg:border lg:border-[hsl(var(--color-border))] lg:bg-[hsl(var(--color-card))] lg:shadow-xl overflow-hidden ml-4">
        <SidebarContent />
      </aside>

      {/* Mobile Sheet */}
      <div className="lg:hidden fixed bottom-6 right-6 z-40">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger
            render={
              <Button
                size="lg"
                className={cn(
                  "flex h-16 items-center gap-3 rounded-2xl px-6 font-bold shadow-xl transition-all duration-300",
                  "hover:scale-[1.02] active:scale-100",
                  count > 0
                    ? "bg-[hsl(var(--color-primary))] text-white shadow-[var(--shadow-glow-primary)]"
                    : "bg-[hsl(var(--color-card))] text-[hsl(var(--color-foreground))] border border-[hsl(var(--color-border))]"
                )}
              >
                <ShoppingBag className="h-5 w-5" />
                <span className="text-lg">{count}</span>
                {count > 0 && <Sparkles className="h-4 w-4 text-white/70" />}
              </Button>
            }
          />
          <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))] p-0">
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </div>

    </>
  )
}
