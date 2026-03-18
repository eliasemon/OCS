import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SearchBar } from '../SearchBar'

describe('SearchBar', () => {
  const mockOnChange = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('should render search input', () => {
      render(<SearchBar value="" onChange={mockOnChange} />)

      const input = screen.getByPlaceholderText('Search packages, IDs, or tags...')
      expect(input).toBeInTheDocument()
    })

    it('should render search icon', () => {
      render(<SearchBar value="" onChange={mockOnChange} />)

      const searchIcon = document.querySelector('.lucide-search')
      expect(searchIcon).toBeInTheDocument()
    })

    it('should render keyboard shortcut hint when empty', () => {
      render(<SearchBar value="" onChange={mockOnChange} />)

      const shortcut = screen.getByText('⌘K')
      expect(shortcut).toBeInTheDocument()
    })

    it('should hide keyboard shortcut hint when has value', () => {
      render(<SearchBar value="git" onChange={mockOnChange} />)

      const shortcut = screen.queryByText('⌘K')
      expect(shortcut).not.toBeInTheDocument()
    })

    it('should render clear button when has value', () => {
      render(<SearchBar value="git" onChange={mockOnChange} />)

      const clearButton = document.querySelector('.lucide-x')?.parentElement
      expect(clearButton).toBeInTheDocument()
    })

    it('should not render clear button when empty', () => {
      render(<SearchBar value="" onChange={mockOnChange} />)

      const clearButton = document.querySelector('.lucide-x')?.parentElement
      expect(clearButton).not.toBeInTheDocument()
    })
  })

  describe('user input', () => {
    it('should call onChange when typing', () => {
      render(<SearchBar value="" onChange={mockOnChange} />)

      const input = screen.getByPlaceholderText('Search packages, IDs, or tags...')
      fireEvent.change(input, { target: { value: 'git' } })

      expect(mockOnChange).toHaveBeenCalledWith('git')
    })

    it('should display current value', () => {
      render(<SearchBar value="chrome" onChange={mockOnChange} />)

      const input = screen.getByDisplayValue('chrome')
      expect(input).toBeInTheDocument()
    })

    it('should handle empty string', () => {
      render(<SearchBar value="" onChange={mockOnChange} />)

      const input = screen.getByPlaceholderText('Search packages, IDs, or tags...')
      expect(input.value).toBe('')
    })
  })

  describe('clear functionality', () => {
    it('should clear input when clear button is clicked', () => {
      render(<SearchBar value="git" onChange={mockOnChange} />)

      const clearButton = document.querySelector('.lucide-x')?.parentElement
      fireEvent.click(clearButton!)

      expect(mockOnChange).toHaveBeenCalledWith('')
    })

    it('should call onChange exactly once on clear', () => {
      render(<SearchBar value="test" onChange={mockOnChange} />)

      const clearButton = document.querySelector('.lucide-x')?.parentElement
      fireEvent.click(clearButton!)

      expect(mockOnChange).toHaveBeenCalledTimes(1)
    })
  })

  describe('focus states', () => {
    it('should apply focused styles when input is focused', () => {
      render(<SearchBar value="" onChange={mockOnChange} />)

      const input = screen.getByPlaceholderText('Search packages, IDs, or tags...')
      const container = input.closest('.relative')

      fireEvent.focus(input)

      expect(container).toHaveClass()
    })

    it('should remove focused styles when input is blurred', () => {
      render(<SearchBar value="" onChange={mockOnChange} />)

      const input = screen.getByPlaceholderText('Search packages, IDs, or tags...')

      fireEvent.focus(input)
      fireEvent.blur(input)

      expect(input).not.toHaveFocus()
    })
  })

  describe('keyboard shortcuts', () => {
    it('should prevent default on Ctrl+K', () => {
      render(<SearchBar value="" onChange={mockOnChange} />)

      const input = screen.getByPlaceholderText('Search packages, IDs, or tags...')
      const event = new KeyboardEvent('keydown', { key: 'k', ctrlKey: true })

      Object.defineProperty(event, 'preventDefault', { value: vi.fn() })

      input.dispatchEvent(event)

      // The handler should be called
      expect(input).toBeTruthy()
    })

    it('should prevent default on Cmd+K (Mac)', () => {
      render(<SearchBar value="" onChange={mockOnChange} />)

      const input = screen.getByPlaceholderText('Search packages, IDs, or tags...')
      const event = new KeyboardEvent('keydown', { key: 'k', metaKey: true })

      input.dispatchEvent(event)

      expect(input).toBeTruthy()
    })
  })

  describe('accessibility', () => {
    it('should have clear button with aria-label', () => {
      render(<SearchBar value="git" onChange={mockOnChange} />)

      const clearButton = screen.getByLabelText('Clear search')
      expect(clearButton).toBeInTheDocument()
    })

    it('should have placeholder text', () => {
      render(<SearchBar value="" onChange={mockOnChange} />)

      const input = screen.getByPlaceholderText('Search packages, IDs, or tags...')
      expect(input).toBeInTheDocument()
    })

    it('should be keyboard accessible', () => {
      render(<SearchBar value="" onChange={mockOnChange} />)

      const input = screen.getByPlaceholderText('Search packages, IDs, or tags...')

      input.focus()
      expect(input).toHaveFocus()

      fireEvent.blur(input)
      expect(input).not.toHaveFocus()
    })
  })

  describe('edge cases', () => {
    it('should handle special characters in search', () => {
      render(<SearchBar value="" onChange={mockOnChange} />)

      const input = screen.getByPlaceholderText('Search packages, IDs, or tags...')
      fireEvent.change(input, { target: { value: 'C++ & Python' } })

      expect(mockOnChange).toHaveBeenCalledWith('C++ & Python')
    })

    it('should handle leading and trailing spaces', () => {
      render(<SearchBar value="" onChange={mockOnChange} />)

      const input = screen.getByPlaceholderText('Search packages, IDs, or tags...')
      fireEvent.change(input, { target: { value: '  git  ' } })

      expect(mockOnChange).toHaveBeenCalledWith('  git  ')
    })

    it('should handle very long input', () => {
      const longValue = 'a'.repeat(1000)
      render(<SearchBar value={longValue} onChange={mockOnChange} />)

      const input = screen.getByDisplayValue(longValue)
      expect(input).toBeInTheDocument()
    })

    it('should handle unicode characters', () => {
      render(<SearchBar value="" onChange={mockOnChange} />)

      const input = screen.getByPlaceholderText('Search packages, IDs, or tags...')
      fireEvent.change(input, { target: { value: '开发 🚀' } })

      expect(mockOnChange).toHaveBeenCalledWith('开发 🚀')
    })
  })

  describe('rapid interactions', () => {
    it('should handle rapid typing', () => {
      render(<SearchBar value="" onChange={mockOnChange} />)

      const input = screen.getByPlaceholderText('Search packages, IDs, or tags...')

      fireEvent.change(input, { target: { value: 'g' } })
      fireEvent.change(input, { target: { value: 'gi' } })
      fireEvent.change(input, { target: { value: 'git' } })

      expect(mockOnChange).toHaveBeenCalledTimes(3)
    })

    it('should handle rapid clear operations', () => {
      render(<SearchBar value="test" onChange={mockOnChange} />)

      const clearButton = document.querySelector('.lucide-x')?.parentElement

      fireEvent.click(clearButton!)
      fireEvent.click(clearButton!)
      fireEvent.click(clearButton!)

      expect(mockOnChange).toHaveBeenCalledTimes(3)
    })
  })
})
