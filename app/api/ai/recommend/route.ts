import { NextRequest, NextResponse } from "next/server"
import packagesData from "@/data/packages.json"
import type { Package } from "@/types/package"
import { rateLimiters, getClientIp } from "@/lib/rateLimiter"

interface RecommendRequest {
  context?: string
  selectedPackages?: string[]
  category?: string
  limit?: number
}

interface RecommendResponse {
  recommendations: Array<{
    id: string
    name: string
    description: string
    category: string
    reason: string
  }>
  explanation: string
}

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || "meta-llama/llama-3.1-8b-instruct:free"

// Fallback models if primary fails
const FALLBACK_MODELS = [
  "meta-llama/llama-3.1-8b-instruct:free",
  "microsoft/phi-3-mini-128k-instruct:free",
]

// Mock recommendations when API key is not configured
function getMockRecommendations(
  context: string,
  selectedPackages: string[],
  category: string | undefined,
  limit: number
): RecommendResponse {
  const packages = packagesData as Package[]
  const selected = new Set(selectedPackages)

  // Filter out already selected packages
  const available = packages.filter(p => !selected.has(p.id))

  // Filter by category if specified
  let filtered = available
  if (category && category !== "All") {
    filtered = filtered.filter(p => p.category === category)
  }

  // Prioritize popular packages
  const popular = filtered.filter(p => p.popular).slice(0, limit)

  const recommendations = popular.map(pkg => ({
    id: pkg.id,
    name: pkg.name,
    description: pkg.description,
    category: pkg.category,
    reason: `Popular ${pkg.category.toLowerCase()} tool that complements your selection.`,
  }))

  return {
    recommendations,
    explanation: "Based on your selections, these popular packages are frequently used together. Configure OPENROUTER_API_KEY for AI-powered recommendations.",
  }
}

/**
 * Call OpenRouter API with a specific model
 */
async function callOpenRouterWithModel(
  context: string,
  selectedPackages: string[],
  category: string | undefined,
  limit: number,
  model: string,
  packages: Package[]
): Promise<RecommendResponse> {
  const selected = new Set(selectedPackages)

  // Build package list for context
  const selectedDetails = packages.filter(p => selected.has(p.id))
  const available = packages.filter(p => !selected.has(p.id))

  const systemPrompt = `You are a Windows software expert. Recommend Windows packages (winget) based on user needs.

Available categories: Developer, Browsers, Media, Communication, Utilities, Productivity, Design, Gaming

Return ONLY valid JSON in this exact format:
{
  "recommendations": [
    {"id": "Package.Id", "name": "Name", "description": "Description", "category": "Category", "reason": "Why this package"}
  ],
  "explanation": "Brief explanation of recommendations"
}

Constraints:
- Only recommend from the provided package catalog
- Maximum ${limit} recommendations
- Consider user's context and already selected packages
- Provide specific, helpful reasoning`

  const userPrompt = `User Context: ${context || "Not specified"}
Selected Packages: ${selectedDetails.map(p => `${p.name} (${p.id})`).join(", ") || "None"}
Preferred Category: ${category || "None"}

Available Packages:
${available.map(p => `${p.id} | ${p.name} | ${p.category} | ${p.description}`).join("\n")}

Recommend ${limit} packages based on this context.`

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "https://appnest.app",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
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

  return JSON.parse(jsonContent) as RecommendResponse
}

/**
 * Call AI service with OpenRouter fallback models
 */
async function callAIService(
  context: string,
  selectedPackages: string[],
  category: string | undefined,
  limit: number
): Promise<RecommendResponse> {
  const packages = packagesData as Package[]
  const errors: Error[] = []

  // Try OpenRouter models
  if (OPENROUTER_API_KEY) {
    const modelsToTry = [OPENROUTER_MODEL, ...FALLBACK_MODELS.filter(m => m !== OPENROUTER_MODEL)]

    for (const model of modelsToTry) {
      try {
        return await callOpenRouterWithModel(context, selectedPackages, category, limit, model, packages)
      } catch (error) {
        errors.push(error instanceof Error ? error : new Error(String(error)))
        console.warn(`OpenRouter model ${model} failed, trying next...`)
      }
    }
  }

  throw new Error(`OpenRouter AI failed. Errors: ${errors.map(e => e.message).join("; ")}`)
}

// POST /api/ai/recommend - Get AI-powered package recommendations
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

  try {
    const body = await request.json() as RecommendRequest

    // Validate limit
    const limit = Math.min(Math.max(body.limit ?? 5, 1), 20)

    const context = body.context ?? ""
    const selectedPackages = body.selectedPackages ?? []
    const category = body.category

    // Use mock data if API key is not configured
    if (!OPENROUTER_API_KEY) {
      const mockResult = getMockRecommendations(context, selectedPackages, category, limit)
      headers["Cache-Control"] = "no-store"
      headers["X-Mock-Response"] = "true"
      return NextResponse.json(mockResult, { headers })
    }

    // Call AI service via OpenRouter
    const result = await callAIService(context, selectedPackages, category, limit)

    headers["Cache-Control"] = "no-store"
    return NextResponse.json(result, { headers })

  } catch (error) {
    console.error("Error in AI recommend:", error)

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      )
    }

    // Fall back to mock recommendations on error
    const mockResult = getMockRecommendations("", [], undefined, 5)
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
