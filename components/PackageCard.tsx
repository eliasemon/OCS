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
        "package-card group w-full text-left relative",
        selected && "selected"
      )}
    >
      {/* Selection glow effect */}
      <div className={cn(
        "absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300",
        "bg-[hsl(var(--color-primary)/0.1)]",
        selected && "opacity-100"
      )} />

      {/* Content */}
      <div className="relative">
        {/* Header: Icon + Name + Checkbox */}
        <div className="flex items-start gap-4">
          {/* Package Icon */}
          <div className={cn(
            "flex-shrink-0 p-3 rounded-xl transition-all duration-300",
            "bg-[hsl(var(--color-muted))]",
            "group-hover:shadow-lg",
            selected && "bg-[hsl(var(--color-primary)/0.2)]"
          )}>
            <PackageIcon package={pkg} size={32} />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base truncate text-[hsl(var(--color-foreground))] group-hover:text-[hsl(var(--color-primary))] transition-colors">
              {pkg.name}
            </h3>
            <p className="text-sm text-[hsl(var(--color-muted-foreground))] line-clamp-2 mt-1">
              {pkg.description}
            </p>
          </div>

          {/* Checkbox */}
          <div className={cn(
            "flex-shrink-0 h-6 w-6 rounded-lg border transition-all duration-300",
            "flex items-center justify-center",
            selected
              ? "bg-[hsl(var(--color-primary))] border-[hsl(var(--color-primary))] shadow-[var(--shadow-glow-primary)]"
              : "border-[hsl(var(--color-border))] group-hover:border-[hsl(var(--color-border-hover))]"
          )}>
            <Check className={cn(
              "h-3.5 w-3.5 text-white transition-all duration-300",
              selected ? "opacity-100 scale-100" : "opacity-0 scale-50"
            )} strokeWidth={3} />
          </div>
        </div>

        {/* Footer: Category + Badge */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-[hsl(var(--color-border))]">
          <span className={cn(
            "rounded-lg px-2.5 py-1 text-xs font-medium transition-colors duration-300",
            "bg-[hsl(var(--color-muted))] text-[hsl(var(--color-muted-foreground))]",
            "group-hover:bg-[hsl(var(--color-primary)/0.1)] group-hover:text-[hsl(var(--color-primary))]"
          )}>
            {pkg.category}
          </span>
          {pkg.popular && (
            <span className="flex items-center gap-1 text-xs text-[hsl(var(--color-warning))] font-medium">
              <Star className="h-3 w-3 fill-[hsl(var(--color-warning))]" />
              Popular
            </span>
          )}
        </div>
      </div>

      {/* Hover gradient border effect */}
      <div className={cn(
        "absolute inset-0 rounded-xl pointer-events-none",
        "border border-transparent transition-all duration-300",
        "group-hover:border-[hsl(var(--color-border-hover))]",
        selected && "border-[hsl(var(--color-primary)/0.5)]"
      )} />
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
