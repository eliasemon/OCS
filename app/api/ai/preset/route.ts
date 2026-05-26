/**
 * AI Preset Generation API Endpoint
 * 
 * This endpoint generates presets based on user descriptions.
 * The AI analyzes the user's needs and recommends relevant packages.
 * 
 * NOTE: This is for PRESET CREATION, not for search.
 * The query describes what the user wants to accomplish, and the AI
 * creates a curated list of packages as a preset.
 * 
 * Example queries:
 * - "Web development setup for React projects"
 * - "Data science environment with Python tools"
 * - "Game development with Unity"
 */

import { NextRequest, NextResponse } from "next/server"
import windowsPackagesData from "@/data/packages.json"
import macPackagesData from "@/data/mac-packages.json"
import linuxPackagesData from "@/data/linux-packages.json"
import type { Package } from "@/types/package"
import { rateLimiters, getClientIp } from "@/lib/rateLimiter"

interface PresetRequest {
  // User's natural language description of what they need
  // Example: "I need tools for web development with React"
  query: string
  // Maximum number of packages to include in the preset
  limit?: number
  // Target operating system for the preset
  os?: "windows" | "mac" | "linux"
}

interface PresetResponse {
  // Suggested name for the preset based on the query
  presetName: string
  // Suggested description for the preset
  presetDescription: string
  // Recommended package IDs
  packageIds: string[]
  // AI explanation of why these packages were chosen
  explanation: string
}

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || "meta-llama/llama-3.1-8b-instruct:free"

// Fallback models if primary fails
const FALLBACK_MODELS = [
  "microsoft/phi-3-mini-128k-instruct:free",
  "minimax/minimax-m2.5:free",
]

/**
 * Generate mock preset recommendations when API key is not configured
 * This provides a fallback experience for development/demo purposes
 */
function getMockPreset(query: string, limit: number, packages: Package[]): PresetResponse {
  const lowerQuery = query.toLowerCase()

  // Simple keyword-based matching for demo
  const keywords: Record<string, string[]> = {
    "web": ["Developer", "Browsers"],
    "development": ["Developer"],
    "react": ["Developer"],
    "node": ["Developer"],
    "python": ["Developer"],
    "data": ["Developer", "Productivity"],
    "design": ["Design"],
    "game": ["Gaming", "Developer"],
    "media": ["Media"],
    "video": ["Media"],
    "communication": ["Communication"],
    "browser": ["Browsers"],
    "productivity": ["Productivity"],
  }

  // Find matching categories based on query
  const matchedCategories = new Set<string>()
  for (const [keyword, categories] of Object.entries(keywords)) {
    if (lowerQuery.includes(keyword)) {
      categories.forEach(c => matchedCategories.add(c))
    }
  }

  // If no matches, default to popular packages
  const categories = matchedCategories.size > 0 
    ? Array.from(matchedCategories) 
    : ["Developer", "Browsers", "Productivity"]

  const recommended = packages
    .filter(p => categories.includes(p.category) && p.popular)
    .slice(0, limit)

  return {
    presetName: `AI Generated: ${query.slice(0, 30)}${query.length > 30 ? "..." : ""}`,
    presetDescription: `Packages for: ${query}`,
    packageIds: recommended.map(p => p.id),
    explanation: "Based on your description, these popular packages are recommended. Configure OPENROUTER_API_KEY for AI-powered recommendations.",
  }
}

/**
 * Call OpenRouter API with a specific model
 */
async function callOpenRouterWithModel(
  query: string,
  limit: number,
  model: string,
  packages: Package[],
  os: string
): Promise<PresetResponse> {
  const systemPrompt = `You are a ${os} software expert helping users create presets.
Users describe what they need, and you recommend the best packages from the catalog.

IMPORTANT: This is for PRESET CREATION, not search. Create a curated selection.

Available packages:
${packages.map(p => `${p.id} | ${p.name} | ${p.category} | ${p.description}`).join("\n")}

Return ONLY valid JSON in this exact format:
{
  "presetName": "Short descriptive name (e.g., 'Web Development Setup')",
  "presetDescription": "Brief description of what this preset is for",
  "packageIds": ["Package.Id.1", "Package.Id.2"],
  "explanation": "Why these packages were chosen"
}

Constraints:
- Only include package IDs from the provided catalog
- Maximum ${limit} packages
- Choose packages that work well together
- Prioritize essential and popular packages
- Create a focused, coherent preset (not everything)`

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "https://winsetup.app",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Create a preset for: ${query}` },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`OpenRouter API error: ${response.status} ${error}`)
  }

  const data = await response.json()
  const content = data.choices?.[0]?.message?.content

  if (!content) {
    throw new Error("No content in OpenRouter response")
  }

  // Parse JSON from markdown code blocks if present
  let jsonContent = content.trim()
  if (jsonContent.startsWith("```")) {
    jsonContent = jsonContent.replace(/```json?\n?/g, "").replace(/```$/g, "")
  }

  const result = JSON.parse(jsonContent) as PresetResponse

  // Validate that returned package IDs exist in our catalog
  const validIds = new Set(packages.map(p => p.id))
  result.packageIds = result.packageIds.filter(id => validIds.has(id))

  return result
}

/**
 * Call AI API to generate preset recommendations via OpenRouter
 */
async function callAIService(query: string, limit: number, packages: Package[], os: string): Promise<PresetResponse> {
  const errors: Error[] = []

  // Try OpenRouter models
  if (OPENROUTER_API_KEY) {
    const modelsToTry = [OPENROUTER_MODEL, ...FALLBACK_MODELS.filter(m => m !== OPENROUTER_MODEL)]

    for (const model of modelsToTry) {
      try {
        return await callOpenRouterWithModel(query, limit, model, packages, os)
      } catch (error) {
        errors.push(error instanceof Error ? error : new Error(String(error)))
        console.warn(`OpenRouter model ${model} failed, trying next...`)
      }
    }
  }

  throw new Error(`OpenRouter AI failed. Errors: ${errors.map(e => e.message).join("; ")}`)
}

/**
 * POST /api/ai/preset
 * 
 * Generate a preset based on user's natural language description.
 * This endpoint is specifically for preset creation, NOT for search.
 * 
 * Request body:
 * - query: string - User's description of what they need
 * - limit: number (optional) - Max packages to include (default: 10, max: 30)
 */
export async function POST(request: NextRequest) {
  // Rate limiting check
  const clientIp = getClientIp(request)
  const rateLimit = rateLimiters.aiRecommend.check(clientIp)

  // Set rate limit headers on all responses
  const headers: Record<string, string> = {
    "X-RateLimit-Limit": rateLimit.limit.toString(),
    "X-RateLimit-Remaining": rateLimit.remaining.toString(),
    "X-RateLimit-Reset": rateLimit.resetAt.toISOString(),
  }

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: "Too many requests",
        message: `Rate limit exceeded. Try again after ${new Date(rateLimit.resetAt).toLocaleTimeString()}`,
      },
      {
        status: 429,
        headers,
      }
    )
  }

  let query = ""
  let limit = 10
  let packages = windowsPackagesData as Package[]

  try {
    const body = await request.json() as PresetRequest

    // Validate query
    if (!body.query || typeof body.query !== "string" || body.query.trim().length === 0) {
      return NextResponse.json(
        { error: "Query is required" },
        { status: 400 }
      )
    }

    query = body.query.trim()
    limit = Math.min(Math.max(body.limit ?? 10, 1), 30)

    const os = body.os || "windows"
    packages = (
      os === "mac" ? macPackagesData :
      os === "linux" ? linuxPackagesData :
      windowsPackagesData
    ) as Package[]

    // Use mock preset if API key is not configured
    if (!OPENROUTER_API_KEY) {
      const mockResult = getMockPreset(query, limit, packages)
      headers["Cache-Control"] = "no-store"
      headers["X-Mock-Response"] = "true"
      return NextResponse.json(mockResult, { headers })
    }

    // Call AI service via OpenRouter
    const result = await callAIService(query, limit, packages, os)

    headers["Cache-Control"] = "no-store"
    return NextResponse.json(result, { headers })

  } catch (error) {
    console.error("Error in AI preset generation:", error)

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      )
    }

    // Fall back to mock preset on error
    const mockResult = getMockPreset(query || "general setup", limit, packages)
    headers["X-Fallback-Response"] = "true"
    return NextResponse.json({
      ...mockResult,
      explanation: "AI service unavailable. Showing popular recommendations instead.",
    }, {
      status: 200, // Return 200 with fallback data
      headers,
    })
  }
}
