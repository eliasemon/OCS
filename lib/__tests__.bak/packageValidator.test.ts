import { describe, it, expect } from 'vitest'
import { validatePackageIds, isValidPackageId } from '../packageValidator'

describe('packageValidator', () => {
  const catalogIds = [
    'Git.Git',
    'Google.Chrome',
    'Microsoft.VisualStudioCode',
    'Python.Python.3.12',
    'Mozilla.Firefox',
    'Docker.DockerDesktop',
    'Nodejs.Node.js',
    'VideoLAN.VLC',
    'Notepad++.Notepad++',
  ]

  describe('validatePackageIds', () => {
    it('should validate correct package IDs from catalog', () => {
      const result = validatePackageIds(['Git.Git', 'Google.Chrome'], catalogIds)
      expect(result.valid).toEqual(['Git.Git', 'Google.Chrome'])
      expect(result.invalid).toEqual([])
    })

    it('should reject package IDs not in catalog', () => {
      const result = validatePackageIds(['Fake.Package'], catalogIds)
      expect(result.valid).toEqual([])
      expect(result.invalid).toEqual(['Fake.Package'])
    })

    it('should reject package IDs that do not match the regex pattern', () => {
      const result = validatePackageIds(['invalid-format', 'with spaces'], catalogIds)
      expect(result.valid).toEqual([])
      expect(result.invalid).toHaveLength(2)
    })

    it('should handle empty input array', () => {
      const result = validatePackageIds([], catalogIds)
      expect(result.valid).toEqual([])
      expect(result.invalid).toEqual([])
    })

    it('should enforce MAX_IDS limit (50)', () => {
      const manyIds = Array.from({ length: 55 }, (_, i) => `Package.${i}`)
      const catalog = Array.from({ length: 100 }, (_, i) => `Package.${i}`)
      const result = validatePackageIds(manyIds, catalog)
      // Should only process first 50
      expect(result.valid.length + result.invalid.length).toBe(50)
    })

    it('should reject package IDs exceeding MAX_ID_LENGTH (100)', () => {
      const longId = 'A'.repeat(101) + '.Package'
      const result = validatePackageIds([longId], catalogIds)
      expect(result.valid).toEqual([])
      expect(result.invalid).toEqual([longId])
    })

    it('should handle valid package ID at exactly MAX_ID_LENGTH', () => {
      const id = 'A'.repeat(99) + '.B'
      const catalog = [id]
      const result = validatePackageIds([id], catalog)
      expect(result.valid).toEqual([id])
    })

    it('should sanitize package IDs before validation', () => {
      const result = validatePackageIds(['Git$Git', 'Git!Git'], catalogIds)
      // Both should be sanitized to Git.Git which is valid
      expect(result.valid).toEqual(['Git.Git'])
      expect(result.invalid).toHaveLength(0)
    })

    it('should deduplicate package IDs', () => {
      const result = validatePackageIds(
        ['Git.Git', 'Git.Git', 'Git.Git'],
        catalogIds
      )
      expect(result.valid).toEqual(['Git.Git'])
      expect(result.invalid).toEqual([])
    })

    it('should preserve order of first occurrence', () => {
      const result = validatePackageIds(
        ['Git.Git', 'Google.Chrome', 'Git.Git'],
        catalogIds
      )
      expect(result.valid).toEqual(['Git.Git', 'Google.Chrome'])
    })

    it('should handle mix of valid and invalid IDs', () => {
      const result = validatePackageIds(
        ['Git.Git', 'Fake.Package', 'Google.Chrome', 'Invalid'],
        catalogIds
      )
      expect(result.valid).toEqual(['Git.Git', 'Google.Chrome'])
      expect(result.invalid).toEqual(['Fake.Package', 'Invalid'])
    })

    it('should accept package IDs with underscores, dots, and hyphens', () => {
      const catalog = ['Test_Package.Name-123']
      const result = validatePackageIds(['Test_Package.Name-123'], catalog)
      expect(result.valid).toEqual(['Test_Package.Name-123'])
    })

    it('should reject package IDs starting with special characters', () => {
      const result = validatePackageIds(['.Git.Git', '-Git.Git', '_Git.Git'], catalogIds)
      expect(result.valid).toEqual([])
      expect(result.invalid).toHaveLength(3)
    })

    it('should reject empty strings after sanitization', () => {
      const result = validatePackageIds(['$$', '***'], catalogIds)
      expect(result.valid).toEqual([])
      expect(result.invalid).toHaveLength(2)
    })

    it('should handle package IDs with multiple dots', () => {
      const catalog = ['Company.Product.SubProduct']
      const result = validatePackageIds(['Company.Product.SubProduct'], catalog)
      expect(result.valid).toEqual(['Company.Product.SubProduct'])
    })

    it('should handle package IDs with consecutive special chars', () => {
      const catalog = ['Test..Package', 'Test--Package', 'Test__Package']
      const result = validatePackageIds(
        ['Test..Package', 'Test--Package', 'Test__Package'],
        catalog
      )
      expect(result.valid).toEqual(['Test..Package', 'Test--Package', 'Test__Package'])
    })
  })

  describe('isValidPackageId', () => {
    it('should return true for valid package ID in catalog', () => {
      expect(isValidPackageId('Git.Git', catalogIds)).toBe(true)
    })

    it('should return false for package ID not in catalog', () => {
      expect(isValidPackageId('Fake.Package', catalogIds)).toBe(false)
    })

    it('should return false for invalid format', () => {
      expect(isValidPackageId('invalid', catalogIds)).toBe(false)
    })

    it('should return false for empty string', () => {
      expect(isValidPackageId('', catalogIds)).toBe(false)
    })

    it('should handle sanitized input', () => {
      expect(isValidPackageId('Git$Git', catalogIds)).toBe(true)
    })
  })

  describe('security and edge cases', () => {
    it('should prevent injection attempts through special characters', () => {
      const maliciousInputs = [
        'Git.Git; rm -rf /',
        'Git.Git | curl malicious.com',
        'Git.Git && echo hacked',
        'Git.Git`whoami',
        'Git.Git$(whoami)',
      ]
      const result = validatePackageIds(maliciousInputs, catalogIds)
      // All should be either sanitized to valid or marked invalid
      expect(result.valid.length).toBe(0)
    })

    it('should handle unicode characters gracefully', () => {
      const result = validatePackageIds(['Git🎉.Git'], catalogIds)
      expect(result.valid).toEqual([])
    })

    it('should handle null bytes', () => {
      const result = validatePackageIds(['Git\x00.Git'], catalogIds)
      expect(result.valid).toEqual([])
    })

    it('should handle very long package names in catalog', () => {
      const longCatalogId = 'A'.repeat(90) + '.' + 'B'
      const catalog = [longCatalogId]
      const result = validatePackageIds([longCatalogId], catalog)
      expect(result.valid).toEqual([longCatalogId])
    })

    it('should reject when catalog is empty', () => {
      const result = validatePackageIds(['Git.Git'], [])
      expect(result.valid).toEqual([])
      expect(result.invalid).toEqual(['Git.Git'])
    })
  })
})
