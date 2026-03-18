import { describe, it, expect } from 'vitest'
import { cn } from '../utils'

describe('cn (className utility)', () => {
  it('should merge class names correctly', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('should handle undefined and null values', () => {
    expect(cn('foo', undefined, 'bar', null)).toBe('foo bar')
  })

  it('should handle empty strings', () => {
    expect(cn('foo', '', 'bar')).toBe('foo bar')
  })

  it('should handle conditional classes', () => {
    expect(cn('foo', false && 'bar', 'baz')).toBe('foo baz')
  })

  it('should handle Tailwind conflicts (later classes win)', () => {
    expect(cn('p-4', 'p-2')).toBe('p-2')
  })

  it('should handle complex conditional logic', () => {
    const isActive = true
    const isDisabled = false
    expect(
      cn('base-class', isActive && 'active-class', isDisabled && 'disabled-class')
    ).toBe('base-class active-class')
  })

  it('should handle arrays of classes', () => {
    expect(cn(['foo', 'bar'], 'baz')).toBe('foo bar baz')
  })

  it('should handle objects with boolean values', () => {
    expect(
      cn({
        foo: true,
        bar: false,
        baz: true,
      })
    ).toBe('foo baz')
  })

  it('should handle mixed input types', () => {
    expect(
      cn('foo', { bar: true, baz: false }, ['qux'])
    ).toBe('foo bar qux')
  })

  it('should return empty string for no valid classes', () => {
    expect(cn('', false, undefined, null)).toBe('')
  })

  it('should handle Tailwind utility conflicts properly', () => {
    expect(cn('text-red-500 text-blue-500')).toBe('text-blue-500')
  })

  it('should handle spacing conflicts', () => {
    expect(cn('m-4 p-4 m-2')).toBe('p-4 m-2')
  })

  it('should handle responsive variants correctly', () => {
    expect(cn('p-4 md:p-8 lg:p-12')).toBe('p-4 md:p-8 lg:p-12')
  })

  it('should handle dark mode variants', () => {
    expect(cn('bg-white dark:bg-gray-900')).toBe('bg-white dark:bg-gray-900')
  })

  it('should not duplicate identical classes', () => {
    expect(cn('foo', 'bar', 'foo')).toBe('foo bar')
  })
})
