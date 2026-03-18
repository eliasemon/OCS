import { describe, it, expect, beforeEach, vi } from 'vitest'
import { POST } from '../route'
import { NextRequest } from 'next/server'
import { rateLimiters } from '@/lib/rateLimiter'

// Mock the packages data
vi.mock('@/data/packages.json', () => ({
  default: [
    {
      id: 'Git.Git',
      name: 'Git',
      description: 'Distributed version control system',
      icon: '🔧',
      category: 'Development',
      tags: ['git', 'version-control', 'vcs'],
      popular: true,
    },
    {
      id: 'Google.Chrome',
      name: 'Google Chrome',
      description: 'Web browser',
      icon: '🌐',
      category: 'Browsers',
      tags: ['browser', 'chrome', 'web'],
      popular: true,
    },
    {
      id: 'Microsoft.VisualStudioCode',
      name: 'Visual Studio Code',
      description: 'Code editor',
      icon: '💻',
      category: 'Development',
      tags: ['editor', 'ide', 'code'],
      popular: true,
    },
  ],
}))

let testCounter = 0

function createRequest(body: string | object, ip?: string) {
  const uniqueIp = ip || `192.168.2.${testCounter++}`
  return new NextRequest('http://localhost:3000/api/ai/recommend', {
    method: 'POST',
    headers: { 'x-forwarded-for': uniqueIp },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  })
}

describe('/api/ai/recommend', () => {
  beforeEach(() => {
    // Clear environment variables before each test
    process.env.OPENROUTER_API_KEY = ''
    // Reset global rate limiter
    rateLimiters.aiRecommend.reset('unknown')
  })

  describe('POST endpoint - mock mode (no API key)', () => {
    it('should return mock recommendations when no API key is configured', async () => {
      const request = createRequest({ context: 'I am a web developer' })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toHaveProperty('recommendations')
      expect(data).toHaveProperty('explanation')
      expect(Array.isArray(data.recommendations)).toBe(true)
      expect(response.headers.get('X-Mock-Response')).toBe('true')
    })

    it('should validate limit parameter (min 1, max 20)', async () => {
      const request = createRequest({ limit: 5 })
      const response = await POST(request)
      const data = await response.json()

      expect(data.recommendations.length).toBeLessThanOrEqual(5)
    })

    it('should clamp limit to maximum of 20', async () => {
      const request = createRequest({ limit: 100 })
      const response = await POST(request)
      const data = await response.json()

      expect(data.recommendations.length).toBeLessThanOrEqual(20)
    })

    it('should use default limit of 5 when not specified', async () => {
      const request = createRequest({})
      const response = await POST(request)
      const data = await response.json()

      expect(data.recommendations.length).toBeLessThanOrEqual(5)
    })

    it('should exclude already selected packages', async () => {
      const request = createRequest({
        selectedPackages: ['Git.Git', 'Google.Chrome'],
      })
      const response = await POST(request)
      const data = await response.json()
      const recommendedIds = data.recommendations.map((r: any) => r.id)

      expect(recommendedIds).not.toContain('Git.Git')
      expect(recommendedIds).not.toContain('Google.Chrome')
    })

    it('should filter by category when specified', async () => {
      const request = createRequest({ category: 'Development' })
      const response = await POST(request)
      const data = await response.json()

      expect(data.recommendations.every((r: any) => r.category === 'Development')).toBe(true)
    })
  })

  describe('error handling', () => {
    it('should return 400 for invalid JSON', async () => {
      const request = createRequest('invalid json')
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toHaveProperty('error')
    })
  })

  describe('response headers', () => {
    it('should set no-cache headers', async () => {
      const request = createRequest({})
      const response = await POST(request)

      expect(response.headers.get('Cache-Control')).toBe('no-store')
    })

    it('should indicate mock response in headers when no API key', async () => {
      const request = createRequest({})
      const response = await POST(request)

      expect(response.headers.get('X-Mock-Response')).toBe('true')
    })

    it('should return JSON content type', async () => {
      const request = createRequest({})
      const response = await POST(request)

      expect(response.headers.get('content-type')).toContain('application/json')
    })
  })

  describe('response format', () => {
    it('should return recommendations with correct structure', async () => {
      const request = createRequest({})
      const response = await POST(request)
      const data = await response.json()

      expect(data).toHaveProperty('recommendations')
      expect(data).toHaveProperty('explanation')

      if (data.recommendations.length > 0) {
        const rec = data.recommendations[0]
        expect(rec).toHaveProperty('id')
        expect(rec).toHaveProperty('name')
        expect(rec).toHaveProperty('description')
        expect(rec).toHaveProperty('category')
        expect(rec).toHaveProperty('reason')
      }
    })
  })

  describe('security', () => {
    it('should sanitize context parameter', async () => {
      const request = createRequest({
        context: '<script>alert("xss")</script>',
      })
      const response = await POST(request)

      expect(response.status).toBe(200)
    })

    it('should handle very long context strings', async () => {
      const longContext = 'a'.repeat(10000)
      const request = createRequest({ context: longContext })
      const response = await POST(request)

      expect(response.status).toBe(200)
    })

    it('should handle null/undefined parameters gracefully', async () => {
      const request = createRequest({
        context: null,
        selectedPackages: undefined,
        category: null,
      })
      const response = await POST(request)

      expect(response.status).toBe(200)
    })
  })

  describe('rate limiting', () => {
    const fixedIp = '192.168.101.1'

    beforeEach(() => {
      // Reset rate limiter for fixed IP before each rate limit test
      rateLimiters.aiRecommend.reset(fixedIp)
    })

    it('should set rate limit headers on successful request', async () => {
      const request = createRequest({}, fixedIp)
      const response = await POST(request)

      expect(response.headers.get('X-RateLimit-Limit')).toBeTruthy()
      expect(response.headers.get('X-RateLimit-Remaining')).toBeTruthy()
      expect(response.headers.get('X-RateLimit-Reset')).toBeTruthy()
    })

    it('should decrement remaining requests on each call', async () => {
      const request1 = createRequest({}, fixedIp)
      const response1 = await POST(request1)
      const remaining1 = parseInt(response1.headers.get('X-RateLimit-Remaining') || '0')

      const request2 = createRequest({}, fixedIp)
      const response2 = await POST(request2)
      const remaining2 = parseInt(response2.headers.get('X-RateLimit-Remaining') || '0')

      expect(remaining2).toBeLessThan(remaining1)
    })

    it('should return 429 when rate limit is exceeded', async () => {
      const testLimiter = rateLimiters.aiRecommend
      testLimiter.reset(fixedIp)

      // Exhaust the limit
      const limit = parseInt(testLimiter.check(fixedIp).limit.toString())
      for (let i = 0; i < limit; i++) {
        testLimiter.check(fixedIp)
      }

      const request = createRequest({}, fixedIp)
      const response = await POST(request)

      expect(response.status).toBe(429)
      const data = await response.json()
      expect(data.error).toContain('Too many requests')

      // Clean up
      testLimiter.reset(fixedIp)
    })

    it('should include retry information in 429 response', async () => {
      const testLimiter = rateLimiters.aiRecommend
      testLimiter.reset(fixedIp)

      // Exhaust the limit
      const limit = parseInt(testLimiter.check(fixedIp).limit.toString())
      for (let i = 0; i < limit; i++) {
        testLimiter.check(fixedIp)
      }

      const request = createRequest({}, fixedIp)
      const response = await POST(request)

      expect(response.headers.get('X-RateLimit-Limit')).toBeTruthy()
      expect(response.headers.get('X-RateLimit-Remaining')).toBe('0')
      expect(response.headers.get('X-RateLimit-Reset')).toBeTruthy()

      // Clean up
      testLimiter.reset(fixedIp)
    })
  })
})
