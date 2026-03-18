import { NextRequest, NextResponse } from "next/server"
import { BUILT_IN_PRESETS } from "@/lib/presets"
import { validatePackageIds } from "@/lib/packageValidator"
import packagesData from "@/data/packages.json"
import type { Preset, PresetCreateInput, PresetValidationResult } from "@/types/package"

interface PresetWithStats extends Preset {
  installCount: number
  isBuiltIn: boolean
}

// Mock install counts for built-in presets (in production, this would come from a database)
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

// In-memory storage for custom presets (resets on server restart)
// In production, this would be persisted to a database
const customPresets: PresetWithStats[] = []

function generateId(): string {
  return `custom-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

// GET /api/presets - List all presets
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const featured = searchParams.get("featured")

  // Combine built-in and custom presets
  const allPresets: PresetWithStats[] = [
    ...BUILT_IN_PRESETS.map(p => ({
      ...p,
      installCount: MOCK_INSTALL_COUNTS[p.id] ?? 0,
      isBuiltIn: true,
    })),
    ...customPresets,
  ]

  // Filter by featured if requested (built-in presets are considered featured)
  let filtered = allPresets
  if (featured === "true") {
    filtered = allPresets.filter(p => p.isBuiltIn)
  }

  // Sort by install count (descending)
  const sorted = filtered.sort((a, b) => b.installCount - a.installCount)

  return NextResponse.json(sorted, {
    headers: { "Cache-Control": "public, s-maxage=300" } // 5 min cache
  })
}

// POST /api/presets - Create a new custom preset
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as PresetCreateInput

    // Validate request body
    if (!body.name || typeof body.name !== "string" || body.name.trim().length === 0) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      )
    }

    if (!body.description || typeof body.description !== "string") {
      return NextResponse.json(
        { error: "Description is required" },
        { status: 400 }
      )
    }

    if (!body.icon || typeof body.icon !== "string") {
      return NextResponse.json(
        { error: "Icon is required" },
        { status: 400 }
      )
    }

    if (!Array.isArray(body.packageIds) || body.packageIds.length === 0) {
      return NextResponse.json(
        { error: "At least one package ID is required" },
        { status: 400 }
      )
    }

    if (body.packageIds.length > 50) {
      return NextResponse.json(
        { error: "Cannot exceed 50 packages per preset" },
        { status: 400 }
      )
    }

    // Validate package IDs against catalog
    const catalogIds = (packagesData as Array<{ id: string }>).map(p => p.id)
    const { valid, invalid } = validatePackageIds(body.packageIds, catalogIds)

    // Create the preset
    const newPreset: PresetWithStats = {
      id: generateId(),
      name: body.name.trim(),
      description: body.description.trim(),
      icon: body.icon.trim(),
      packageIds: valid,
      installCount: 0,
      isBuiltIn: false,
    }

    // Store in memory
    customPresets.push(newPreset)

    // Return validation result along with created preset
    const validationResult: PresetValidationResult = {
      valid: invalid.length === 0,
      validCount: valid.length,
      invalidCount: invalid.length,
      invalidIds: invalid,
    }

    return NextResponse.json({
      preset: newPreset,
      validation: validationResult,
    }, {
      status: 201,
      headers: { "Cache-Control": "no-store" } // Don't cache user-created content
    })

  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      )
    }

    console.error("Error creating preset:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
