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
    {
      id: 'VideoLAN.VLC',
      name: 'VLC Media Player',
      description: 'Media player',
      icon: '🎬',
      category: 'Multimedia',
      tags: ['media', 'video', 'audio'],
      popular: false,
    },
  ],
}))

let testCounter = 0

function createRequest(body: string | object, ip?: string) {
  const uniqueIp = ip || `192.168.1.${testCounter++}`
  return new NextRequest('http://localhost:3000/api/ai/search', {
    method: 'POST',
    headers: { 'x-forwarded-for': uniqueIp },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  })
}

describe('/api/ai/search', () => {
  beforeEach(() => {
    // Clear environment variables before each test
    process.env.OPENROUTER_API_KEY = ''
    // Reset global rate limiter
    rateLimiters.aiSearch.reset('unknown')
  })

  describe('POST endpoint - mock mode (no API key)', () => {
    it('should return search results for valid query', async () => {
      const request = createRequest({ query: 'git' })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toHaveProperty('packages')
      expect(data).toHaveProperty('explanation')
      expect(Array.isArray(data.packages)).toBe(true)
      expect(response.headers.get('X-Mock-Response')).toBe('true')
    })

    it('should search by package name', async () => {
      const request = createRequest({ query: 'chrome' })
      const response = await POST(request)
      const data = await response.json()

      expect(data.packages.length).toBeGreaterThan(0)
      expect(data.packages[0].id).toBe('Google.Chrome')
    })

    it('should search by description', async () => {
      const request = createRequest({ query: 'browser' })
      const response = await POST(request)
      const data = await response.json()

      expect(data.packages.length).toBeGreaterThan(0)
    })

    it('should search by tags', async () => {
      const request = createRequest({ query: 'version-control' })
      const response = await POST(request)
      const data = await response.json()

      expect(data.packages.length).toBeGreaterThan(0)
      expect(data.packages[0].id).toBe('Git.Git')
    })

    it('should return empty array for non-matching query', async () => {
      const request = createRequest({ query: 'xyznonexistent123' })
      const response = await POST(request)
      const data = await response.json()

      expect(data.packages).toEqual([])
    })

    it('should validate limit parameter', async () => {
      const request = createRequest({ query: 'git', limit: 1 })
      const response = await POST(request)
      const data = await response.json()

      expect(data.packages.length).toBeLessThanOrEqual(1)
    })
  })

  describe('error handling', () => {
    it('should return 400 for missing query', async () => {
      const request = createRequest({})
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toHaveProperty('error')
      expect(data.error).toContain('Query is required')
    })

    it('should return 400 for empty query', async () => {
      const request = createRequest({ query: '   ' })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toHaveProperty('error')
    })

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
      const request = createRequest({ query: 'test' })
      const response = await POST(request)

      expect(response.headers.get('Cache-Control')).toBe('no-store')
    })

    it('should indicate mock response in headers when no API key', async () => {
      const request = createRequest({ query: 'test' })
      const response = await POST(request)

      expect(response.headers.get('X-Mock-Response')).toBe('true')
    })

    it('should return JSON content type', async () => {
      const request = createRequest({ query: 'test' })
      const response = await POST(request)

      expect(response.headers.get('content-type')).toContain('application/json')
    })
  })

  describe('response format', () => {
    it('should return packages with correct structure', async () => {
      const request = createRequest({ query: 'git' })
      const response = await POST(request)
      const data = await response.json()

      expect(data).toHaveProperty('packages')
      expect(data).toHaveProperty('explanation')

      if (data.packages.length > 0) {
        const pkg = data.packages[0]
        expect(pkg).toHaveProperty('id')
        expect(pkg).toHaveProperty('name')
        expect(pkg).toHaveProperty('description')
        expect(pkg).toHaveProperty('category')
        expect(pkg).toHaveProperty('icon')
        expect(pkg).toHaveProperty('popular')
      }
    })

    it('should include explanation in response', async () => {
      const request = createRequest({ query: 'git' })
      const response = await POST(request)
      const data = await response.json()

      expect(data.explanation).toBeTruthy()
      expect(typeof data.explanation).toBe('string')
    })
  })

  describe('security', () => {
    it('should sanitize query parameter', async () => {
      const request = createRequest({ query: '<script>alert("xss")</script>' })
      const response = await POST(request)

      expect(response.status).toBe(200)
    })

    it('should handle very long query strings', async () => {
      const longQuery = 'a'.repeat(10000)
      const request = createRequest({ query: longQuery })
      const response = await POST(request)

      expect(response.status).toBe(200)
    })

    it('should handle special characters in query', async () => {
      const request = createRequest({ query: "git'; DROP TABLE packages; --" })
      const response = await POST(request)

      expect(response.status).toBe(200)
    })
  })

  describe('rate limiting', () => {
    const fixedIp = '192.168.100.1'

    beforeEach(() => {
      // Reset rate limiter for fixed IP before each rate limit test
      rateLimiters.aiSearch.reset(fixedIp)
    })

    it('should set rate limit headers on successful request', async () => {
      const request = createRequest({ query: 'test' }, fixedIp)
      const response = await POST(request)

      expect(response.headers.get('X-RateLimit-Limit')).toBeTruthy()
      expect(response.headers.get('X-RateLimit-Remaining')).toBeTruthy()
      expect(response.headers.get('X-RateLimit-Reset')).toBeTruthy()
    })

    it('should decrement remaining requests on each call', async () => {
      const request1 = createRequest({ query: 'test' }, fixedIp)
      const response1 = await POST(request1)
      const remaining1 = parseInt(response1.headers.get('X-RateLimit-Remaining') || '0')

      const request2 = createRequest({ query: 'test' }, fixedIp)
      const response2 = await POST(request2)
      const remaining2 = parseInt(response2.headers.get('X-RateLimit-Remaining') || '0')

      expect(remaining2).toBeLessThan(remaining1)
    })

    it('should return 429 when rate limit is exceeded', async () => {
      const testLimiter = rateLimiters.aiSearch
      testLimiter.reset(fixedIp)

      // Exhaust the limit by making direct calls to the rate limiter
      const limit = parseInt(testLimiter.check(fixedIp).limit.toString())
      for (let i = 0; i < limit; i++) {
        testLimiter.check(fixedIp)
      }

      // Next request should be rate limited
      const request = createRequest({ query: 'test' }, fixedIp)
      const response = await POST(request)

      expect(response.status).toBe(429)
      const data = await response.json()
      expect(data.error).toContain('Too many requests')

      // Clean up
      testLimiter.reset(fixedIp)
    })

    it('should include retry information in 429 response', async () => {
      const testLimiter = rateLimiters.aiSearch
      testLimiter.reset(fixedIp)

      // Exhaust the limit
      const limit = parseInt(testLimiter.check(fixedIp).limit.toString())
      for (let i = 0; i < limit; i++) {
        testLimiter.check(fixedIp)
      }

      const request = createRequest({ query: 'test' }, fixedIp)
      const response = await POST(request)

      expect(response.headers.get('X-RateLimit-Limit')).toBeTruthy()
      expect(response.headers.get('X-RateLimit-Remaining')).toBe('0')
      expect(response.headers.get('X-RateLimit-Reset')).toBeTruthy()

      // Clean up
      testLimiter.reset(fixedIp)
    })
  })
})
