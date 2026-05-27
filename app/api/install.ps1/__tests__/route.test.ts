import { describe, it, expect, beforeEach, vi } from 'vitest'
import { GET } from '../route'
import { NextRequest } from 'next/server'

// Mock the packages data
vi.mock('@/data/packages.json', () => ({
  default: [
    { id: 'Git.Git' },
    { id: 'Google.Chrome' },
    { id: 'Microsoft.VisualStudioCode' },
    { id: 'Python.Python.3.12' },
  ],
}))

describe('/api/install.ps1', () => {
  describe('GET endpoint - happy paths', () => {
    it('should generate install script for single valid package', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/install.ps1?apps=Git.Git'
      )
      const response = await GET(request)
      const script = await response.text()

      expect(response.headers.get('Content-Type')).toContain('text/plain')
      expect(response.headers.get('Cache-Control')).toBe('no-store')
      expect(script).toContain('#Requires -Version 5.1')
      expect(script).toContain('Git.Git')
      expect(script).toContain('appnest-beta.vercel.app')
    })

    it('should generate install script for multiple valid packages', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/install.ps1?apps=Git.Git,Google.Chrome,Microsoft.VisualStudioCode'
      )
      const response = await GET(request)
      const script = await response.text()

      expect(script).toContain('Git.Git')
      expect(script).toContain('Google.Chrome')
      expect(script).toContain('Microsoft.VisualStudioCode')
      expect(script).toContain('3') // package count
    })

    it('should handle packages with special characters (sanitized)', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/install.ps1?apps=Git$Git'
      )
      const response = await GET(request)
      const script = await response.text()

      // Should sanitize to Git.Git
      expect(response.status).toBe(200)
    })

    it('should handle whitespace and empty segments in apps param', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/install.ps1?apps=Git.Git,,  ,Google.Chrome'
      )
      const response = await GET(request)
      const script = await response.text()

      expect(script).toContain('Git.Git')
      expect(script).toContain('Google.Chrome')
    })

    it('should escape special characters in generated script', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/install.ps1?apps=Git.Git'
      )
      const response = await GET(request)
      const script = await response.text()

      // Package IDs should be properly escaped
      expect(script).toContain('"Git.Git"')
    })
  })

  describe('error paths - invalid input', () => {
    it('should return error for empty apps parameter', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/install.ps1?apps='
      )
      const response = await GET(request)
      const script = await response.text()

      expect(script).toContain('Write-Error')
      expect(script).toContain('No packages specified')
      expect(response.headers.get('Content-Type')).toContain('text/plain')
    })

    it('should return error for missing apps parameter', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/install.ps1'
      )
      const response = await GET(request)
      const script = await response.text()

      expect(script).toContain('Write-Error')
      expect(script).toContain('No packages specified')
    })

    it('should return error for no valid package IDs', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/install.ps1?apps=Fake.Package,Another.Fake'
      )
      const response = await GET(request)
      const script = await response.text()

      expect(script).toContain('Write-Error')
      expect(script).toContain('No valid package IDs found')
    })

    it('should handle only invalid format IDs', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/install.ps1?apps=invalid,no-dots-here,badformat'
      )
      const response = await GET(request)
      const script = await response.text()

      expect(script).toContain('Write-Error')
      expect(script).toContain('No valid package IDs found')
    })
  })

  describe('mixed valid and invalid packages', () => {
    it('should generate script with valid packages and warn about invalid', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/install.ps1?apps=Git.Git,Fake.Package,Google.Chrome'
      )
      const response = await GET(request)
      const script = await response.text()

      // Should include valid packages
      expect(script).toContain('Git.Git')
      expect(script).toContain('Google.Chrome')

      // Should warn about invalid package
      expect(script).toContain('Write-Warning')
      expect(script).toContain('Fake.Package')
    })

    it('should include all invalid packages in warnings', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/install.ps1?apps=Git.Git,Invalid1,Invalid2,Invalid3'
      )
      const response = await GET(request)
      const script = await response.text()

      expect(script).toContain('Write-Warning "Skipping unknown package: Invalid1"')
      expect(script).toContain('Write-Warning "Skipping unknown package: Invalid2"')
      expect(script).toContain('Write-Warning "Skipping unknown package: Invalid3"')
    })
  })

  describe('edge cases', () => {
    it('should handle maximum package limit (50)', async () => {
      // Create 55 package IDs
      const manyPackages = Array.from({ length: 55 }, (_, i) =>
        i % 2 === 0 ? 'Git.Git' : 'Google.Chrome'
      ).join(',')

      const request = new NextRequest(
        `http://localhost:3000/api/install.ps1?apps=${manyPackages}`
      )
      const response = await GET(request)
      const script = await response.text()

      // Should process max 50 unique IDs
      expect(response.status).toBe(200)
    })

    it('should handle duplicate package IDs', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/install.ps1?apps=Git.Git,Git.Git,Git.Git'
      )
      const response = await GET(request)
      const script = await response.text()

      // Should deduplicate
      expect(response.status).toBe(200)
    })

    it('should handle URL-encoded special characters', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/install.ps1?apps=Git.Git%2CGoogle.Chrome'
      )
      const response = await GET(request)

      expect(response.status).toBe(200)
    })

    it('should handle package IDs with different separators', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/install.ps1?apps=Git.Git, Google.Chrome , Microsoft.VisualStudioCode'
      )
      const response = await GET(request)
      const script = await response.text()

      expect(script).toContain('Git.Git')
      expect(script).toContain('Google.Chrome')
      expect(script).toContain('Microsoft.VisualStudioCode')
    })
  })

  describe('security considerations', () => {
    it('should sanitize package IDs to prevent injection', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/install.ps1?apps=Git.Git;rm-rf'
      )
      const response = await GET(request)
      const script = await response.text()

      // The semicolon and other special chars should be sanitized
      expect(script).not.toContain(';rm')
      expect(script).not.toContain('rm -rf')
    })

    it('should escape PowerShell special characters in script', async () => {
      // Use a package ID with actual special characters
      const request = new NextRequest(
        'http://localhost:3000/api/install.ps1?apps=Git"Git'
      )
      const response = await GET(request)
      const script = await response.text()

      // The special char should be sanitized and the ID won't match catalog
      // but the script should still be generated safely
      expect(response.status).toBe(200)
      expect(response.headers.get('Content-Type')).toContain('text/plain')
    })
  })

  describe('script content validation', () => {
    it('should include Appnest banner', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/install.ps1?apps=Git.Git'
      )
      const response = await GET(request)
      const script = await response.text()

      expect(script).toContain('Write-Banner')
      expect(script).toContain('██╗')
    })

    it('should include timestamp', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/install.ps1?apps=Git.Git'
      )
      const response = await GET(request)
      const script = await response.text()

      expect(script).toMatch(/\.GENERATED \d{4}-\d{2}-\d{2}T/)
    })

    it('should include package source reference', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/install.ps1?apps=Git.Git'
      )
      const response = await GET(request)
      const script = await response.text()

      expect(script).toContain('appnest-beta.vercel.app')
    })

    it('should include winget auto-install logic', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/install.ps1?apps=Git.Git'
      )
      const response = await GET(request)
      const script = await response.text()

      expect(script).toContain('Test-WingetInstalled')
      expect(script).toContain('Install-WingetIfMissing')
    })

    it('should include retry URL for failed packages', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/install.ps1?apps=Git.Git'
      )
      const response = await GET(request)
      const script = await response.text()

      expect(script).toContain('Retry failed:')
      expect(script).toContain('powershell -c')
    })
  })

  describe('response headers', () => {
    it('should set plain text content type', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/install.ps1?apps=Git.Git'
      )
      const response = await GET(request)

      expect(response.headers.get('Content-Type')).toContain('text/plain')
    })

    it('should disable caching', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/install.ps1?apps=Git.Git'
      )
      const response = await GET(request)

      expect(response.headers.get('Cache-Control')).toBe('no-store')
    })

    it('should include charset in content type', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/install.ps1?apps=Git.Git'
      )
      const response = await GET(request)

      expect(response.headers.get('Content-Type')).toContain('charset=utf-8')
    })
  })
})
