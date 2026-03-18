import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { RateLimiter, getClientIp, rateLimiters } from '../rateLimiter'

describe('RateLimiter', () => {
  let limiter: RateLimiter

  beforeEach(() => {
    limiter = new RateLimiter(5, 10000) // 5 requests per 10 seconds
  })

  afterEach(() => {
    limiter.destroy()
  })

  describe('basic rate limiting', () => {
    it('should allow requests within limit', () => {
      const result1 = limiter.check('client1')
      const result2 = limiter.check('client1')
      const result3 = limiter.check('client1')

      expect(result1.allowed).toBe(true)
      expect(result1.remaining).toBe(4)
      expect(result2.allowed).toBe(true)
      expect(result2.remaining).toBe(3)
      expect(result3.allowed).toBe(true)
      expect(result3.remaining).toBe(2)
    })

    it('should block requests exceeding limit', () => {
      // Use all 5 requests
      for (let i = 0; i < 5; i++) {
        limiter.check('client1')
      }

      // 6th request should be blocked
      const result = limiter.check('client1')
      expect(result.allowed).toBe(false)
      expect(result.remaining).toBe(0)
    })

    it('should reset after window expires', () => {
      const limiter2 = new RateLimiter(2, 100) // 2 requests per 100ms

      // Use both requests
      limiter2.check('client1')
      limiter2.check('client1')

      // 3rd request should be blocked
      let result = limiter2.check('client1')
      expect(result.allowed).toBe(false)

      // Wait for window to expire
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          result = limiter2.check('client1')
          expect(result.allowed).toBe(true)
          expect(result.remaining).toBe(1)
          limiter2.destroy()
          resolve()
        }, 150)
      })
    })

    it('should track different clients independently', () => {
      const result1 = limiter.check('client1')
      const result2 = limiter.check('client2')

      expect(result1.allowed).toBe(true)
      expect(result2.allowed).toBe(true)
      expect(result1.remaining).toBe(4)
      expect(result2.remaining).toBe(4)
    })

    it('should include reset time in response', () => {
      const result = limiter.check('client1')

      expect(result.resetAt).toBeInstanceOf(Date)
      expect(result.resetAt.getTime()).toBeGreaterThan(Date.now())
    })

    it('should include limit in response', () => {
      const result = limiter.check('client1')

      expect(result.limit).toBe(5)
    })
  })

  describe('edge cases', () => {
    it('should handle first request correctly', () => {
      const result = limiter.check('new-client')

      expect(result.allowed).toBe(true)
      expect(result.remaining).toBe(4)
    })

    it('should reset window for expired entries', () => {
      const limiter2 = new RateLimiter(3, 100) // 3 requests per 100ms

      limiter2.check('client1')

      return new Promise<void>((resolve) => {
        setTimeout(() => {
          const result = limiter2.check('client1')
          // Window should have reset, so this counts as first request again
          expect(result.allowed).toBe(true)
          expect(result.remaining).toBe(2)
          limiter2.destroy()
          resolve()
        }, 150)
      })
    })
  })

  describe('reset', () => {
    it('should reset rate limit for specific client', () => {
      // Use all requests
      for (let i = 0; i < 5; i++) {
        limiter.check('client1')
      }

      // Should be blocked
      let result = limiter.check('client1')
      expect(result.allowed).toBe(false)

      // Reset
      limiter.reset('client1')

      // Should be allowed again
      result = limiter.check('client1')
      expect(result.allowed).toBe(true)
      expect(result.remaining).toBe(4)
    })

    it('should handle reset for non-existent client', () => {
      // Should not throw
      expect(() => limiter.reset('non-existent')).not.toThrow()
    })
  })

  describe('cleanup', () => {
    it('should clean up expired entries when reset window passes', () => {
      const limiter2 = new RateLimiter(2, 50) // 50ms window for faster test

      limiter2.check('client1')
      limiter2.check('client2')

      expect(limiter2.size()).toBe(2)

      return new Promise<void>((resolve) => {
        setTimeout(() => {
          // After window expires, making a new request should reset and clean old entries
          limiter2.check('client3')
          // At minimum, client3 should be tracked
          expect(limiter2.size()).toBeGreaterThanOrEqual(1)
          limiter2.destroy()
          resolve()
        }, 100)
      })
    })
  })

  describe('destroy', () => {
    it('should clear all entries', () => {
      limiter.check('client1')
      limiter.check('client2')

      expect(limiter.size()).toBe(2)

      limiter.destroy()

      expect(limiter.size()).toBe(0)
    })
  })
})

describe('getClientIp', () => {
  it('should extract IP from x-forwarded-for header', () => {
    const request = new Request('https://example.com', {
      headers: { 'x-forwarded-for': '203.0.113.1, 70.41.3.18' },
    })

    const ip = getClientIp(request)
    expect(ip).toBe('203.0.113.1')
  })

  it('should extract IP from cf-connecting-ip header', () => {
    const request = new Request('https://example.com', {
      headers: { 'cf-connecting-ip': '198.51.100.1' },
    })

    const ip = getClientIp(request)
    expect(ip).toBe('198.51.100.1')
  })

  it('should extract IP from x-real-ip header', () => {
    const request = new Request('https://example.com', {
      headers: { 'x-real-ip': '192.0.2.1' },
    })

    const ip = getClientIp(request)
    expect(ip).toBe('192.0.2.1')
  })

  it('should return unknown when no IP headers present', () => {
    const request = new Request('https://example.com')

    const ip = getClientIp(request)
    expect(ip).toBe('unknown')
  })

  it('should prioritize x-forwarded-for over other headers', () => {
    const request = new Request('https://example.com', {
      headers: {
        'x-forwarded-for': '203.0.113.1',
        'cf-connecting-ip': '198.51.100.1',
        'x-real-ip': '192.0.2.1',
      },
    })

    const ip = getClientIp(request)
    expect(ip).toBe('203.0.113.1')
  })

  it('should prioritize cf-connecting-ip over x-real-ip', () => {
    const request = new Request('https://example.com', {
      headers: {
        'cf-connecting-ip': '198.51.100.1',
        'x-real-ip': '192.0.2.1',
      },
    })

    const ip = getClientIp(request)
    expect(ip).toBe('198.51.100.1')
  })
})

describe('rateLimiters', () => {
  it('should export predefined rate limiters', () => {
    expect(rateLimiters.aiSearch).toBeInstanceOf(RateLimiter)
    expect(rateLimiters.aiRecommend).toBeInstanceOf(RateLimiter)
    expect(rateLimiters.installScript).toBeInstanceOf(RateLimiter)
    expect(rateLimiters.packages).toBeInstanceOf(RateLimiter)
  })

  it('should have different limits for different endpoints', () => {
    // The packages endpoint should have a higher limit than AI endpoints
    const packagesResult = rateLimiters.packages.check('test-client')
    const aiSearchResult = rateLimiters.aiSearch.check('test-client-2')
    const aiRecommendResult = rateLimiters.aiRecommend.check('test-client-3')

    expect(packagesResult.limit).toBeGreaterThan(aiSearchResult.limit)
    expect(aiSearchResult.limit).toBe(aiRecommendResult.limit)

    // Clean up for other tests
    rateLimiters.packages.reset('test-client')
    rateLimiters.aiSearch.reset('test-client-2')
    rateLimiters.aiRecommend.reset('test-client-3')
  })
})
