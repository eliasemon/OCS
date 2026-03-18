"use client"

import { useState } from "react"
import { useSelectionStore } from "@/store/selection"
import { PresetManager } from "./PresetManager"
import { CommandModal } from "./CommandModal"
import { Button } from "./ui/button"
import { ScrollArea } from "./ui/scroll-area"
import { Separator } from "./ui/separator"
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet"
import { X, Check, ShoppingBag } from "lucide-react"
import type { Package } from "@/types/package"

interface SidebarProps {
  packages: Package[]
}

export function Sidebar({ packages }: SidebarProps) {
  const { selectedIds, isSelected, togglePackage, clearAll, count } = useSelectionStore()
  const [commandModalOpen, setCommandModalOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const selectedPackages = packages.filter((pkg) => selectedIds.has(pkg.id))

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between p-4">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-100">
          <ShoppingBag className="h-5 w-5 text-cyan-500" />
          Selected Apps
          <span className="flex h-6 items-center justify-center rounded-full bg-cyan-500 px-2 text-xs font-bold text-gray-950">
            {count}
          </span>
        </h2>
        {count > 0 && (
          <button
            onClick={clearAll}
            className="text-sm text-gray-400 transition-colors hover:text-gray-300"
          >
            Clear all
          </button>
        )}
      </div>

      <Separator className="bg-gray-800" />

      <ScrollArea className="flex-1">
        {count === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border-2 border-dashed border-gray-700">
              <ShoppingBag className="h-8 w-8 text-gray-600" />
            </div>
            <p className="text-sm text-gray-400">Select apps from the catalog</p>
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {selectedPackages.map((pkg) => (
              <div
                key={pkg.id}
                className="flex items-center gap-3 rounded-lg bg-gray-900 p-3 transition-colors hover:bg-gray-800"
              >
                <span className="text-2xl">{pkg.icon}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-100">{pkg.name}</p>
                  <p className="truncate text-xs text-gray-500">{pkg.id}</p>
                </div>
                <button
                  onClick={() => togglePackage(pkg.id)}
                  className="flex h-8 w-8 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-gray-700 hover:text-gray-300"
                  aria-label={`Remove ${pkg.name}`}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      <Separator className="bg-gray-800" />

      <div className="p-4 space-y-4">
        <PresetManager />

        <Separator className="bg-gray-800" />

        <Button
          onClick={() => setCommandModalOpen(true)}
          disabled={count === 0}
          className="w-full bg-cyan-500 font-bold text-gray-950 hover:bg-cyan-400 disabled:bg-gray-800 disabled:text-gray-600"
        >
          {count === 0 ? "Select apps first" : "Generate Install Command"}
        </Button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:sticky lg:top-4 lg:flex lg:h-[calc(100vh-2rem)] lg:w-80 lg:flex-col lg:rounded-xl lg:border lg:border-gray-800 lg:bg-gray-900/50 lg:backdrop-blur-sm">
        <SidebarContent />
      </aside>

      {/* Mobile Sheet */}
      <div className="lg:hidden fixed bottom-4 right-4 z-40">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger
            render={
              <Button
                size="lg"
                className="flex h-14 items-center gap-2 rounded-full bg-cyan-500 px-6 font-bold text-gray-950 hover:bg-cyan-400 shadow-lg shadow-cyan-500/20"
              >
                <ShoppingBag className="h-5 w-5" />
                <span>{count}</span>
              </Button>
            }
          />
          <SheetContent side="bottom" className="h-[80vh] rounded-t-xl border-gray-800 bg-gray-950 p-0">
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </div>

      <CommandModal
        open={commandModalOpen}
        onClose={() => setCommandModalOpen(false)}
        selectedIds={Array.from(selectedIds)}
      />
    </>
  )
}
