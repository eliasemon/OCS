import { NextRequest, NextResponse } from "next/server"
import packagesData from "@/data/packages.json"
import type { Package } from "@/types/package"

interface PaginatedResponse {
  packages: Package[]
  total: number
  page: number
  pageSize: number
  totalPages: number
  hasMore: boolean
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get("category")
  const search = searchParams.get("search")?.toLowerCase()
  const popular = searchParams.get("popular")

  // Pagination parameters
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"))
  const pageSize = Math.min(
    Math.max(1, parseInt(searchParams.get("pageSize") ?? "50")),
    100 // Max page size to prevent excessive payloads
  )

  let packages = packagesData as Package[]

  // Apply filters
  if (category && category !== "All") {
    packages = packages.filter(p => p.category === category)
  }
  if (search) {
    packages = packages.filter(p =>
      p.name.toLowerCase().includes(search) ||
      p.id.toLowerCase().includes(search) ||
      p.description.toLowerCase().includes(search) ||
      p.tags.some(t => t.toLowerCase().includes(search))
    )
  }
  if (popular === "true") {
    packages = packages.filter(p => p.popular)
  }

  // Calculate pagination
  const total = packages.length
  const totalPages = Math.ceil(total / pageSize)
  const startIndex = (page - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedPackages = packages.slice(startIndex, endIndex)
  const hasMore = endIndex < total

  const response: PaginatedResponse = {
    packages: paginatedPackages,
    total,
    page,
    pageSize,
    totalPages,
    hasMore,
  }

  return NextResponse.json(response, {
    headers: {
      // Cache for 5 minutes, serve stale for 10 minutes while revalidating
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600"
    }
  })
}
