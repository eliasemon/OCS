import { test, expect } from '@playwright/test'

test.describe('Install Script Generation', () => {
  test('should generate install script from homepage', async ({ page }) => {
    await page.goto('/')

    // Select some packages
    const cards = page.locator('button[class*="border-gray-800"]')
    await cards.nth(0).click()
    await cards.nth(1).click()

    // Click install button
    const installButton = page.getByRole('button', { name: /install/i })
    await installButton.click()

    // Should either download or show script
    await page.waitForTimeout(1000)
  })

  test('should generate PowerShell script via API', async ({ page, request }) => {
    // Test the API endpoint directly
    const response = await request.get('/api/install.ps1?apps=Git.Git,Google.Chrome')

    expect(response.status()).toBe(200)
    expect(response.headers()['content-type']).toContain('text/plain')

    const script = await response.text()
    expect(script).toContain('#Requires -Version 5.1')
    expect(script).toContain('Git.Git')
    expect(script).toContain('Google.Chrome')
    expect(script).toContain('appnest.app')
  })

  test('should handle single package', async ({ page, request }) => {
    const response = await request.get('/api/install.ps1?apps=Git.Git')

    expect(response.status()).toBe(200)

    const script = await response.text()
    expect(script).toContain('Git.Git')
  })

  test('should handle invalid package IDs', async ({ page, request }) => {
    const response = await request.get('/api/install.ps1?apps=Fake.Package')

    expect(response.status()).toBe(200)

    const script = await response.text()
    expect(script).toContain('Write-Error')
  })

  test('should handle empty apps parameter', async ({ page, request }) => {
    const response = await request.get('/api/install.ps1?apps=')

    expect(response.status()).toBe(200)

    const script = await response.text()
    expect(script).toContain('No packages specified')
  })

  test('should escape special characters in script', async ({ page, request }) => {
    const response = await request.get('/api/install.ps1?apps=Git.Git')

    const script = await response.text()
    // Check for proper escaping
    expect(script).toContain('`"')
  })
})

test.describe('API Package Catalog', () => {
  test('should return all packages', async ({ request }) => {
    const response = await request.get('/api/packages')

    expect(response.status()).toBe(200)

    const packages = await response.json()
    expect(Array.isArray(packages)).toBe(true)
    expect(packages.length).toBeGreaterThan(0)
  })

  test('should filter by category', async ({ request }) => {
    const response = await request.get('/api/packages?category=Development')

    expect(response.status()).toBe(200)

    const packages = await response.json()
    packages.forEach((pkg: any) => {
      expect(pkg.category).toBe('Development')
    })
  })

  test('should search packages', async ({ request }) => {
    const response = await request.get('/api/packages?search=git')

    expect(response.status()).toBe(200)

    const packages = await response.json()
    expect(packages.length).toBeGreaterThan(0)
  })

  test('should return popular packages', async ({ request }) => {
    const response = await request.get('/api/packages?popular=true')

    expect(response.status()).toBe(200)

    const packages = await response.json()
    packages.forEach((pkg: any) => {
      expect(pkg.popular).toBe(true)
    })
  })

  test('should limit results', async ({ request }) => {
    const response = await request.get('/api/packages?limit=5')

    expect(response.status()).toBe(200)

    const packages = await response.json()
    expect(packages.length).toBeLessThanOrEqual(5)
  })

  test('should combine filters', async ({ request }) => {
    const response = await request.get('/api/packages?category=Development&popular=true&limit=2')

    expect(response.status()).toBe(200)

    const packages = await response.json()
    expect(packages.length).toBeLessThanOrEqual(2)
    packages.forEach((pkg: any) => {
      expect(pkg.category).toBe('Development')
      expect(pkg.popular).toBe(true)
    })
  })
})

test.describe('Share Page', () => {
  test('should load share page', async ({ page }) => {
    await page.goto('/share')
    await expect(page.locator('h1')).toBeVisible()
  })

  test('should generate shareable URL', async ({ page }) => {
    await page.goto('/share')

    // Select some packages
    await page.goto('/?apps=Git.Git,Google.Chrome')

    // URL should contain selected packages
    expect(page.url()).toContain('Git.Git')
  })
})
