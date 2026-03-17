import { NextResponse } from "next/server"
import packagesData from "@/data/packages.json"
import categoriesData from "@/data/categories.json"
import type { Package, CategoryMeta } from "@/types/package"

interface StatsResponse {
  totalPackages: number
  popularCount: number
  categories: Array<{
    name: string
    count: number
    popular: number
    icon: string
  }>
  topTags: Array<{
    tag: string
    count: number
  }>
  lastUpdated: string
}

export async function GET() {
  const packages = packagesData as Package[]
  const categories = categoriesData as CategoryMeta[]

  // Calculate stats
  const totalPackages = packages.length
  const popularCount = packages.filter(p => p.popular).length

  // Count by category
  const categoryStats = new Map<string, { count: number; popular: number }>()
  for (const pkg of packages) {
    const existing = categoryStats.get(pkg.category) ?? { count: 0, popular: 0 }
    existing.count++
    if (pkg.popular) existing.popular++
    categoryStats.set(pkg.category, existing)
  }

  // Build categories array with metadata from categories.json
  const categoryList = categories
    .map(cat => {
      const stats = categoryStats.get(cat.id) ?? { count: 0, popular: 0 }
      return {
        name: cat.id,
        count: stats.count,
        popular: stats.popular,
        icon: cat.icon,
      }
    })
    .filter(cat => cat.count > 0) // Only include categories with packages
    .sort((a, b) => b.count - a.count)

  // Count tags (top 10)
  const tagCounts = new Map<string, number>()
  for (const pkg of packages) {
    for (const tag of pkg.tags) {
      tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1)
    }
  }
  const topTags = Array.from(tagCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([tag, count]) => ({ tag, count }))

  const response: StatsResponse = {
    totalPackages,
    popularCount,
    categories: categoryList,
    topTags,
    lastUpdated: new Date().toISOString(),
  }

  return NextResponse.json(response, {
    headers: { "Cache-Control": "public, s-maxage=300" } // 5 min cache for stats
  })
}
