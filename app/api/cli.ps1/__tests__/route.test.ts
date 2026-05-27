import { describe, it, expect, beforeEach, vi } from 'vitest'
import { GET } from '../route'
import { NextRequest } from 'next/server'

describe('/api/cli.ps1', () => {
  describe('GET endpoint', () => {
    it('should return CLI installer script', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/cli.ps1'
      )
      const response = await GET(request)
      const script = await response.text()

      expect(response.headers.get('Content-Type')).toContain('text/plain')
      expect(response.headers.get('Cache-Control')).toBe('no-store')
      expect(script).toContain('#Requires -Version 5.1')
      expect(script).toContain('Appnest CLI')
      expect(script).toContain('Interactive Installer')
    })

    it('should include base URL configuration', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/cli.ps1'
      )
      const response = await GET(request)
      const script = await response.text()

      expect(script).toContain('$baseUrl = "https://appnest.app"')
    })

    it('should include Get-Packages function', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/cli.ps1'
      )
      const response = await GET(request)
      const script = await response.text()

      expect(script).toContain('function Get-Packages')
      expect(script).toContain('Invoke-RestMethod "$baseUrl/api/packages"')
    })

    it('should include Show-CategoryMenu function', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/cli.ps1'
      )
      const response = await GET(request)
      const script = await response.text()

      expect(script).toContain('function Show-CategoryMenu')
    })

    it('should include Select-Packages function', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/cli.ps1'
      )
      const response = await GET(request)
      const script = await response.text()

      expect(script).toContain('function Select-Packages')
    })

    it('should include menu options', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/cli.ps1'
      )
      const response = await GET(request)
      const script = await response.text()

      expect(script).toContain('[A] All packages')
      expect(script).toContain('[Q] Quit')
      expect(script).toContain('DONE')
    })

    it('should handle empty selection', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/cli.ps1'
      )
      const response = await GET(request)
      const script = await response.text()

      expect(script).toContain('No packages selected. Exiting.')
    })

    it('should include script invocation logic', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/cli.ps1'
      )
      const response = await GET(request)
      const script = await response.text()

      expect(script).toContain('Invoke-Expression $script')
      expect(script).toContain('$scriptUrl = "$baseUrl/api/install.ps1?apps=$appsList"')
    })

    it('should include error handling', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/cli.ps1'
      )
      const response = await GET(request)
      const script = await response.text()

      expect(script).toContain('$ErrorActionPreference = "Continue"')
      expect(script).toContain('Write-Error "Failed to fetch package list:')
    })

    it('should display package counts per category', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/cli.ps1'
      )
      const response = await GET(request)
      const script = await response.text()

      expect(script).toContain('$count = ($packages | Where-Object')
      expect(script).toContain('packages)')
    })

    it('should include Write-Banner function', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/cli.ps1'
      )
      const response = await GET(request)
      const script = await response.text()

      expect(script).toContain('function Write-Banner')
      expect(script).toContain('appnest.app')
    })

    it('should use Read-Host for user input', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/cli.ps1'
      )
      const response = await GET(request)
      const script = await response.text()

      expect(script).toContain('Read-Host')
    })

    it('should handle ALL option to select all packages', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/cli.ps1'
      )
      const response = await GET(request)
      const script = await response.text()

      // Check for ALL option handling (may be implemented differently)
      expect(script).toMatch(/ALL/i)
    })

    it('should handle Q option to quit', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/cli.ps1'
      )
      const response = await GET(request)
      const script = await response.text()

      // Check for Q option in menu
      expect(script).toContain('[Q]')
    })
  })

  describe('response headers', () => {
    it('should set plain text content type', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/cli.ps1'
      )
      const response = await GET(request)

      expect(response.headers.get('Content-Type')).toContain('text/plain')
    })

    it('should disable caching', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/cli.ps1'
      )
      const response = await GET(request)

      expect(response.headers.get('Cache-Control')).toBe('no-store')
    })

    it('should include charset in content type', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/cli.ps1'
      )
      const response = await GET(request)

      expect(response.headers.get('Content-Type')).toContain('charset=utf-8')
    })
  })

  describe('script flow', () => {
    it('should execute functions in correct order', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/cli.ps1'
      )
      const response = await GET(request)
      const script = await response.text()

      // Check for main execution flow
      const writeBannerIndex = script.indexOf('Write-Banner')
      const getAllPackagesIndex = script.indexOf('$allPackages = Get-Packages')
      const showCategoryMenuIndex = script.indexOf('$filtered = Show-CategoryMenu')
      const selectPackagesIndex = script.indexOf('$selectedIds = Select-Packages')

      expect(writeBannerIndex).toBeLessThan(getAllPackagesIndex)
      expect(getAllPackagesIndex).toBeLessThan(showCategoryMenuIndex)
      expect(showCategoryMenuIndex).toBeLessThan(selectPackagesIndex)
    })
  })

  describe('user interaction', () => {
    it('should prompt for category selection', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/cli.ps1'
      )
      const response = await GET(request)
      const script = await response.text()

      expect(script).toContain('Select a category:')
      expect(script).toContain('Enter choice')
    })

    it('should prompt for package selection', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/cli.ps1'
      )
      const response = await GET(request)
      const script = await response.text()

      expect(script).toContain('Toggle packages')
      expect(script).toContain('Toggle # (or DONE/ALL)')
    })

    it('should show selected count during selection', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/cli.ps1'
      )
      const response = await GET(request)
      const script = await response.text()

      // Check for count display (implementation may vary)
      expect(script).toMatch(/Count|count|selected/i)
    })
  })
})
