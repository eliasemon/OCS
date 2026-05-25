import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { PresetManager } from '../PresetManager'
import { useSelectionStore } from '@/store/selection'
import { usePresetsStore } from '@/store/presets'
import { BUILT_IN_PRESETS } from '@/lib/presets'
import { toast } from 'sonner'

// Mock dependencies
vi.mock('@/store/selection')
vi.mock('@/store/presets')
vi.mock('@/lib/presets', () => ({
  BUILT_IN_PRESETS: [
    { id: 'dev-essentials', name: 'Development Essentials', packageIds: ['Git.Git', 'VSCode'], icon: '💻' },
    { id: 'web-dev', name: 'Web Development', packageIds: ['Node.js', 'Chrome'], icon: '🌐' },
  ],
}))
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

describe('PresetManager', () => {
  const mockLoadPreset = vi.fn()
  const mockCount = 3
  const mockSelectedIds = new Set(['Git.Git', 'Google.Chrome', 'VSCode'])

  const mockSavePreset = vi.fn()
  const mockCustomPresets = [
    { id: 'custom-1', name: 'My Setup', packageIds: ['Git.Git'], icon: '⭐' },
  ]

  beforeEach(() => {
    vi.clearAllMocks()

    vi.mocked(useSelectionStore).mockReturnValue({
      selectedIds: mockSelectedIds,
      count: mockCount,
      loadPreset: mockLoadPreset,
      isSelected: vi.fn(),
      togglePackage: vi.fn(),
      clearAll: vi.fn(),
    })

    vi.mocked(usePresetsStore).mockReturnValue({
      customPresets: mockCustomPresets,
      savePreset: mockSavePreset,
      deletePreset: vi.fn(),
      getPreset: vi.fn(),
    })

    // Mock getSelectedIds
    vi.spyOn(useSelectionStore, 'getState').mockReturnValue({
      selectedIds: mockSelectedIds,
      count: mockCount,
      loadPreset: mockLoadPreset,
      isSelected: vi.fn(),
      togglePackage: vi.fn(),
      clearAll: vi.fn(),
    })
  })

  describe('rendering', () => {
    it('should render preset section header', () => {
      render(<PresetManager />)

      expect(screen.getByText('Presets')).toBeInTheDocument()
    })

    it('should render preset selector', () => {
      render(<PresetManager />)

      expect(screen.getByText('Load a preset...')).toBeInTheDocument()
    })

    it('should render save button', () => {
      render(<PresetManager />)

      expect(screen.getByText(/Save/)).toBeInTheDocument()
    })

    it('should display built-in presets', async () => {
      render(<PresetManager />)

      // Open the select
      const selectTrigger = screen.getByText('Load a preset...')
      fireEvent.click(selectTrigger)

      await waitFor(() => {
        expect(screen.getByText('Development Essentials')).toBeInTheDocument()
        expect(screen.getByText('Web Development')).toBeInTheDocument()
      })
    })

    it('should display custom presets', async () => {
      render(<PresetManager />)

      const selectTrigger = screen.getByText('Load a preset...')
      fireEvent.click(selectTrigger)

      await waitFor(() => {
        expect(screen.getByText('My Setup')).toBeInTheDocument()
      })
    })
  })

  describe('loading presets', () => {
    it('should load preset when selected', async () => {
      render(<PresetManager />)

      const selectTrigger = screen.getByText('Load a preset...')
      fireEvent.click(selectTrigger)

      await waitFor(() => {
        const devEssentials = screen.getByText('Development Essentials')
        fireEvent.click(devEssentials)
      })

      expect(mockLoadPreset).toHaveBeenCalledWith(['Git.Git', 'VSCode'])
      expect(toast.success).toHaveBeenCalledWith('Loaded "Development Essentials" with 2 apps')
    })
  })

  describe('saving presets', () => {
    it('should show input field when save button clicked', () => {
      render(<PresetManager />)

      const saveButton = screen.getByText(/Save/)
      fireEvent.click(saveButton)

      expect(screen.getByPlaceholderText('Preset name...')).toBeInTheDocument()
    })

    it('should save preset with valid name', async () => {
      render(<PresetManager />)

      // Enter save mode
      const saveButton = screen.getByText(/Save/)
      fireEvent.click(saveButton)

      // Type name
      const input = screen.getByPlaceholderText('Preset name...')
      fireEvent.change(input, { target: { value: 'My Custom Preset' } })

      // Click save button
      const saveIcon = document.querySelector('.lucide-save')?.parentElement
      fireEvent.click(saveIcon!)

      await waitFor(() => {
        expect(mockSavePreset).toHaveBeenCalled()
        const savedPreset = mockSavePreset.mock.calls[0][0]
        expect(savedPreset.name).toBe('My Custom Preset')
        expect(savedPreset.packageIds).toEqual(Array.from(mockSelectedIds))
      })

      expect(toast.success).toHaveBeenCalledWith('Preset saved successfully!')
    })

    it('should save preset on Enter key', async () => {
      render(<PresetManager />)

      const saveButton = screen.getByText(/Save/)
      fireEvent.click(saveButton)

      const input = screen.getByPlaceholderText('Preset name...')
      fireEvent.change(input, { target: { value: 'Test Preset' } })
      fireEvent.keyDown(input, { key: 'Enter' })

      await waitFor(() => {
        expect(mockSavePreset).toHaveBeenCalled()
      })
    })

    it('should cancel save on Escape key', () => {
      render(<PresetManager />)

      const saveButton = screen.getByText(/Save/)
      fireEvent.click(saveButton)

      const input = screen.getByPlaceholderText('Preset name...')
      fireEvent.change(input, { target: { value: 'Test' } })
      fireEvent.keyDown(input, { key: 'Escape' })

      // Input should be gone, back to button
      expect(screen.queryByPlaceholderText('Preset name...')).not.toBeInTheDocument()
      expect(screen.getByText(/Save/)).toBeInTheDocument()
    })

    it('should show error when saving with empty name', async () => {
      render(<PresetManager />)

      const saveButton = screen.getByText(/Save/)
      fireEvent.click(saveButton)

      const saveIcon = document.querySelector('.lucide-save')?.parentElement
      fireEvent.click(saveIcon!)

      expect(mockSavePreset).not.toHaveBeenCalled()
      expect(toast.error).toHaveBeenCalledWith('Please enter a preset name')
    })

    it('should show error when saving with whitespace-only name', async () => {
      render(<PresetManager />)

      const saveButton = screen.getByText(/Save/)
      fireEvent.click(saveButton)

      const input = screen.getByPlaceholderText('Preset name...')
      fireEvent.change(input, { target: { value: '   ' } })

      const saveIcon = document.querySelector('.lucide-save')?.parentElement
      fireEvent.click(saveIcon!)

      expect(mockSavePreset).not.toHaveBeenCalled()
      expect(toast.error).toHaveBeenCalledWith('Please enter a preset name')
    })

    it('should trim whitespace from preset name', async () => {
      render(<PresetManager />)

      const saveButton = screen.getByText(/Save/)
      fireEvent.click(saveButton)

      const input = screen.getByPlaceholderText('Preset name...')
      fireEvent.change(input, { target: { value: '  My Preset  ' } })

      const saveIcon = document.querySelector('.lucide-save')?.parentElement
      fireEvent.click(saveIcon!)

      await waitFor(() => {
        const savedPreset = mockSavePreset.mock.calls[0][0]
        expect(savedPreset.name).toBe('My Preset')
      })
    })

    it('should generate unique ID for each preset', async () => {
      render(<PresetManager />)

      const saveButton = screen.getByText(/Save/)
      fireEvent.click(saveButton)

      const input = screen.getByPlaceholderText('Preset name...')
      fireEvent.change(input, { target: { value: 'Test' } })

      const saveIcon = document.querySelector('.lucide-save')?.parentElement
      fireEvent.click(saveIcon!)

      await waitFor(() => {
        const savedPreset = mockSavePreset.mock.calls[0][0]
        expect(savedPreset.id).toMatch(/^custom-\d+$/)
      })
    })

    it('should include package count in description', async () => {
      render(<PresetManager />)

      const saveButton = screen.getByText(/Save/)
      fireEvent.click(saveButton)

      const input = screen.getByPlaceholderText('Preset name...')
      fireEvent.change(input, { target: { value: 'Test' } })

      const saveIcon = document.querySelector('.lucide-save')?.parentElement
      fireEvent.click(saveIcon!)

      await waitFor(() => {
        const savedPreset = mockSavePreset.mock.calls[0][0]
        expect(savedPreset.description).toBe('3 apps')
      })
    })
  })

  describe('disabled state', () => {
    it('should disable save button when no packages selected', () => {
      vi.mocked(useSelectionStore).mockReturnValue({
        selectedIds: new Set(),
        count: 0,
        loadPreset: mockLoadPreset,
        isSelected: vi.fn(),
        togglePackage: vi.fn(),
        clearAll: vi.fn(),
      })

      render(<PresetManager />)

      const saveButton = screen.getByText(/Save/)
      expect(saveButton).toBeDisabled()
    })

    it('should enable save button when packages are selected', () => {
      render(<PresetManager />)

      const saveButton = screen.getByText(/Save/)
      expect(saveButton).not.toBeDisabled()
    })
  })

  describe('accessibility', () => {
    it('should have proper labels', () => {
      render(<PresetManager />)

      expect(screen.getByText('Presets')).toBeInTheDocument()
    })

    it('should have keyboard accessible controls', () => {
      render(<PresetManager />)

      const saveButton = screen.getByText(/Save/)
      expect(saveButton).toHaveAttribute('type', 'button')
    })
  })

  describe('edge cases', () => {
    it('should handle no built-in presets', async () => {
      const module = await import('@/lib/presets')
      const original = module.BUILT_IN_PRESETS
      module.BUILT_IN_PRESETS = []

      render(<PresetManager />)

      // Should still render without errors
      expect(screen.getByText('Presets')).toBeInTheDocument()

      module.BUILT_IN_PRESETS = original
    })

    it('should handle no custom presets', () => {
      vi.mocked(usePresetsStore).mockReturnValue({
        customPresets: [],
        savePreset: mockSavePreset,
        deletePreset: vi.fn(),
        getPreset: vi.fn(),
      })

      render(<PresetManager />)

      expect(screen.getByText('Presets')).toBeInTheDocument()
    })

    it('should handle very long preset names', () => {
      vi.mocked(usePresetsStore).mockReturnValue({
        customPresets: [
          { id: '1', name: 'A'.repeat(200), packageIds: ['Git.Git'], icon: '⭐' },
        ],
        savePreset: mockSavePreset,
        deletePreset: vi.fn(),
        getPreset: vi.fn(),
      })

      render(<PresetManager />)

      const selectTrigger = screen.getByText('Load a preset...')
      fireEvent.click(selectTrigger)

      // Should render without error
      expect(screen.getByText('Presets')).toBeInTheDocument()
    })
  })
})
