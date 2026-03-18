import { describe, it, expect, beforeEach, vi } from 'vitest'
import { GET } from '../route'
import { NextRequest } from 'next/server'

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
      popular: false,
    },
    {
      id: 'Python.Python.3.12',
      name: 'Python 3.12',
      description: 'Programming language',
      icon: '🐍',
      category: 'Development',
      tags: ['python', 'programming', 'language'],
      popular: true,
    },
    {
      id: 'Mozilla.Firefox',
      name: 'Mozilla Firefox',
      description: 'Web browser',
      icon: '🦊',
      category: 'Browsers',
      tags: ['browser', 'firefox'],
      popular: false,
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

describe('/api/packages', () => {
  describe('GET endpoint', () => {
    it('should return paginated response when no filters are applied', async () => {
      const request = new NextRequest('http://localhost:3000/api/packages')
      const response = await GET(request)
      const data = await response.json()

      expect(data).toHaveProperty('packages')
      expect(data).toHaveProperty('total')
      expect(data).toHaveProperty('page')
      expect(data).toHaveProperty('pageSize')
      expect(data).toHaveProperty('totalPages')
      expect(data).toHaveProperty('hasMore')
      expect(data.packages).toHaveLength(6)
      expect(data.total).toBe(6)
      expect(response.headers.get('Cache-Control')).toBe('public, s-maxage=300, stale-while-revalidate=600')
    })

    describe('category filter', () => {
      it('should filter by Development category', async () => {
        const request = new NextRequest(
          'http://localhost:3000/api/packages?category=Development'
        )
        const response = await GET(request)
        const data = await response.json()

        expect(data.packages).toHaveLength(3)
        expect(data.packages.every((p: any) => p.category === 'Development')).toBe(true)
        expect(data.total).toBe(3)
      })

      it('should filter by Browsers category', async () => {
        const request = new NextRequest(
          'http://localhost:3000/api/packages?category=Browsers'
        )
        const response = await GET(request)
        const data = await response.json()

        expect(data.packages).toHaveLength(2)
        expect(data.packages.every((p: any) => p.category === 'Browsers')).toBe(true)
        expect(data.total).toBe(2)
      })

      it('should return all packages when category is All', async () => {
        const request = new NextRequest(
          'http://localhost:3000/api/packages?category=All'
        )
        const response = await GET(request)
        const data = await response.json()

        expect(data.packages).toHaveLength(6)
        expect(data.total).toBe(6)
      })

      it('should return empty array for non-existent category', async () => {
        const request = new NextRequest(
          'http://localhost:3000/api/packages?category=NonExistent'
        )
        const response = await GET(request)
        const data = await response.json()

        expect(data.packages).toEqual([])
        expect(data.total).toBe(0)
      })
    })

    describe('search filter', () => {
      it('should search by package name', async () => {
        const request = new NextRequest(
          'http://localhost:3000/api/packages?search=git'
        )
        const response = await GET(request)
        const data = await response.json()

        expect(data.packages).toHaveLength(1)
        expect(data.packages[0].id).toBe('Git.Git')
      })

      it('should search by package ID', async () => {
        const request = new NextRequest(
          'http://localhost:3000/api/packages?search=chrome'
        )
        const response = await GET(request)
        const data = await response.json()

        expect(data.packages).toHaveLength(1)
        expect(data.packages[0].id).toBe('Google.Chrome')
      })

      it('should search by description', async () => {
        const request = new NextRequest(
          'http://localhost:3000/api/packages?search=browser'
        )
        const response = await GET(request)
        const data = await response.json()

        expect(data.packages.length).toBeGreaterThanOrEqual(2)
      })

      it('should search by tags', async () => {
        const request = new NextRequest(
          'http://localhost:3000/api/packages?search=version-control'
        )
        const response = await GET(request)
        const data = await response.json()

        expect(data.packages).toHaveLength(1)
        expect(data.packages[0].id).toBe('Git.Git')
      })

      it('should be case insensitive', async () => {
        const request = new NextRequest(
          'http://localhost:3000/api/packages?search=GIT'
        )
        const response = await GET(request)
        const data = await response.json()

        // Should find Git.Git with case-insensitive search
        expect(data.packages.length).toBeGreaterThan(0)
      })

      it('should return empty for non-matching search', async () => {
        const request = new NextRequest(
          'http://localhost:3000/api/packages?search=xyznonexistent'
        )
        const response = await GET(request)
        const data = await response.json()

        expect(data.packages).toEqual([])
        expect(data.total).toBe(0)
      })
    })

    describe('popular filter', () => {
      it('should return only popular packages', async () => {
        const request = new NextRequest(
          'http://localhost:3000/api/packages?popular=true'
        )
        const response = await GET(request)
        const data = await response.json()

        expect(data.packages).toHaveLength(3)
        expect(data.packages.every((p: any) => p.popular === true)).toBe(true)
        expect(data.total).toBe(3)
      })

      it('should return all packages when popular is false', async () => {
        const request = new NextRequest(
          'http://localhost:3000/api/packages?popular=false'
        )
        const response = await GET(request)
        const data = await response.json()

        expect(data.packages).toHaveLength(6)
        expect(data.total).toBe(6)
      })

      it('should return all packages when popular is not specified', async () => {
        const request = new NextRequest('http://localhost:3000/api/packages')
        const response = await GET(request)
        const data = await response.json()

        expect(data.packages).toHaveLength(6)
        expect(data.total).toBe(6)
      })
    })

    describe('pagination', () => {
      it('should paginate with page parameter', async () => {
        const request = new NextRequest(
          'http://localhost:3000/api/packages?page=1&pageSize=2'
        )
        const response = await GET(request)
        const data = await response.json()

        expect(data.packages).toHaveLength(2)
        expect(data.page).toBe(1)
        expect(data.pageSize).toBe(2)
        expect(data.total).toBe(6)
        expect(data.totalPages).toBe(3)
        expect(data.hasMore).toBe(true)
      })

      it('should return second page correctly', async () => {
        const request = new NextRequest(
          'http://localhost:3000/api/packages?page=2&pageSize=2'
        )
        const response = await GET(request)
        const data = await response.json()

        expect(data.packages).toHaveLength(2)
        expect(data.page).toBe(2)
        expect(data.hasMore).toBe(true)
      })

      it('should return last page', async () => {
        const request = new NextRequest(
          'http://localhost:3000/api/packages?page=3&pageSize=2'
        )
        const response = await GET(request)
        const data = await response.json()

        expect(data.packages).toHaveLength(2)
        expect(data.hasMore).toBe(false)
      })

      it('should clamp pageSize to maximum of 100', async () => {
        const request = new NextRequest(
          'http://localhost:3000/api/packages?pageSize=200'
        )
        const response = await GET(request)
        const data = await response.json()

        expect(data.pageSize).toBe(100)
      })

      it('should enforce minimum pageSize of 1', async () => {
        const request = new NextRequest(
          'http://localhost:3000/api/packages?pageSize=0'
        )
        const response = await GET(request)
        const data = await response.json()

        expect(data.pageSize).toBe(1)
      })
    })

    describe('combined filters', () => {
      it('should combine category and search filters', async () => {
        const request = new NextRequest(
          'http://localhost:3000/api/packages?category=Development&search=python'
        )
        const response = await GET(request)
        const data = await response.json()

        expect(data.packages).toHaveLength(1)
        expect(data.packages[0].id).toBe('Python.Python.3.12')
        expect(data.total).toBe(1)
      })

      it('should combine category and popular filters', async () => {
        const request = new NextRequest(
          'http://localhost:3000/api/packages?category=Development&popular=true'
        )
        const response = await GET(request)
        const data = await response.json()

        expect(data.packages).toHaveLength(2)
        expect(data.packages.every((p: any) =>
          p.category === 'Development' && p.popular === true
        )).toBe(true)
        expect(data.total).toBe(2)
      })

      it('should combine search and popular filters', async () => {
        const request = new NextRequest(
          'http://localhost:3000/api/packages?search=browser&popular=true'
        )
        const response = await GET(request)
        const data = await response.json()

        expect(data.packages).toHaveLength(1)
        expect(data.packages[0].id).toBe('Google.Chrome')
      })

      it('should combine pagination with category filter', async () => {
        const request = new NextRequest(
          'http://localhost:3000/api/packages?category=Development&page=1&pageSize=2'
        )
        const response = await GET(request)
        const data = await response.json()

        expect(data.packages).toHaveLength(2)
        expect(data.packages.every((p: any) => p.category === 'Development')).toBe(true)
        expect(data.total).toBe(3)
        expect(data.totalPages).toBe(2)
      })
    })

    describe('edge cases', () => {
      it('should handle empty search query', async () => {
        const request = new NextRequest(
          'http://localhost:3000/api/packages?search='
        )
        const response = await GET(request)
        const data = await response.json()

        expect(data.packages).toHaveLength(6)
        expect(data.total).toBe(6)
      })

      it('should handle special characters in search', async () => {
        const request = new NextRequest(
          'http://localhost:3000/api/packages?search=%2B%2A%5B%5D'
        )
        const response = await GET(request)

        // Should not throw error
        expect(response.status).toBe(200)
      })

      it('should handle page below 1 (clamps to 1)', async () => {
        const request = new NextRequest(
          'http://localhost:3000/api/packages?page=0'
        )
        const response = await GET(request)
        const data = await response.json()

        expect(data.page).toBe(1)
      })

      it('should handle negative page (clamps to 1)', async () => {
        const request = new NextRequest(
          'http://localhost:3000/api/packages?page=-1'
        )
        const response = await GET(request)
        const data = await response.json()

        expect(data.page).toBe(1)
      })
    })

    describe('response format', () => {
      it('should return JSON with proper headers', async () => {
        const request = new NextRequest('http://localhost:3000/api/packages')
        const response = await GET(request)

        expect(response.headers.get('content-type')).toContain('application/json')
        expect(response.headers.get('Cache-Control')).toBe('public, s-maxage=300, stale-while-revalidate=600')
      })

      it('should include all package fields', async () => {
        const request = new NextRequest('http://localhost:3000/api/packages')
        const response = await GET(request)
        const data = await response.json()
        const pkg = data.packages[0]

        expect(pkg).toHaveProperty('id')
        expect(pkg).toHaveProperty('name')
        expect(pkg).toHaveProperty('description')
        expect(pkg).toHaveProperty('icon')
        expect(pkg).toHaveProperty('category')
        expect(pkg).toHaveProperty('tags')
        expect(pkg).toHaveProperty('popular')
      })

      it('should include all pagination metadata', async () => {
        const request = new NextRequest('http://localhost:3000/api/packages')
        const response = await GET(request)
        const data = await response.json()

        expect(data).toHaveProperty('packages')
        expect(data).toHaveProperty('total')
        expect(data).toHaveProperty('page')
        expect(data).toHaveProperty('pageSize')
        expect(data).toHaveProperty('totalPages')
        expect(data).toHaveProperty('hasMore')
      })
    })
  })
})
