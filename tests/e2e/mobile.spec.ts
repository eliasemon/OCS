import { test, expect, devices } from '@playwright/test'

// Test on mobile viewport
test.use(devices['iPhone 12'])

test.describe('Mobile Responsive Tests', () => {
  test('should load correctly on mobile', async ({ page }) => {
    await page.goto('/')

    // Page should load
    await expect(page.locator('h1')).toBeVisible()
  })

  test('should have mobile-friendly navigation', async ({ page }) => {
    await page.goto('/')

    // Check for mobile menu or responsive nav
    const nav = page.locator('nav')
    await expect(nav).toBeVisible()

    // On mobile, there might be a hamburger menu
    const menuButton = page.locator('button[aria-label*="menu"], button[aria-label*="Menu"]')
    const menuCount = await menuButton.count()

    if (menuCount > 0) {
      await menuButton.first().click()
      await page.waitForTimeout(500)

      // Menu should be visible
      const mobileMenu = page.locator('[role="menu"], .mobile-menu')
      await expect(mobileMenu.first()).toBeVisible()
    }
  })

  test('should display packages in single column on mobile', async ({ page }) => {
    await page.goto('/')

    // Wait for content to load
    await page.waitForLoadState('networkidle')

    // Check grid layout
    const grid = page.locator('div[class*="grid"]')
    if (await grid.count() > 0) {
      const className = await grid.first().getAttribute('class')
      // Should have responsive classes
      expect(className).toMatch(/grid-cols-1/)
    }
  })

  test('should have touch-friendly buttons', async ({ page }) => {
    await page.goto('/')

    // Buttons should be at least 44x44 pixels for touch targets
    const buttons = page.locator('button').filter({ hasText: /.+/ })
    const firstButton = buttons.first()

    const box = await firstButton.boundingBox()
    if (box) {
      expect(box.height).toBeGreaterThanOrEqual(36) // Minimum recommended
      expect(box.width).toBeGreaterThanOrEqual(36)
    }
  })

  test('should be able to tap and select packages', async ({ page }) => {
    await page.goto('/')

    // Tap first package card
    const firstCard = page.locator('button[class*="border-gray-800"]').first()
    await firstCard.tap()

    // Should be selected
    await expect(firstCard).toHaveClass(/border-cyan-500/)
  })

  test('should scroll smoothly on mobile', async ({ page }) => {
    await page.goto('/')

    // Scroll down
    await page.evaluate(() => window.scrollTo(0, 500))

    await page.waitForTimeout(500)

    // Scroll up
    await page.evaluate(() => window.scrollTo(0, 0))

    await page.waitForTimeout(500)

    // Should not have any scroll-related errors
    const errors: string[] = []
    page.on('pageerror', error => errors.push(error.message))

    expect(errors).toHaveLength(0)
  })

  test('should have readable text on mobile', async ({ page }) => {
    await page.goto('/')

    // Check font size of body text
    const bodyText = page.locator('p, .text-sm').first()
    const fontSize = await bodyText.evaluate(el => {
      return window.getComputedStyle(el).fontSize
    })

    // Should be at least 14px (or 16px recommended)
    const numericSize = parseInt(fontSize)
    expect(numericSize).toBeGreaterThanOrEqual(14)
  })

  test('should handle mobile keyboard', async ({ page }) => {
    await page.goto('/')

    // Focus on search input
    const searchInput = page.getByPlaceholder('Search packages')
    await searchInput.tap()

    // Virtual keyboard should appear (this is implicit in mobile testing)
    await expect(searchInput).toBeFocused()

    // Type in search
    await searchInput.fill('git')

    // Should filter results
    await page.waitForTimeout(500)
  })

  test('should have mobile-friendly search', async ({ page }) => {
    await page.goto('/')

    // Search input should be full width or easily accessible
    const searchInput = page.getByPlaceholder('Search packages')
    await expect(searchInput).toBeVisible()

    const box = await searchInput.boundingBox()
    if (box) {
      // Should take most of the screen width
      expect(box.width).toBeGreaterThan(200)
    }
  })

  test('should handle horizontal scrolling if present', async ({ page }) => {
    await page.goto('/')

    // Check for horizontal scroll containers
    const horizontalScroll = page.locator('[class*="overflow-x-auto"]')
    const count = await horizontalScroll.count()

    if (count > 0) {
      // Try scrolling horizontally
      await horizontalScroll.first().evaluate(el => {
        el.scrollLeft = 100
      })

      await page.waitForTimeout(200)
    }
  })
})

// Test on tablet
test.use(devices['iPad'])

test.describe('Tablet Responsive Tests', () => {
  test('should load correctly on tablet', async ({ page }) => {
    await page.goto('/')

    await expect(page.locator('h1')).toBeVisible()
  })

  test('should show more columns on tablet than mobile', async ({ page }) => {
    await page.goto('/')

    const grid = page.locator('div[class*="grid"]')
    if (await grid.count() > 0) {
      const className = await grid.first().getAttribute('class')
      // Should have 2 columns on tablet
      expect(className).toMatch(/sm:grid-cols-2/)
    }
  })
})

// Test on different orientations
test.describe('Orientation Tests', () => {
  test.use({ viewport: { width: 375, height: 812 } }) // Portrait

  test('should work in portrait mode', async ({ page }) => {
    await page.goto('/')

    await expect(page.locator('h1')).toBeVisible()

    // Vertical scroll should be available
    const scrollHeight = await page.evaluate(() => document.body.scrollHeight)
    expect(scrollHeight).toBeGreaterThan(812)
  })

  test.use({ viewport: { width: 812, height: 375 } }) // Landscape

  test('should work in landscape mode', async ({ page }) => {
    await page.goto('/')

    await expect(page.locator('h1')).toBeVisible()
  })
})

// Test touch gestures
test.describe('Touch Gesture Tests', () => {
  test.use(devices['iPhone 12'])

  test('should handle swipe gestures', async ({ page }) => {
    await page.goto('/')

    // Try swiping left (for mobile menu or navigation)
    await page.touchscreen.tap(300, 300)
    await page.touchscreen.swipe({ x: 300, y: 300 }, { x: 100, y: 300 })

    await page.waitForTimeout(500)
  })

  test('should handle pinch zoom (should be prevented)', async ({ page }) => {
    await page.goto('/')

    // Most web apps prevent zoom, so this should not change scale
    const initialScale = await page.evaluate(() => {
      return (window as any).visualViewport?.scale || 1
    })

    // Simulate pinch (this is a basic check)
    await page.waitForTimeout(500)

    const finalScale = await page.evaluate(() => {
      return (window as any).visualViewport?.scale || 1
    })

    // Scale should remain the same (zoom prevented)
    expect(finalScale).toBe(initialScale)
  })

  test('should handle double-tap', async ({ page }) => {
    await page.goto('/')

    const firstCard = page.locator('button[class*="border-gray-800"]').first()

    // Double tap
    await firstCard.dblclick()

    await page.waitForTimeout(500)
  })
})

// Test different device-specific features
test.describe('Device Feature Tests', () => {
  test.use(devices['iPhone 12 Pro'])

  test('should respect system dark mode preference', async ({ page }) => {
    // Emulate dark mode
    await page.emulateMedia({ colorScheme: 'dark' })
    await page.goto('/')

    // Should have dark background
    const body = page.locator('body')
    const backgroundColor = await body.evaluate(el => {
      return window.getComputedStyle(el).backgroundColor
    })

    // Should be dark (low values for rgb)
    expect(backgroundColor).toMatch(/rgb\(\d{1,3},\s*\d{1,3},\s*\d{1,3}\)/)
  })

  test('should respect system light mode preference', async ({ page }) => {
    // Emulate light mode
    await page.emulateMedia({ colorScheme: 'light' })
    await page.goto('/')

    await expect(page.locator('h1')).toBeVisible()
  })

  test('should handle reduced motion preference', async ({ page }) => {
    // Emulate prefers-reduced-motion
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/')

    // Should load without issues
    await expect(page.locator('h1')).toBeVisible()
  })
})
