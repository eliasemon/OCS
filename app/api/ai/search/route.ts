import { NextRequest, NextResponse } from "next/server"
import packagesData from "@/data/packages.json"
import type { Package } from "@/types/package"
import { rateLimiters, getClientIp } from "@/lib/rateLimiter"

interface SearchRequest {
  query: string
  limit?: number
}

interface SearchResponse {
  packages: Array<{
    id: string
    name: string
    description: string
    category: string
    icon: string
    popular: boolean
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

// Mock search when API key is not configured
function getMockSearch(query: string, limit: number): SearchResponse {
  const packages = packagesData as Package[]
  const lowerQuery = query.toLowerCase()

  // Simple keyword matching
  const matches = packages
    .filter(p =>
      p.name.toLowerCase().includes(lowerQuery) ||
      p.description.toLowerCase().includes(lowerQuery) ||
      p.tags.some(t => t.toLowerCase().includes(lowerQuery)) ||
      p.category.toLowerCase().includes(lowerQuery)
    )
    .slice(0, limit)

  return {
    packages: matches.map(p => ({
      id: p.id,
      name: p.name,
      description: p.description,
      category: p.category,
      icon: p.icon,
      popular: p.popular,
    })),
    explanation: "Found packages matching your query. Configure OPENROUTER_API_KEY for AI-powered semantic search.",
  }
}

/**
 * Call OpenRouter API with a specific model
 */
async function callOpenRouterWithModel(
  query: string,
  limit: number,
  model: string,
  packages: Package[]
): Promise<SearchResponse> {
  const systemPrompt = `You are a Windows software search expert. Find packages matching user queries.

Available packages:
${packages.map(p => `${p.id} | ${p.name} | ${p.category} | ${p.description} | ${p.tags.join(", ")}`).join("\n")}

Return ONLY valid JSON in this exact format:
{
  "packages": [
    {"id": "Package.Id", "name": "Name", "description": "Description", "category": "Category", "icon": "icon", "popular": true}
  ],
  "explanation": "Brief explanation of results"
}

Constraints:
- Only return packages from the provided catalog
- Maximum ${limit} results
- Match based on semantic understanding, not just keywords
- Consider category, tags, and description for relevance`

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "https://appnest-beta.vercel.app",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: query },
      ],
      temperature: 0.3, // Lower temperature for more consistent search
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

  return JSON.parse(jsonContent) as SearchResponse
}

/**
 * Call AI service with OpenRouter fallback models
 */
async function callAIService(query: string, limit: number): Promise<SearchResponse> {
  const packages = packagesData as Package[]
  const errors: Error[] = []

  // Try OpenRouter models
  if (OPENROUTER_API_KEY) {
    const modelsToTry = [OPENROUTER_MODEL, ...FALLBACK_MODELS.filter(m => m !== OPENROUTER_MODEL)]

    for (const model of modelsToTry) {
      try {
        return await callOpenRouterWithModel(query, limit, model, packages)
      } catch (error) {
        errors.push(error instanceof Error ? error : new Error(String(error)))
        console.warn(`OpenRouter model ${model} failed, trying next...`)
      }
    }
  }

  throw new Error(`OpenRouter AI failed. Errors: ${errors.map(e => e.message).join("; ")}`)
}

// POST /api/ai/search - Natural language package search
export async function POST(request: NextRequest) {
  // Rate limiting check
  const clientIp = getClientIp(request)
  const rateLimit = rateLimiters.aiSearch.check(clientIp)

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

  try {
    const body = await request.json() as SearchRequest

    // Validate query
    if (!body.query || typeof body.query !== "string" || body.query.trim().length === 0) {
      return NextResponse.json(
        { error: "Query is required" },
        { status: 400 }
      )
    }

    query = body.query.trim()
    limit = Math.min(Math.max(body.limit ?? 10, 1), 50)

    // Use mock search if API key is not configured
    if (!OPENROUTER_API_KEY) {
      const mockResult = getMockSearch(query, limit)
      headers["Cache-Control"] = "no-store"
      headers["X-Mock-Response"] = "true"
      return NextResponse.json(mockResult, { headers })
    }

    // Call AI service via OpenRouter
    const result = await callAIService(query, limit)

    headers["Cache-Control"] = "no-store"
    return NextResponse.json(result, { headers })

  } catch (error) {
    console.error("Error in AI search:", error)

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      )
    }

    // Fall back to keyword search on error
    const mockResult = getMockSearch(query || "", limit)
    headers["X-Fallback-Response"] = "true"
    return NextResponse.json({
      ...mockResult,
      explanation: "AI search unavailable. Showing keyword matches instead.",
    }, {
      status: 200, // Return 200 with fallback data
      headers,
    })
  }
}
