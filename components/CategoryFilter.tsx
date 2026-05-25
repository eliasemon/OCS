"use client"

import { Category } from "@/types/package"
import { cn } from "@/lib/utils"
import { Package, Code, Globe, Music, MessageSquare, Wrench, Briefcase, Palette, Gamepad2 } from "lucide-react"

interface CategoryFilterProps {
  selected: Category
  onChange: (category: Category) => void
  counts: Record<string, number>
}

const CATEGORIES: { name: Category; icon: typeof Package }[] = [
  { name: "All", icon: Package },
  { name: "Developer", icon: Code },
  { name: "Browsers", icon: Globe },
  { name: "Media", icon: Music },
  { name: "Communication", icon: MessageSquare },
  { name: "Utilities", icon: Wrench },
  { name: "Productivity", icon: Briefcase },
  { name: "Design", icon: Palette },
  { name: "Gaming", icon: Gamepad2 },
]

export function CategoryFilter({ selected, onChange, counts }: CategoryFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-[hsl(var(--color-muted))] scrollbar-track-transparent">
      {CATEGORIES.map(({ name, icon: Icon }) => {
        const count = counts[name] || 0
        const isActive = selected === name

        return (
          <button
            key={name}
            onClick={() => onChange(name)}
            className={cn(
              "category-pill group relative flex items-center gap-2 px-4 py-2.5 rounded-xl border",
              "text-sm font-medium transition-all duration-300",
              "hover:scale-[1.02] active:scale-100",
              isActive
                ? "active border-[hsl(var(--color-primary)/0.5)]"
                : "border-[hsl(var(--color-border))] hover:border-[hsl(var(--color-border-hover))]"
            )}
          >
            <Icon className={cn(
              "h-4 w-4 transition-colors duration-300",
              isActive ? "text-white" : "text-[hsl(var(--color-muted-foreground))] group-hover:text-[hsl(var(--color-primary))]"
            )} />
            <span>{name}</span>
            <span className={cn(
              "text-xs px-1.5 py-0.5 rounded-md transition-colors duration-300",
              isActive 
                ? "bg-white/20 text-white" 
                : "bg-[hsl(var(--color-muted))] text-[hsl(var(--color-muted-foreground))] group-hover:bg-[hsl(var(--color-primary)/0.1)] group-hover:text-[hsl(var(--color-primary))]"
            )}>
              {count}
            </span>
          </button>
        )
      })}
    </div>
  )
}
