import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { PackageCard } from '../PackageCard'
import type { Package } from '@/types/package'
import { useSelectionStore } from '@/store/selection'

// Mock the selection store
vi.mock('@/store/selection')

describe('PackageCard', () => {
  const mockPackage: Package = {
    id: 'Git.Git',
    name: 'Git',
    description: 'Distributed version control system',
    icon: '🔧',
    category: 'Development',
    tags: ['git', 'version-control', 'vcs'],
    popular: true,
  }

  const mockIsSelected = vi.fn()
  const mockTogglePackage = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useSelectionStore).mockReturnValue({
      isSelected: mockIsSelected,
      togglePackage: mockTogglePackage,
      selectedIds: new Set<string>(),
      count: 0,
      clearAll: vi.fn(),
      loadPreset: vi.fn(),
    })
  })

  describe('rendering', () => {
    it('should render package icon', () => {
      mockIsSelected.mockReturnValue(false)
      render(<PackageCard package={mockPackage} />)

      expect(screen.getByText('🔧')).toBeInTheDocument()
    })

    it('should render package name', () => {
      mockIsSelected.mockReturnValue(false)
      render(<PackageCard package={mockPackage} />)

      expect(screen.getByText('Git')).toBeInTheDocument()
    })

    it('should render package description', () => {
      mockIsSelected.mockReturnValue(false)
      render(<PackageCard package={mockPackage} />)

      expect(screen.getByText('Distributed version control system')).toBeInTheDocument()
    })

    it('should render package category badge', () => {
      mockIsSelected.mockReturnValue(false)
      render(<PackageCard package={mockPackage} />)

      expect(screen.getByText('Development')).toBeInTheDocument()
    })

    it('should render popular badge for popular packages', () => {
      mockIsSelected.mockReturnValue(false)
      render(<PackageCard package={mockPackage} />)

      expect(screen.getByText('Popular')).toBeInTheDocument()
      expect(screen.getByText('★')).toBeInTheDocument()
    })

    it('should not render popular badge for non-popular packages', () => {
      mockIsSelected.mockReturnValue(false)
      const nonPopularPackage = { ...mockPackage, popular: false }
      render(<PackageCard package={nonPopularPackage} />)

      expect(screen.queryByText('Popular')).not.toBeInTheDocument()
    })

    it('should render checkmark when selected', () => {
      mockIsSelected.mockReturnValue(true)
      render(<PackageCard package={mockPackage} />)

      // Check for the Check icon (it should be present when selected)
      const checkIcon = document.querySelector('.lucide-check')
      expect(checkIcon).toBeInTheDocument()
    })

    it('should not render checkmark when not selected', () => {
      mockIsSelected.mockReturnValue(false)
      render(<PackageCard package={mockPackage} />)

      const checkIcon = document.querySelector('.lucide-check')
      expect(checkIcon).not.toBeInTheDocument()
    })
  })

  describe('interaction', () => {
    it('should call togglePackage when clicked', () => {
      mockIsSelected.mockReturnValue(false)
      render(<PackageCard package={mockPackage} />)

      const card = screen.getByRole('button')
      fireEvent.click(card)

      expect(mockTogglePackage).toHaveBeenCalledWith('Git.Git')
      expect(mockTogglePackage).toHaveBeenCalledTimes(1)
    })

    it('should call isSelected to check selection state', () => {
      mockIsSelected.mockReturnValue(false)
      render(<PackageCard package={mockPackage} />)

      expect(mockIsSelected).toHaveBeenCalledWith('Git.Git')
    })
  })

  describe('accessibility', () => {
    it('should be a button element', () => {
      mockIsSelected.mockReturnValue(false)
      render(<PackageCard package={mockPackage} />)

      const card = screen.getByRole('button')
      expect(card).toBeInTheDocument()
    })

    it('should have accessible name from package name', () => {
      mockIsSelected.mockReturnValue(false)
      render(<PackageCard package={mockPackage} />)

      const card = screen.getByRole('button')
      expect(card).toHaveAccessibleDescription()
    })

    it('should be keyboard accessible', () => {
      mockIsSelected.mockReturnValue(false)
      render(<PackageCard package={mockPackage} />)

      const card = screen.getByRole('button')

      // Test keyboard interaction
      fireEvent.keyDown(card, { key: 'Enter' })
      expect(mockTogglePackage).toHaveBeenCalled()

      fireEvent.keyDown(card, { key: ' ' })
      expect(mockTogglePackage).toHaveBeenCalledTimes(2)
    })
  })

  describe('styling', () => {
    it('should apply selected styling when package is selected', () => {
      mockIsSelected.mockReturnValue(true)
      render(<PackageCard package={mockPackage} />)

      const card = screen.getByRole('button')
      expect(card.className).toContain('border-cyan-500')
      expect(card.className).toContain('bg-cyan-950/20')
    })

    it('should apply default styling when package is not selected', () => {
      mockIsSelected.mockReturnValue(false)
      render(<PackageCard package={mockPackage} />)

      const card = screen.getByRole('button')
      expect(card.className).toContain('border-gray-800')
      expect(card.className).toContain('bg-gray-900')
    })
  })

  describe('edge cases', () => {
    it('should handle long package names', () => {
      mockIsSelected.mockReturnValue(false)
      const longNamePackage = {
        ...mockPackage,
        name: 'Very Long Package Name That Goes On And On',
      }
      render(<PackageCard package={longNamePackage} />)

      expect(screen.getByText(/Very Long Package Name/)).toBeInTheDocument()
    })

    it('should handle long descriptions', () => {
      mockIsSelected.mockReturnValue(false)
      const longDescPackage = {
        ...mockPackage,
        description: 'This is a very long description that should be truncated with line-clamp-2 class to prevent overflow.',
      }
      render(<PackageCard package={longDescPackage} />)

      expect(screen.getByText(/This is a very long description/)).toBeInTheDocument()
    })

    it('should handle special characters in package name', () => {
      mockIsSelected.mockReturnValue(false)
      const specialCharPackage = {
        ...mockPackage,
        name: 'C++ (MinGW-w64)',
      }
      render(<PackageCard package={specialCharPackage} />)

      expect(screen.getByText('C++ (MinGW-w64)')).toBeInTheDocument()
    })

    it('should handle unicode icons', () => {
      mockIsSelected.mockReturnValue(false)
      const unicodePackage = {
        ...mockPackage,
        icon: '🚀',
      }
      render(<PackageCard package={unicodePackage} />)

      expect(screen.getByText('🚀')).toBeInTheDocument()
    })

    it('should handle empty category', () => {
      mockIsSelected.mockReturnValue(false)
      const noCategoryPackage = {
        ...mockPackage,
        category: '',
      }
      render(<PackageCard package={noCategoryPackage} />)

      const categoryBadge = screen.getByText('')
      expect(categoryBadge).toBeInTheDocument()
    })
  })

  describe('rapid interactions', () => {
    it('should handle rapid clicks without error', () => {
      mockIsSelected.mockReturnValue(false)
      render(<PackageCard package={mockPackage} />)

      const card = screen.getByRole('button')

      // Simulate rapid clicking
      for (let i = 0; i < 10; i++) {
        fireEvent.click(card)
      }

      expect(mockTogglePackage).toHaveBeenCalledTimes(10)
    })
  })
})
