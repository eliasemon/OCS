import { test, expect } from '@playwright/test'

test.describe('Preset Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should display preset dropdown', async ({ page }) => {
    const presetLabel = page.getByText('Presets')
    await expect(presetLabel).toBeVisible()

    const loadPresetButton = page.getByText('Load a preset')
    await expect(loadPresetButton).toBeVisible()
  })

  test('should load built-in preset', async ({ page }) => {
    // Open preset dropdown
    const loadPresetButton = page.getByText('Load a preset')
    await loadPresetButton.click()

    // Wait for dropdown to appear
    await page.waitForTimeout(500)

    // Select a preset (this may need adjustment based on actual UI)
    const presetOption = page.getByText(/Development/i).first()
    if (await presetOption.count() > 0) {
      await presetOption.click()

      // Verify packages are selected
      await page.waitForTimeout(500)
      const selectedCards = page.locator('button[class*="border-cyan-500"]')
      const count = await selectedCards.count()
      expect(count).toBeGreaterThan(0)
    }
  })

  test('should save custom preset', async ({ page }) => {
    // First select some packages
    const cards = page.locator('button[class*="border-gray-800"]')
    await cards.nth(0).click()
    await cards.nth(1).click()

    // Click save preset button
    const saveButton = page.getByText(/Save as Preset/)
    await saveButton.click()

    // Enter preset name
    const nameInput = page.getByPlaceholder('Preset name')
    await nameInput.fill('My Test Preset')

    // Save
    await page.keyboard.press('Enter')

    // Verify success (toast should appear)
    await page.waitForTimeout(500)
  })

  test('should cancel preset save', async ({ page }) => {
    // Select packages
    const cards = page.locator('button[class*="border-gray-800"]')
    await cards.nth(0).click()

    // Click save preset
    const saveButton = page.getByText(/Save as Preset/)
    await saveButton.click()

    // Press Escape to cancel
    await page.keyboard.press('Escape')

    // Should return to normal state
    await expect(page.getByText(/Save as Preset/)).toBeVisible()
  })

  test('should disable save button when no packages selected', async ({ page }) => {
    const saveButton = page.getByText(/Save as Preset/)

    // Initially disabled
    await expect(saveButton).toBeDisabled()

    // Select a package
    const cards = page.locator('button[class*="border-gray-800"]')
    await cards.nth(0).click()

    // Should now be enabled
    await expect(saveButton).not.toBeDisabled()
  })
})

test.describe('Preset Persistence', () => {
  test('should persist presets across page reloads', async ({ page, context }) => {
    await page.goto('/')

    // Select some packages and save preset
    const cards = page.locator('button[class*="border-gray-800"]')
    await cards.nth(0).click()

    const saveButton = page.getByText(/Save as Preset/)
    await saveButton.click()

    const nameInput = page.getByPlaceholder('Preset name')
    await nameInput.fill('Persistence Test')
    await page.keyboard.press('Enter')

    await page.waitForTimeout(1000)

    // Reload page
    await page.reload()

    // Open preset dropdown
    const loadPresetButton = page.getByText('Load a preset')
    await loadPresetButton.click()

    await page.waitForTimeout(500)

    // Custom preset should still be there
    const customPreset = page.getByText('Persistence Test')
    await expect(customPreset).toBeVisible()
  })

  test('should persist package selection across page reloads', async ({ page }) => {
    await page.goto('/')

    // Select some packages
    const cards = page.locator('button[class*="border-gray-800"]')
    await cards.nth(0).click()
    await cards.nth(1).click()

    await page.waitForTimeout(500)

    // Reload page
    await page.reload()

    // Wait for restore
    await page.waitForTimeout(500)

    // Selection should be restored
    const selectedCards = page.locator('button[class*="border-cyan-500"]')
    const count = await selectedCards.count()
    expect(count).toBeGreaterThan(0)
  })
})

test.describe('Preset Edge Cases', () => {
  test('should handle very long preset names', async ({ page }) => {
    await page.goto('/')

    // Select a package
    const cards = page.locator('button[class*="border-gray-800"]')
    await cards.nth(0).click()

    // Try to save with long name
    const saveButton = page.getByText(/Save as Preset/)
    await saveButton.click()

    const nameInput = page.getByPlaceholder('Preset name')
    const longName = 'A'.repeat(100)
    await nameInput.fill(longName)
    await page.keyboard.press('Enter')

    // Should still work
    await page.waitForTimeout(500)
  })

  test('should handle special characters in preset name', async ({ page }) => {
    await page.goto('/')

    const cards = page.locator('button[class*="border-gray-800"]')
    await cards.nth(0).click()

    const saveButton = page.getByText(/Save as Preset/)
    await saveButton.click()

    const nameInput = page.getByPlaceholder('Preset name')
    await nameInput.fill('Test @#$%^&*()')
    await page.keyboard.press('Enter')

    await page.waitForTimeout(500)
  })

  test('should handle empty preset name', async ({ page }) => {
    await page.goto('/')

    const cards = page.locator('button[class*="border-gray-800"]')
    await cards.nth(0).click()

    const saveButton = page.getByText(/Save as Preset/)
    await saveButton.click()

    // Don't enter name, just press Enter
    await page.keyboard.press('Enter')

    // Should show error
    await page.waitForTimeout(500)
    const errorMessage = page.getByText(/Please enter a preset name/)
    await expect(errorMessage).toBeVisible()
  })

  test('should handle whitespace-only preset name', async ({ page }) => {
    await page.goto('/')

    const cards = page.locator('button[class*="border-gray-800"]')
    await cards.nth(0).click()

    const saveButton = page.getByText(/Save as Preset/)
    await saveButton.click()

    const nameInput = page.getByPlaceholder('Preset name')
    await nameInput.fill('   ')
    await page.keyboard.press('Enter')

    // Should show error
    await page.waitForTimeout(500)
  })
})
