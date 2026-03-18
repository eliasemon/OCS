/**
 * In-memory rate limiter for API endpoints.
 *
 * This is a simple implementation suitable for single-instance deployments.
 * For production multi-instance deployments, consider using Redis or a dedicated
 * rate limiting service.
 *
 * SECURITY NOTE: Uses IP address from x-forwarded-for header when available
 * to properly handle requests behind proxies/load balancers.
 */

interface RateLimitEntry {
  count: number
  resetTime: number
}

interface RateLimitResult {
  allowed: boolean
  limit: number
  remaining: number
  resetAt: Date
}

export class RateLimiter {
  private readonly requests: Map<string, RateLimitEntry>
  private readonly maxRequests: number
  private readonly windowMs: number
  private cleanupInterval: NodeJS.Timeout | null

  constructor(maxRequests: number = 10, windowMs: number = 60000) {
    this.requests = new Map()
    this.maxRequests = maxRequests
    this.windowMs = windowMs
    this.cleanupInterval = null

    // Clean up expired entries every minute
    this.cleanupInterval = setInterval(() => {
      this.cleanup()
    }, 60000)
  }

  /**
   * Check if a request should be rate limited.
   * @param identifier - Unique identifier for the request (e.g., IP address)
   * @returns Rate limit status
   */
  check(identifier: string): RateLimitResult {
    const now = Date.now()
    const entry = this.requests.get(identifier)

    // Reset window if expired
    if (!entry || now >= entry.resetTime) {
      const newEntry: RateLimitEntry = {
        count: 1,
        resetTime: now + this.windowMs,
      }
      this.requests.set(identifier, newEntry)

      return {
        allowed: true,
        limit: this.maxRequests,
        remaining: this.maxRequests - 1,
        resetAt: new Date(newEntry.resetTime),
      }
    }

    // Increment count within window
    entry.count++

    if (entry.count > this.maxRequests) {
      return {
        allowed: false,
        limit: this.maxRequests,
        remaining: 0,
        resetAt: new Date(entry.resetTime),
      }
    }

    return {
      allowed: true,
      limit: this.maxRequests,
      remaining: this.maxRequests - entry.count,
      resetAt: new Date(entry.resetTime),
    }
  }

  /**
   * Reset rate limit for a specific identifier (e.g., for admin override).
   */
  reset(identifier: string): void {
    this.requests.delete(identifier)
  }

  /**
   * Clean up expired entries to prevent memory leaks.
   */
  private cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.requests.entries()) {
      if (now >= entry.resetTime) {
        this.requests.delete(key)
      }
    }
  }

  /**
   * Clean up and stop the cleanup interval.
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = null
    }
    this.requests.clear()
  }

  /**
   * Get the current size of the rate limit map (for monitoring).
   */
  size(): number {
    return this.requests.size
  }
}

/**
 * Extract client IP address from request headers.
 * Handles requests behind proxies/load balancers.
 */
export function getClientIp(request: Request): string {
  // Check for x-forwarded-for header (set by proxies/load balancers)
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) {
    // Take the first IP (original client)
    return forwardedFor.split(',')[0].trim()
  }

  // Check for cf-connecting-ip (Cloudflare)
  const cfIp = request.headers.get('cf-connecting-ip')
  if (cfIp) {
    return cfIp
  }

  // Check for x-real-ip (Nginx)
  const realIp = request.headers.get('x-real-ip')
  if (realIp) {
    return realIp
  }

  // Fallback: use a placeholder (we don't have direct access to client IP in Next.js edge)
  // In production, this should be replaced with proper IP tracking
  return 'unknown'
}

/**
 * Rate limiter instances for different endpoint types.
 * Adjusted based on the cost/impact of each endpoint.
 */
export const rateLimiters = {
  // AI search endpoint: 10 requests per minute
  aiSearch: new RateLimiter(10, 60000),

  // AI recommend endpoint: 10 requests per minute
  aiRecommend: new RateLimiter(10, 60000),

  // Install script generation: 30 requests per minute
  installScript: new RateLimiter(30, 60000),

  // Package list: 100 requests per minute (higher limit for read-only data)
  packages: new RateLimiter(100, 60000),
}
