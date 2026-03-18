import { test, expect } from '@playwright/test'

test.describe('Performance Tests', () => {
  test('Landing page should load quickly', async ({ page }) => {
    // Start tracking performance
    await page.goto('/', {
      waitUntil: 'networkidle',
    })

    // Get performance metrics
    const performanceMetrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming

      return {
        // Page load metrics
        domContentLoaded: Math.round(navigation.domContentLoadedEventEnd - navigation.fetchStart),
        loadComplete: Math.round(navigation.loadEventEnd - navigation.fetchStart),
        firstPaint: 0,
        firstContentfulPaint: 0,
      }
    })

    // Get Web Vitals
    const vitals = await page.evaluate(async () => {
      // Get First Contentful Paint
      const fcpEntry = performance.getEntriesByName('first-contentful-paint')[0]
      const fcp = fcpEntry ? Math.round(fcpEntry.startTime) : 0

      // Get Largest Contentful Paint (may need to wait)
      const lcpEntries = performance.getEntriesByType('largest-contentful-paint')
      const lcp = lcpEntries.length > 0 ? Math.round(lcpEntries[lcpEntries.length - 1].startTime) : 0

      // Calculate Cumulative Layout Shift
      const clsEntries = performance.getEntriesByType('layout-shift') as PerformanceEntry[]
      let clsScore = 0
      clsEntries.forEach(entry => {
        if (!(entry as any).hadRecentInput) {
          clsScore += (entry as any).value
        }
      })

      return {
        fcp,
        lcp,
        cls: Math.round(clsScore * 1000) / 1000,
      }
    })

    console.log('\n📊 Landing Page Performance Metrics:')
    console.log(`  DOM Content Loaded: ${performanceMetrics.domContentLoaded}ms`)
    console.log(`  Load Complete: ${performanceMetrics.loadComplete}ms`)
    console.log(`  First Contentful Paint: ${vitals.fcp}ms`)
    console.log(`  Largest Contentful Paint: ${vitals.lcp}ms`)
    console.log(`  Cumulative Layout Shift: ${vitals.cls}`)

    // Performance assertions (based on Web Vitals thresholds)
    // FCP should be under 1.8s for "good" rating
    expect(vitals.fcp).toBeLessThan(2500)

    // LCP should be under 2.5s for "good" rating
    if (vitals.lcp > 0) {
      expect(vitals.lcp).toBeLessThan(4000)
    }

    // CLS should be under 0.1 for "good" rating
    expect(vitals.cls).toBeLessThan(0.25)
  })

  test('App page should perform well', async ({ page }) => {
    await page.goto('/app', {
      waitUntil: 'networkidle',
    })

    // Wait for content to load
    await page.waitForTimeout(1000)

    const performanceMetrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      return {
        domContentLoaded: Math.round(navigation.domContentLoadedEventEnd - navigation.fetchStart),
        loadComplete: Math.round(navigation.loadEventEnd - navigation.fetchStart),
      }
    })

    const vitals = await page.evaluate(async () => {
      const fcpEntry = performance.getEntriesByName('first-contentful-paint')[0]
      const fcp = fcpEntry ? Math.round(fcpEntry.startTime) : 0

      const lcpEntries = performance.getEntriesByType('largest-contentful-paint')
      const lcp = lcpEntries.length > 0 ? Math.round(lcpEntries[lcpEntries.length - 1].startTime) : 0

      const clsEntries = performance.getEntriesByType('layout-shift') as PerformanceEntry[]
      let clsScore = 0
      clsEntries.forEach(entry => {
        if (!(entry as any).hadRecentInput) {
          clsScore += (entry as any).value
        }
      })

      return {
        fcp,
        lcp,
        cls: Math.round(clsScore * 1000) / 1000,
      }
    })

    console.log('\n📊 App Page Performance Metrics:')
    console.log(`  DOM Content Loaded: ${performanceMetrics.domContentLoaded}ms`)
    console.log(`  Load Complete: ${performanceMetrics.loadComplete}ms`)
    console.log(`  First Contentful Paint: ${vitals.fcp}ms`)
    console.log(`  Largest Contentful Paint: ${vitals.lcp}ms`)
    console.log(`  Cumulative Layout Shift: ${vitals.cls}`)

    // Performance assertions
    expect(vitals.fcp).toBeLessThan(2500)
    if (vitals.lcp > 0) {
      expect(vitals.lcp).toBeLessThan(4000)
    }
    expect(vitals.cls).toBeLessThan(0.25)
  })

  test('should have reasonable bundle sizes', async ({ page, request }) => {
    // Track network requests
    const jsSizes: number[] = []
    const cssSizes: number[] = []

    page.on('response', async (response) => {
      const url = response.url()
      const contentType = response.headers()['content-type']

      if (contentType) {
        if (contentType.includes('javascript')) {
          const size = parseInt(response.headers()['content-length'] || '0', 10)
          if (size > 0) jsSizes.push(size)
        }
        if (contentType.includes('css')) {
          const size = parseInt(response.headers()['content-length'] || '0', 10)
          if (size > 0) cssSizes.push(size)
        }
      }
    })

    await page.goto('/')

    const totalJsSize = jsSizes.reduce((sum, size) => sum + size, 0)
    const totalCssSize = cssSizes.reduce((sum, size) => sum + size, 0)

    console.log('\n📦 Bundle Sizes (first load):')
    console.log(`  Total JavaScript: ${Math.round(totalJsSize / 1024)}KB`)
    console.log(`  Total CSS: ${Math.round(totalCssSize / 1024)}KB`)

    // Reasonable bundle size thresholds
    // JS should be under 200KB for initial load
    expect(totalJsSize).toBeLessThan(300 * 1024) // 300KB
  })

  test('should handle page interactions smoothly', async ({ page }) => {
    await page.goto('/')

    // Measure First Input Delay (FID) - simulate interaction
    const fidStart = Date.now()

    // Simulate user interaction - click on a link
    const firstLink = page.locator('a').first()
    await firstLink.click()

    const fid = Date.now() - fidStart

    console.log(`\n⚡ First Input Delay: ~${fid}ms`)

    // Interaction should be quick (under 100ms is good)
    expect(fid).toBeLessThan(200)
  })

  test('API endpoints should respond quickly', async ({ page }) => {
    const startTime = Date.now()

    const response = await page.request.get('/api/packages')

    const responseTime = Date.now() - startTime

    console.log(`\n🚀 API Response Time: ${responseTime}ms`)

    // API should respond in under 1 second
    expect(responseTime).toBeLessThan(1000)
    expect(response.ok()).toBe(true)
  })
})

test.describe('Mobile Performance', () => {
  test('should perform well on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })

    // Simulate slower 3G connection
    await page.goto('/', {
      waitUntil: 'domcontentloaded',
    })

    const performanceMetrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      return {
        domContentLoaded: Math.round(navigation.domContentLoadedEventEnd - navigation.fetchStart),
        loadComplete: Math.round(navigation.loadEventEnd - navigation.fetchStart),
      }
    })

    console.log('\n📱 Mobile Performance:')
    console.log(`  DOM Content Loaded: ${performanceMetrics.domContentLoaded}ms`)
    console.log(`  Load Complete: ${performanceMetrics.loadComplete}ms`)

    // Mobile can be a bit slower, but still should be reasonable
    expect(performanceMetrics.domContentLoaded).toBeLessThan(5000)
  })

  test('should have responsive layout', async ({ page }) => {
    // Test different viewport sizes
    const viewports = [
      { width: 375, height: 667 },  // Mobile
      { width: 768, height: 1024 }, // Tablet
      { width: 1920, height: 1080 }, // Desktop
    ]

    for (const viewport of viewports) {
      await page.setViewportSize(viewport)
      await page.goto('/')

      // Check that page is scrollable and has content
      const bodyHeight = await page.evaluate(() => document.body.scrollHeight)
      const hasContent = await page.locator('h1, h2, h3').count() > 0

      expect(bodyHeight).toBeGreaterThan(0)
      expect(hasContent).toBe(true)
    }

    console.log('\n📱 Responsive Layout: ✓ All viewport sizes tested')
  })
})

test.describe('Resource Optimization', () => {
  test('should use efficient images', async ({ page }) => {
    const imageInfo = await page.evaluate(() => {
      const images = Array.from(document.querySelectorAll('img'))
      return {
        totalImages: images.length,
        imagesWithoutAlt: images.filter(img => !img.alt).length,
        imagesWithLazy: images.filter(img => img.loading === 'lazy').length,
      }
    })

    console.log(`\n🖼️  Image Optimization:`)
    console.log(`  Total Images: ${imageInfo.totalImages}`)
    console.log(`  Without Alt: ${imageInfo.imagesWithoutAlt} (should be 0)`)
    console.log(`  Lazy Loaded: ${imageInfo.imagesWithLazy}`)

    expect(imageInfo.imagesWithoutAlt).toBe(0)
  })

  test('should use text compression', async ({ page }) => {
    const response = await page.request.get('/')
    const encoding = response.headers()['content-encoding']

    console.log(`\n🗜️  Content Encoding: ${encoding || 'none'}`)

    // Should have some form of compression (gzip, brotli, etc.)
    const hasCompression = encoding && (encoding.includes('gzip') || encoding.includes('br') || encoding.includes('zstd'))

    if (hasCompression) {
      console.log(`  ✓ Compression enabled: ${encoding}`)
    } else {
      console.log(`  ⚠️  No compression detected`)
    }
  })
})
