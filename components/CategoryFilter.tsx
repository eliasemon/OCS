"use client"

import { Category } from "@/types/package"
import { cn } from "@/lib/utils"

interface CategoryFilterProps {
  selected: Category
  onChange: (category: Category) => void
  counts: Record<string, number>
}

const CATEGORIES: Category[] = [
  "All",
  "Developer",
  "Browsers",
  "Media",
  "Communication",
  "Utilities",
  "Productivity",
  "Design",
  "Gaming",
]

export function CategoryFilter({ selected, onChange, counts }: CategoryFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent">
      {CATEGORIES.map((category) => {
        const count = counts[category] || 0
        const isActive = selected === category

        return (
          <button
            key={category}
            onClick={() => onChange(category)}
            className={`
              shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200
              ${isActive
                ? "bg-cyan-500 text-gray-950 font-semibold"
                : "bg-gray-900 text-gray-400 hover:bg-gray-800"
              }
            `}
          >
            {category}
            <span
              className={cn(
                "ml-2 text-xs",
                isActive ? "text-cyan-950/70" : "text-gray-500"
              )}
            >
              {count}
            </span>
          </button>
        )
      })}
    </div>
  )
}
