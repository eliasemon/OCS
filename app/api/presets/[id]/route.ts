import { NextRequest, NextResponse } from "next/server"
import { BUILT_IN_PRESETS, getPresetById } from "@/lib/presets"
import packagesData from "@/data/packages.json"
import type { Preset, Package } from "@/types/package"

// Mock install counts for built-in presets
const MOCK_INSTALL_COUNTS: Record<string, number> = {
  "fullstack-dev": 12450,
  "frontend-dev": 8920,
  "fresh-windows": 15600,
  "devops": 5340,
  "designer": 4280,
  "gamer": 7650,
  "privacy-focused": 3890,
  "content-creator": 2920,
}

// In-memory storage for custom presets (shared with main presets route)
// Note: In a real application, this would be in a database
const getCustomPresets = (): Preset[] => {
  // This is a workaround to share state between route handlers
  // In production, use a proper database or state management solution
  return []
}

type RouteParams = Promise<{ id: string }>

// GET /api/presets/[id] - Get a specific preset by ID
export async function GET(
  request: NextRequest,
  { params }: { params: RouteParams }
) {
  const { id } = await params

  // Try built-in presets first
  const builtInPreset = getPresetById(id)
  if (builtInPreset) {
    // Get package details for the preset
    const packages = packagesData as Package[]

    const presetPackages = builtInPreset.packageIds
      .map(pkgId => packages.find(p => p.id === pkgId))
      .filter(Boolean)

    return NextResponse.json({
      ...builtInPreset,
      installCount: MOCK_INSTALL_COUNTS[id] ?? 0,
      isBuiltIn: true,
      packages: presetPackages,
    }, {
      headers: { "Cache-Control": "public, s-maxage=300" }
    })
  }

  // Try custom presets
  const customPreset = getCustomPresets().find(p => p.id === id)
  if (customPreset) {
    return NextResponse.json({
      ...customPreset,
      installCount: 0,
      isBuiltIn: false,
    }, {
      headers: { "Cache-Control": "no-store" }
    })
  }

  // Not found
  return NextResponse.json(
    { error: "Preset not found" },
    { status: 404 }
  )
}
