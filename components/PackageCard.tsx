"use client"

import { memo } from "react"
import type { Package } from "@/types/package"
import { useSelectionStore } from "@/store/selection"
import { Check, Star } from "lucide-react"
import { cn } from "@/lib/utils"
import { PackageIcon } from "./PackageIcon"

interface PackageCardProps {
  package: Package
}

function PackageCardComponent({ package: pkg }: PackageCardProps) {
  const { isSelected, togglePackage } = useSelectionStore()
  const selected = isSelected(pkg.id)

  return (
    <button
      onClick={() => togglePackage(pkg.id)}
      className={cn(
        "package-card group w-full text-left",
        selected && "selected"
      )}
    >
      {/* Header: Icon + Name + Checkbox */}
      <div className="flex items-start gap-4">
        <PackageIcon package={pkg} size={48} className="flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg truncate text-[hsl(var(--color-foreground))]">{pkg.name}</h3>
          <p className="text-sm text-[hsl(var(--color-muted-foreground))] line-clamp-2">
            {pkg.description}
          </p>
        </div>
        <div className={cn(
          "flex-shrink-0 h-5 w-5 rounded border transition-all duration-200",
          "flex items-center justify-center",
          selected
            ? "bg-[hsl(var(--color-primary))] border-[hsl(var(--color-primary))]"
            : "border-[hsl(var(--color-border))] group-hover:border-[hsl(var(--color-muted-foreground))]"
        )}>
          {selected && <Check className="h-3 w-3 text-[hsl(var(--color-primary-foreground))]" strokeWidth={3} />}
        </div>
      </div>

      {/* Footer: Category + Badge */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-[hsl(var(--color-border))]">
        <span className="rounded-md bg-[hsl(var(--color-muted))] px-2 py-1 text-xs text-[hsl(var(--color-muted-foreground))]">
          {pkg.category}
        </span>
        {pkg.popular && (
          <span className="flex items-center gap-1 text-xs text-amber-400">
            <Star className="h-3 w-3 fill-amber-400" />
            Popular
          </span>
        )}
      </div>
    </button>
  )
}

// Custom comparison function to prevent unnecessary re-renders
function arePropsEqual(prevProps: PackageCardProps, nextProps: PackageCardProps) {
  return (
    prevProps.package.id === nextProps.package.id &&
    prevProps.package.name === nextProps.package.name &&
    prevProps.package.description === nextProps.package.description &&
    prevProps.package.category === nextProps.package.category &&
    prevProps.package.popular === nextProps.package.popular &&
    prevProps.package.icon === nextProps.package.icon
  )
}

export const PackageCard = memo(PackageCardComponent, arePropsEqual)
