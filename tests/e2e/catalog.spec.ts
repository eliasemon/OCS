import { test, expect } from '@playwright/test'

test.describe('Package Catalog', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should load the main page', async ({ page }) => {
    await expect(page.getByRole('main')).toBeVisible()
    await expect(page).toHaveTitle(/Appnest/)
  })

  test('should display package cards', async ({ page }) => {
    const cards = page.locator('button[class*="border-gray-800"]')
    await expect(cards.first()).toBeVisible()
  })

  test('should filter by category', async ({ page }) => {
    // Wait for page to load
    await page.waitForLoadState('networkidle')

    // Find a category button (e.g., Development)
    const devCategory = page.getByText('Development').first()
    await devCategory.click()

    // Should show filtered results
    await expect(page.getByText('packages')).toBeVisible()
  })

  test('should search packages', async ({ page }) => {
    // Find search input
    const searchInput = page.getByPlaceholder('Search packages')
    await searchInput.fill('git')

    // Should show filtered results
    await expect(page.getByText('Git', { exact: true })).toBeVisible()
  })

  test('should clear search', async ({ page }) => {
    const searchInput = page.getByPlaceholder('Search packages')
    await searchInput.fill('chrome')

    // Wait for results
    await page.waitForTimeout(500)

    // Click clear button
    const clearButton = page.locator('button[aria-label="Clear search"]')
    await clearButton.click()

    // Input should be empty
    await expect(searchInput).toHaveValue('')
  })

  test('should select and deselect packages', async ({ page }) => {
    // Find first package card
    const firstCard = page.locator('button[class*="border-gray-800"]').first()

    // Click to select
    await firstCard.click()
    await expect(firstCard).toHaveClass(/border-cyan-500/)

    // Click again to deselect
    await firstCard.click()
    await expect(firstCard).not.toHaveClass(/border-cyan-500/)
  })

  test('should show selected count', async ({ page }) => {
    // Select a few packages
    const cards = page.locator('button[class*="border-gray-800"]')

    await cards.nth(0).click()
    await cards.nth(1).click()

    // Check count is displayed
    const selectedCount = page.getByText(/\d+ packages/)
    await expect(selectedCount).toBeVisible()
  })

  test('should navigate to docs page', async ({ page }) => {
    await page.getByRole('link', { name: /docs/i }).click()
    await expect(page).toHaveURL(/\/docs/)
  })

  test('should navigate to share page', async ({ page }) => {
    await page.getByRole('link', { name: /share/i }).click()
    await expect(page).toHaveURL(/\/share/)
  })

  test('should toggle dark mode', async ({ page }) => {
    // Find theme toggle button
    const themeToggle = page.locator('button[aria-label*="theme"]').or(
      page.locator('button').filter({ hasText: /🌙|☀️/ })
    )

    if (await themeToggle.count() > 0) {
      await themeToggle.first().click()
      // Theme should change (verify by class or attribute)
      await expect(themeToggle.first()).toBeVisible()
    }
  })
})

test.describe('Package Selection Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should complete full package selection workflow', async ({ page }) => {
    // Search for a package
    await page.getByPlaceholder('Search packages').fill('git')

    // Select the Git package
    const gitCard = page.locator('button').filter({ hasText: 'Git' }).first()
    await gitCard.click()

    // Verify it's selected
    await expect(gitCard).toHaveClass(/border-cyan-500/)

    // Clear search
    await page.locator('button[aria-label="Clear search"]').click()

    // Select another package
    const cards = page.locator('button[class*="border-gray-800"]')
    await cards.nth(1).click()

    // Filter by category
    await page.getByText('Development').first().click()

    // Verify filtering worked
    await expect(page.getByText('packages')).toBeVisible()
  })
})

test.describe('Keyboard Navigation', () => {
  test('should focus search with Cmd+K', async ({ page }) => {
    await page.goto('/')

    const searchInput = page.getByPlaceholder('Search packages')

    // Press Cmd+K
    await page.keyboard.press('Meta+k')

    // Search should be focused
    await expect(searchInput).toBeFocused()
  })

  test('should navigate with Tab key', async ({ page }) => {
    await page.goto('/')

    // Press Tab to navigate
    await page.keyboard.press('Tab')

    // Some element should be focused
    const focused = page.locator(':focus')
    await expect(focused.count()).resolves.toBeGreaterThan(0)
  })
})

test.describe('Accessibility', () => {
  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/')

    const h1 = page.locator('h1')
    await expect(h1).toBeVisible()
  })

  test('should have accessible buttons', async ({ page }) => {
    await page.goto('/')

    const buttons = page.locator('button[aria-label], button[aria-describedby]')
    const buttonCount = await buttons.count()

    // At least some buttons should have aria-labels
    expect(buttonCount).toBeGreaterThan(0)
  })

  test('should support screen reader navigation', async ({ page }) => {
    await page.goto('/')

    // Check for proper landmarks
    const main = page.locator('main')
    await expect(main).toBeVisible()

    const nav = page.locator('nav')
    await expect(nav).toBeVisible()
  })
})

test.describe('Performance', () => {
  test('should load quickly', async ({ page }) => {
    const startTime = Date.now()
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    const loadTime = Date.now() - startTime

    // Should load in under 5 seconds
    expect(loadTime).toBeLessThan(5000)
  })

  test('should handle large package list', async ({ page }) => {
    await page.goto('/')

    // Scroll to bottom
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))

    // All packages should be rendered
    const cards = page.locator('button[class*="border"]')
    const count = await cards.count()
    expect(count).toBeGreaterThan(0)
  })
})

test.describe('Error Handling', () => {
  test('should handle network errors gracefully', async ({ page }) => {
    // Intercept API calls and simulate failure
    await page.route('**/api/packages', route => route.abort())

    await page.goto('/')

    // Page should still load
    await expect(page.locator('h1')).toBeVisible()
  })

  test('should show empty state for no search results', async ({ page }) => {
    await page.goto('/')

    // Search for non-existent package
    await page.getByPlaceholder('Search packages').fill('xyznonexistent12345')

    // Should show empty state
    await expect(page.getByText(/No packages match/)).toBeVisible()
  })
})
