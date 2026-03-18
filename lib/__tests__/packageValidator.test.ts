import { describe, it, expect } from 'vitest'
import { validatePackageIds, isValidPackageId } from '../packageValidator'

describe('packageValidator', () => {
  describe('validatePackageIds', () => {
    const catalogIds = ['Git.Git', 'Google.Chrome', 'Microsoft.VisualStudioCode', 'Docker.DockerDesktop']

    it('should return valid IDs that exist in catalog', () => {
      const result = validatePackageIds(['Git.Git', 'Google.Chrome'], catalogIds)

      expect(result.valid).toEqual(['Git.Git', 'Google.Chrome'])
      expect(result.invalid).toEqual([])
    })

    it('should separate invalid IDs from valid ones', () => {
      const result = validatePackageIds(['Git.Git', 'Fake.Package', 'Google.Chrome'], catalogIds)

      expect(result.valid).toEqual(['Git.Git', 'Google.Chrome'])
      expect(result.invalid).toEqual(['Fake.Package'])
    })

    it('should enforce MAX_IDS limit (50)', () => {
      const ids = Array.from({ length: 100 }, (_, i) => catalogIds[i % catalogIds.length])
      const result = validatePackageIds(ids, catalogIds)

      // Should only process first 50
      expect(result.valid.length + result.invalid.length).toBeLessThanOrEqual(50)
    })

    it('should handle empty array', () => {
      const result = validatePackageIds([], catalogIds)

      expect(result.valid).toEqual([])
      expect(result.invalid).toEqual([])
    })

    it('should enforce MAX_ID_LENGTH (100)', () => {
      const longId = 'A'.repeat(101)
      const result = validatePackageIds([longId], catalogIds)

      expect(result.invalid).toContain(longId)
    })

    it('should accept ID at 100 characters with valid format', () => {
      // Winget IDs must have format: Publisher.App (with dot)
      // Create valid ID at exactly 100 characters: 49 + dot + 50 = 100
      const publisherPart = 'A'.repeat(49)
      const appPart = 'B'.repeat(50)
      const maxLengthId = `${publisherPart}.${appPart}`
      const catalog = [maxLengthId]
      const result = validatePackageIds([maxLengthId], catalog)

      expect(result.valid).toContain(maxLengthId)
    })

    it('should reject IDs longer than 100 characters', () => {
      const publisherPart = 'A'.repeat(50)
      const appPart = 'B'.repeat(51)
      const tooLongId = `${publisherPart}.${appPart}` // 102 characters
      const result = validatePackageIds([tooLongId], [])

      expect(result.invalid).toContain(tooLongId)
    })

    it('should remove duplicate IDs', () => {
      const result = validatePackageIds(['Git.Git', 'Git.Git', 'Google.Chrome', 'Git.Git'], catalogIds)

      expect(result.valid).toEqual(['Git.Git', 'Google.Chrome'])
    })

    it('should validate ID format (Publisher.App pattern)', () => {
      const validFormats = [
        'A.B',
        'Publisher1.App2',
        'my-app.my-app',
        'my_app.my_app',
        'My.Pub.App',
      ]

      const catalog = validFormats
      const result = validatePackageIds(validFormats, catalog)

      expect(result.valid).toEqual(validFormats)
    })

    it('should reject invalid ID formats', () => {
      // After sanitization, these should fail regex or not be in catalog
      const invalidFormats = [
        'single',              // No dot
        '.starts.with.dot',    // Starts with dot
        'ends.with.dot.',      // Ends with dot
        'has@symbol.Bad',      // @ gets sanitized to 'hassymbol.Bad' but not in catalog
      ]

      const catalog: string[] = []
      const result = validatePackageIds(invalidFormats, catalog)

      // All should be invalid
      expect(result.valid).toEqual([])
      expect(result.invalid.length).toBe(invalidFormats.length)
    })

    it('should handle IDs with special characters (rejected if not in catalog)', () => {
      const result = validatePackageIds(['Git$Git'], catalogIds)

      // "Git$Git" sanitizes to "GitGit" which fails regex (no dot)
      // Original id goes to invalid (line 17 pushes original for regex failure)
      expect(result.invalid).toEqual(['Git$Git'])
    })

    it('should handle SQL injection attempts safely', () => {
      const sqlInjection = "'; DROP TABLE packages; --"
      const result = validatePackageIds([sqlInjection], catalogIds)

      // After sanitization, won't be in catalog
      expect(result.invalid.length).toBeGreaterThan(0)
    })

    it('should handle XSS attempts safely', () => {
      const xss = '<script>alert("xss")</script>'
      const result = validatePackageIds([xss], catalogIds)

      // After sanitization, won't be in catalog
      expect(result.invalid.length).toBeGreaterThan(0)
    })

    it('should reject unicode characters to prevent homograph attacks', () => {
      // SECURITY FIX: "Git中文.Git" should be REJECTED, not sanitized to "Git.Git"
      // This prevents Unicode homograph attacks where attackers use lookalike characters
      const unicode = 'Git中文.Git'
      const result = validatePackageIds([unicode], catalogIds)

      // Non-ASCII chars should cause rejection, not sanitization
      expect(result.valid).toEqual([])
      expect(result.invalid).toEqual([unicode])
    })

    it('should reject multiple unicode homograph attack vectors', () => {
      // Test various Unicode homograph attack patterns
      const attacks = [
        'GіtHub.Git',           // Cyrillic 'і' looks like 'i'
        'РауРа1.Parser',       // Cyrillic letters
        'Microsoft.VіsualStudio', // Mixed Cyrillic
        'Ģit.Ģit',             // Latin extended characters
        'Git中文.Git',          // Chinese characters
        'Git.Git',             // Emoji
      ]

      const catalog = ['GitHub.Git', 'PayPal.Parser', 'Microsoft.VisualStudioCode']
      const result = validatePackageIds(attacks, catalog)

      // All should be rejected due to non-ASCII characters
      expect(result.valid).toEqual([])
      expect(result.invalid.length).toBe(attacks.length)
    })

    it('should accept pure ASCII IDs only', () => {
      // Ensure valid ASCII IDs still work
      const asciiIds = ['Git.Git', 'GitHub.Cli', 'Microsoft.VisualStudioCode']
      const catalog = asciiIds
      const result = validatePackageIds(asciiIds, catalog)

      expect(result.valid).toEqual(asciiIds)
      expect(result.invalid).toEqual([])
    })

    it('should handle null bytes safely', () => {
      const nullByte = 'Git\x00.Git'
      const result = validatePackageIds([nullByte], catalogIds)

      // Should not crash, will be invalid or valid
      expect(result.valid.length + result.invalid.length).toBe(1)
    })

    it('should handle very long input gracefully', () => {
      const veryLong = 'A'.repeat(10000)
      const result = validatePackageIds([veryLong], catalogIds)

      // Should not crash, should be invalid (too long)
      expect(result.invalid).toContain(veryLong)
    })
  })

  describe('isValidPackageId', () => {
    const catalogIds = ['Git.Git', 'Google.Chrome']

    it('should return true for valid package ID', () => {
      expect(isValidPackageId('Git.Git', catalogIds)).toBe(true)
    })

    it('should return false for invalid package ID', () => {
      expect(isValidPackageId('Fake.Package', catalogIds)).toBe(false)
    })

    it('should return false for malformed ID', () => {
      expect(isValidPackageId('invalid-format', catalogIds)).toBe(false)
    })

    it('should return false for empty string', () => {
      expect(isValidPackageId('', catalogIds)).toBe(false)
    })
  })

  describe('Security - Input Sanitization Behavior', () => {
    it('should sanitize IDs by removing non-allowed characters', () => {
      // Use valid Publisher.App format
      const result = validatePackageIds(['Git$Git.Git'], ['GitGit.Git'])

      // Special chars removed, matches catalog
      expect(result.valid).toEqual(['GitGit.Git'])
    })

    it('should handle multiple special characters in ID', () => {
      const result = validatePackageIds(['Git!@#$%Git.Git'], ['GitGit.Git'])

      // All special chars removed
      expect(result.valid).toEqual(['GitGit.Git'])
    })

    it('should preserve valid characters during sanitization', () => {
      const result = validatePackageIds(
        ['Publisher1.App-2_3.Test4'],
        ['Publisher1.App-2_3.Test4']
      )

      expect(result.valid).toEqual(['Publisher1.App-2_3.Test4'])
    })
  })

  describe('Edge Cases', () => {
    it('should handle all valid IDs', () => {
      const result = validatePackageIds(['Git.Git', 'Google.Chrome'], ['Git.Git', 'Google.Chrome'])

      expect(result.valid).toEqual(['Git.Git', 'Google.Chrome'])
      expect(result.invalid).toEqual([])
    })

    it('should handle all invalid IDs', () => {
      const result = validatePackageIds(['Fake1', 'Fake2'], ['Git.Git'])

      expect(result.valid).toEqual([])
      expect(result.invalid).toEqual(['Fake1', 'Fake2'])
    })

    it('should handle mix at boundary limit', () => {
      const ids = Array.from({ length: 50 }, (_, i) => `P${i}.A${i}`)
      const catalog = ids
      const result = validatePackageIds(ids, catalog)

      expect(result.valid.length).toBe(50)
    })

    it('should handle mix exceeding boundary limit', () => {
      const ids = Array.from({ length: 51 }, (_, i) => `P${i}.A${i}`)
      const catalog = ids
      const result = validatePackageIds(ids, catalog)

      // Should truncate at 50
      expect(result.valid.length).toBe(50)
      expect(result.valid.length + result.invalid.length).toBe(50)
    })
  })
})
