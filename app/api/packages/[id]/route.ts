import { NextRequest, NextResponse } from "next/server"
import packagesData from "@/data/packages.json"
import type { Package } from "@/types/package"

type RouteParams = Promise<{ id: string }>

export async function GET(
  request: NextRequest,
  { params }: { params: RouteParams }
) {
  const { id } = await params
  const packages = packagesData as Package[]

  // Find package by exact ID match (case-sensitive)
  const pkg = packages.find(p => p.id === id)

  if (!pkg) {
    return NextResponse.json(
      { error: "Package not found" },
      { status: 404 }
    )
  }

  return NextResponse.json(pkg, {
    headers: { "Cache-Control": "public, s-maxage=3600" }
  })
}
