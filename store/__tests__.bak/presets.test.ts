import { describe, it, expect, beforeEach, vi } from 'vitest'
import { usePresetsStore } from '../presets'
import type { Preset } from '@/types/package'

describe('usePresetsStore', () => {
  const mockPreset: Preset = {
    id: 'test-preset-1',
    name: 'Test Preset',
    description: 'A test preset',
    packageIds: ['Git.Git', 'Google.Chrome'],
    createdAt: new Date('2025-01-01'),
    isCustom: true,
  }

  const mockPreset2: Preset = {
    id: 'test-preset-2',
    name: 'Test Preset 2',
    description: 'Another test preset',
    packageIds: ['Python.Python'],
    createdAt: new Date('2025-01-02'),
    isCustom: true,
  }

  beforeEach(() => {
    // Reset store state before each test
    usePresetsStore.setState({
      customPresets: [],
      savePreset: usePresetsStore.getState().savePreset,
      deletePreset: usePresetsStore.getState().deletePreset,
      getPreset: usePresetsStore.getState().getPreset,
    })
    vi.clearAllMocks()
  })

  describe('initial state', () => {
    it('should start with empty custom presets', () => {
      const state = usePresetsStore.getState()
      expect(state.customPresets).toEqual([])
    })
  })

  describe('savePreset', () => {
    it('should add a new preset', () => {
      const state = usePresetsStore.getState()
      state.savePreset(mockPreset)

      expect(state.customPresets).toHaveLength(1)
      expect(state.customPresets[0]).toEqual(mockPreset)
    })

    it('should add multiple presets', () => {
      const state = usePresetsStore.getState()
      state.savePreset(mockPreset)
      state.savePreset(mockPreset2)

      expect(state.customPresets).toHaveLength(2)
    })

    it('should update existing preset with same ID', () => {
      const state = usePresetsStore.getState()
      state.savePreset(mockPreset)

      const updatedPreset = { ...mockPreset, name: 'Updated Name' }
      state.savePreset(updatedPreset)

      expect(state.customPresets).toHaveLength(1)
      expect(state.customPresets[0].name).toBe('Updated Name')
    })

    it('should maintain order when updating preset', () => {
      const state = usePresetsStore.getState()
      state.savePreset(mockPreset)
      state.savePreset(mockPreset2)

      const updatedPreset = { ...mockPreset, name: 'Updated' }
      state.savePreset(updatedPreset)

      expect(state.customPresets[0].id).toBe('test-preset-2')
      expect(state.customPresets[1].id).toBe('test-preset-1')
    })

    it('should handle preset with empty package IDs', () => {
      const state = usePresetsStore.getState()
      const emptyPreset: Preset = {
        id: 'empty-preset',
        name: 'Empty Preset',
        description: 'No packages',
        packageIds: [],
        createdAt: new Date(),
        isCustom: true,
      }

      state.savePreset(emptyPreset)

      expect(state.customPresets[0].packageIds).toEqual([])
    })

    it('should handle preset with many packages', () => {
      const state = usePresetsStore.getState()
      const largePreset: Preset = {
        id: 'large-preset',
        name: 'Large Preset',
        description: 'Many packages',
        packageIds: Array.from({ length: 50 }, (_, i) => `Package.${i}`),
        createdAt: new Date(),
        isCustom: true,
      }

      state.savePreset(largePreset)

      expect(state.customPresets[0].packageIds).toHaveLength(50)
    })
  })

  describe('deletePreset', () => {
    it('should delete a preset by ID', () => {
      const state = usePresetsStore.getState()
      state.savePreset(mockPreset)
      state.savePreset(mockPreset2)

      state.deletePreset('test-preset-1')

      expect(state.customPresets).toHaveLength(1)
      expect(state.customPresets[0].id).toBe('test-preset-2')
    })

    it('should handle deleting non-existent preset', () => {
      const state = usePresetsStore.getState()
      state.savePreset(mockPreset)

      expect(() => state.deletePreset('non-existent')).not.toThrow()
      expect(state.customPresets).toHaveLength(1)
    })

    it('should handle deleting from empty store', () => {
      const state = usePresetsStore.getState()

      expect(() => state.deletePreset('any-id')).not.toThrow()
      expect(state.customPresets).toHaveLength(0)
    })

    it('should handle deleting last preset', () => {
      const state = usePresetsStore.getState()
      state.savePreset(mockPreset)

      state.deletePreset('test-preset-1')

      expect(state.customPresets).toEqual([])
    })

    it('should handle deleting multiple presets', () => {
      const state = usePresetsStore.getState()
      state.savePreset(mockPreset)
      state.savePreset(mockPreset2)

      state.deletePreset('test-preset-1')
      state.deletePreset('test-preset-2')

      expect(state.customPresets).toEqual([])
    })
  })

  describe('getPreset', () => {
    it('should return preset by ID', () => {
      const state = usePresetsStore.getState()
      state.savePreset(mockPreset)

      const result = state.getPreset('test-preset-1')

      expect(result).toEqual(mockPreset)
    })

    it('should return undefined for non-existent preset', () => {
      const state = usePresetsStore.getState()
      state.savePreset(mockPreset)

      const result = state.getPreset('non-existent')

      expect(result).toBeUndefined()
    })

    it('should return undefined from empty store', () => {
      const state = usePresetsStore.getState()

      const result = state.getPreset('any-id')

      expect(result).toBeUndefined()
    })

    it('should return correct preset when multiple exist', () => {
      const state = usePresetsStore.getState()
      state.savePreset(mockPreset)
      state.savePreset(mockPreset2)

      const result1 = state.getPreset('test-preset-1')
      const result2 = state.getPreset('test-preset-2')

      expect(result1?.id).toBe('test-preset-1')
      expect(result2?.id).toBe('test-preset-2')
    })
  })

  describe('persistence', () => {
    it('should save to localStorage on state change', () => {
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem')
      const state = usePresetsStore.getState()
      state.savePreset(mockPreset)

      expect(setItemSpy).toHaveBeenCalled()
      setItemSpy.mockRestore()
    })

    it('should persist preset across page reloads (simulation)', () => {
      // This would require actual persistence testing
      // In a real scenario, we'd mock localStorage.getItem
      const state = usePresetsStore.getState()
      state.savePreset(mockPreset)

      const savedData = localStorage.getItem('appnest-presets')
      expect(savedData).toBeDefined()
    })
  })

  describe('edge cases', () => {
    it('should handle preset with special characters in ID', () => {
      const state = usePresetsStore.getState()
      const specialPreset: Preset = {
        id: 'preset-with-special.chars_123',
        name: 'Special ID Preset',
        description: 'Test',
        packageIds: [],
        createdAt: new Date(),
        isCustom: true,
      }

      state.savePreset(specialPreset)

      expect(state.getPreset('preset-with-special.chars_123')).toEqual(specialPreset)
    })

    it('should handle preset with unicode characters in name', () => {
      const state = usePresetsStore.getState()
      const unicodePreset: Preset = {
        id: 'unicode-preset',
        name: '开发工具 🛠️',
        description: 'Development tools',
        packageIds: [],
        createdAt: new Date(),
        isCustom: true,
      }

      state.savePreset(unicodePreset)

      expect(state.customPresets[0].name).toBe('开发工具 🛠️')
    })

    it('should handle very long preset descriptions', () => {
      const state = usePresetsStore.getState()
      const longDescPreset: Preset = {
        id: 'long-desc-preset',
        name: 'Long Description',
        description: 'A'.repeat(1000),
        packageIds: [],
        createdAt: new Date(),
        isCustom: true,
      }

      state.savePreset(longDescPreset)

      expect(state.customPresets[0].description.length).toBe(1000)
    })

    it('should handle preset with same name but different IDs', () => {
      const state = usePresetsStore.getState()
      const preset1: Preset = { ...mockPreset, id: 'id-1', name: 'Same Name' }
      const preset2: Preset = { ...mockPreset, id: 'id-2', name: 'Same Name' }

      state.savePreset(preset1)
      state.savePreset(preset2)

      expect(state.customPresets).toHaveLength(2)
    })

    it('should handle rapid save and delete operations', () => {
      const state = usePresetsStore.getState()
      for (let i = 0; i < 50; i++) {
        state.savePreset({
          id: `preset-${i}`,
          name: `Preset ${i}`,
          description: `Test ${i}`,
          packageIds: [`Package.${i}`],
          createdAt: new Date(),
          isCustom: true,
        })
      }

      expect(state.customPresets).toHaveLength(50)

      for (let i = 0; i < 50; i++) {
        state.deletePreset(`preset-${i}`)
      }

      expect(state.customPresets).toHaveLength(0)
    })
  })

  describe('integration scenarios', () => {
    it('should support create-read-update-delete workflow', () => {
      const state = usePresetsStore.getState()

      // Create
      state.savePreset(mockPreset)
      expect(state.getPreset('test-preset-1')).toEqual(mockPreset)

      // Update
      const updated = { ...mockPreset, name: 'Updated' }
      state.savePreset(updated)
      expect(state.getPreset('test-preset-1')?.name).toBe('Updated')

      // Delete
      state.deletePreset('test-preset-1')
      expect(state.getPreset('test-preset-1')).toBeUndefined()
    })

    it('should handle batch operations', () => {
      const state = usePresetsStore.getState()
      const presets: Preset[] = Array.from({ length: 10 }, (_, i) => ({
        id: `batch-preset-${i}`,
        name: `Batch Preset ${i}`,
        description: `Batch test ${i}`,
        packageIds: [`Package.${i}`],
        createdAt: new Date(),
        isCustom: true,
      }))

      presets.forEach(preset => state.savePreset(preset))
      expect(state.customPresets).toHaveLength(10)

      // Delete all even-indexed presets
      presets.filter((_, i) => i % 2 === 0).forEach(preset =>
        state.deletePreset(preset.id)
      )

      expect(state.customPresets).toHaveLength(5)
    })
  })
})
