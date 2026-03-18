import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useSelectionStore } from '../selection'

describe('useSelectionStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useSelectionStore.setState({
      selectedIds: new Set<string>(),
      count: 0,
      isSelected: (id: string) => false,
      togglePackage: useSelectionStore.getState().togglePackage,
      clearAll: useSelectionStore.getState().clearAll,
      loadPreset: useSelectionStore.getState().loadPreset,
    })
    // Clear localStorage mock
    vi.clearAllMocks()
  })

  describe('initial state', () => {
    it('should start with empty selection', () => {
      const state = useSelectionStore.getState()
      expect(state.selectedIds).toEqual(new Set<string>())
      expect(state.count).toBe(0)
    })
  })

  describe('togglePackage', () => {
    it('should add a package when not selected', () => {
      const state = useSelectionStore.getState()
      state.togglePackage('Git.Git')

      const newState = useSelectionStore.getState()
      expect(newState.selectedIds.has('Git.Git')).toBe(true)
      expect(newState.count).toBe(1)
    })

    it('should remove a package when already selected', () => {
      const state = useSelectionStore.getState()
      state.togglePackage('Git.Git')
      state.togglePackage('Git.Git')

      const finalState = useSelectionStore.getState()
      expect(finalState.selectedIds.has('Git.Git')).toBe(false)
      expect(finalState.count).toBe(0)
    })

    it('should handle multiple packages correctly', () => {
      const state = useSelectionStore.getState()
      state.togglePackage('Git.Git')
      state.togglePackage('Google.Chrome')
      state.togglePackage('Microsoft.VisualStudioCode')

      expect(state.count).toBe(3)
    })

    it('should toggle one package without affecting others', () => {
      const state = useSelectionStore.getState()
      state.togglePackage('Git.Git')
      state.togglePackage('Google.Chrome')
      state.togglePackage('Git.Git') // Remove first

      expect(state.selectedIds.has('Git.Git')).toBe(false)
      expect(state.selectedIds.has('Google.Chrome')).toBe(true)
      expect(state.count).toBe(1)
    })

    it('should handle toggling the same package multiple times', () => {
      const state = useSelectionStore.getState()
      state.togglePackage('Git.Git')
      state.togglePackage('Git.Git')
      state.togglePackage('Git.Git')
      state.togglePackage('Git.Git')

      // Even number of toggles = not selected
      expect(state.selectedIds.has('Git.Git')).toBe(false)
    })

    it('should handle packages with dots and special characters in ID', () => {
      const state = useSelectionStore.getState()
      state.togglePackage('Microsoft.VisualStudioCode')
      state.togglePackage('Notepad++.Notepad++')

      expect(state.selectedIds.has('Microsoft.VisualStudioCode')).toBe(true)
      expect(state.selectedIds.has('Notepad++.Notepad++')).toBe(true)
    })
  })

  describe('clearAll', () => {
    it('should clear all selected packages', () => {
      const state = useSelectionStore.getState()
      state.togglePackage('Git.Git')
      state.togglePackage('Google.Chrome')
      state.clearAll()

      const finalState = useSelectionStore.getState()
      expect(finalState.selectedIds).toEqual(new Set<string>())
      expect(finalState.count).toBe(0)
    })

    it('should handle clearing when already empty', () => {
      const state = useSelectionStore.getState()
      state.clearAll()
      state.clearAll() // Clear again

      expect(state.count).toBe(0)
    })
  })

  describe('loadPreset', () => {
    it('should load a preset with package IDs', () => {
      const presetIds = ['Git.Git', 'Google.Chrome', 'Microsoft.VisualStudioCode']
      const state = useSelectionStore.getState()
      state.loadPreset(presetIds)

      const newState = useSelectionStore.getState()
      expect(newState.selectedIds).toEqual(new Set(presetIds))
      expect(newState.count).toBe(3)
    })

    it('should replace existing selection with preset', () => {
      const state = useSelectionStore.getState()
      state.togglePackage('Python.Python')
      state.loadPreset(['Git.Git', 'Google.Chrome'])

      const newState = useSelectionStore.getState()
      expect(newState.selectedIds.has('Python.Python')).toBe(false)
      expect(newState.selectedIds.has('Git.Git')).toBe(true)
      expect(newState.selectedIds.has('Google.Chrome')).toBe(true)
      expect(newState.count).toBe(2)
    })

    it('should handle empty preset array', () => {
      const state = useSelectionStore.getState()
      state.togglePackage('Git.Git')
      state.loadPreset([])

      const newState = useSelectionStore.getState()
      expect(newState.selectedIds).toEqual(new Set<string>())
      expect(newState.count).toBe(0)
    })

    it('should handle preset with duplicate IDs', () => {
      const state = useSelectionStore.getState()
      state.loadPreset(['Git.Git', 'Git.Git', 'Google.Chrome', 'Git.Git'])

      // Set should deduplicate
      expect(state.selectedIds.has('Git.Git')).toBe(true)
      expect(state.selectedIds.has('Google.Chrome')).toBe(true)
      expect(state.count).toBe(2)
    })

    it('should handle preset with single package', () => {
      const state = useSelectionStore.getState()
      state.loadPreset(['Git.Git'])

      expect(state.count).toBe(1)
      expect(state.selectedIds.has('Git.Git')).toBe(true)
    })

    it('should handle large preset efficiently', () => {
      const largePreset = Array.from({ length: 100 }, (_, i) => `Package.${i}`)
      const state = useSelectionStore.getState()
      state.loadPreset(largePreset)

      expect(state.count).toBe(100)
    })
  })

  describe('isSelected', () => {
    it('should return true for selected package', () => {
      const state = useSelectionStore.getState()
      state.togglePackage('Git.Git')

      expect(state.isSelected('Git.Git')).toBe(true)
    })

    it('should return false for non-selected package', () => {
      const state = useSelectionStore.getState()
      expect(state.isSelected('Git.Git')).toBe(false)
    })

    it('should return false after deselecting', () => {
      const state = useSelectionStore.getState()
      state.togglePackage('Git.Git')
      state.togglePackage('Git.Git')

      expect(state.isSelected('Git.Git')).toBe(false)
    })
  })

  describe('persistence', () => {
    it('should save to localStorage on state change', () => {
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem')
      const state = useSelectionStore.getState()
      state.togglePackage('Git.Git')

      expect(setItemSpy).toHaveBeenCalled()
      setItemSpy.mockRestore()
    })

    it('should handle localStorage errors gracefully', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('localStorage full')
      })

      const state = useSelectionStore.getState()
      expect(() => state.togglePackage('Git.Git')).not.toThrow()

      consoleErrorSpy.mockRestore()
    })
  })

  describe('count property', () => {
    it('should accurately reflect number of selected packages', () => {
      const state = useSelectionStore.getState()

      expect(state.count).toBe(0)

      state.togglePackage('Git.Git')
      expect(state.count).toBe(1)

      state.togglePackage('Google.Chrome')
      expect(state.count).toBe(2)

      state.togglePackage('Git.Git')
      expect(state.count).toBe(1)
    })

    it('should update correctly after loadPreset', () => {
      const state = useSelectionStore.getState()
      state.loadPreset(['Git.Git', 'Google.Chrome', 'Firefox'])
      expect(state.count).toBe(3)
    })

    it('should update correctly after clearAll', () => {
      const state = useSelectionStore.getState()
      state.loadPreset(['Git.Git', 'Google.Chrome'])
      expect(state.count).toBe(2)

      state.clearAll()
      expect(state.count).toBe(0)
    })
  })

  describe('edge cases', () => {
    it('should handle empty string as package ID', () => {
      const state = useSelectionStore.getState()
      expect(() => state.togglePackage('')).not.toThrow()
    })

    it('should handle special characters in package IDs', () => {
      const state = useSelectionStore.getState()
      expect(() => state.togglePackage('Package_With-Underscores.Dots')).not.toThrow()
    })

    it('should handle rapid toggle operations', () => {
      const state = useSelectionStore.getState()
      for (let i = 0; i < 100; i++) {
        state.togglePackage(`Package.${i}`)
      }
      expect(state.count).toBe(100)
    })
  })
})
