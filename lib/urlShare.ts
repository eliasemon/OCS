/**
 * URL Preset Sharing Utilities
 *
 * Functions for encoding/decoding package selections in URLs.
 * This allows users to share their selections via URL without needing a backend.
 */

import type { Preset } from "@/types/package"

/**
 * Compression format for URL encoding
 * - 'standard': Comma-separated package IDs
 * - 'base64': Base64-encoded JSON (for larger selections)
 * - 'preset': Built-in preset ID
 */
export type ShareFormat = 'standard' | 'base64' | 'preset'

/**
 * Encode package IDs into a URL parameter value
 */
export function encodePackages(packageIds: readonly string[], format: ShareFormat = 'standard'): string {
  if (packageIds.length === 0) {
    return ''
  }

  switch (format) {
    case 'standard':
      // Comma-separated, simple and readable
      return packageIds.join(',')

    case 'base64':
      // Base64 encoded for larger selections
      const json = JSON.stringify(packageIds)
      return Buffer.from(json).toString('base64')

    default:
      return packageIds.join(',')
  }
}

/**
 * Decode package IDs from a URL parameter value
 */
export function decodePackages(encoded: string): string[] {
  if (!encoded) {
    return []
  }

  // Try base64 first (check if it looks like base64)
  if (/^[A-Za-z0-9+/]+=*$/.test(encoded) && encoded.length > 32) {
    try {
      const json = Buffer.from(encoded, 'base64').toString('utf-8')
      const parsed = JSON.parse(json)
      if (Array.isArray(parsed)) {
        return parsed
      }
    } catch {
      // Fall through to standard format
    }
  }

  // Standard comma-separated format
  return encoded.split(',').filter(Boolean)
}

/**
 * Generate a shareable URL for a set of package IDs
 */
export function generateShareUrl(
  packageIds: string[],
  baseUrl: string = window.location.origin + '/app',
  format: ShareFormat = 'standard'
): string {
  const encoded = encodePackages(packageIds, format)

  if (!encoded) {
    return baseUrl
  }

  const url = new URL(baseUrl)
  url.searchParams.set('packages', encoded)

  return url.toString()
}

/**
 * Generate a shareable URL for a built-in preset
 */
export function generatePresetUrl(
  presetId: string,
  baseUrl: string = window.location.origin + '/app'
): string {
  const url = new URL(baseUrl)
  url.searchParams.set('preset', presetId)
  return url.toString()
}

/**
 * Generate a shareable URL for a custom preset (encoded in URL)
 */
export function generateCustomPresetUrl(
  preset: Preset,
  baseUrl: string = window.location.origin + '/app'
): string {
  const url = new URL(baseUrl)

  // Use preset ID for built-in presets
  if (preset.id.startsWith('custom-')) {
    url.searchParams.set('packages', encodePackages(preset.packageIds))
  } else {
    url.searchParams.set('preset', preset.id)
  }

  // Add name and description for custom presets
  if (preset.name) {
    url.searchParams.set('name', preset.name)
  }
  if (preset.description) {
    url.searchParams.set('desc', preset.description)
  }

  return url.toString()
}

/**
 * Parse preset data from URL search params
 */
export function parsePresetFromUrl(
  searchParams: URLSearchParams
): { packages: string[]; name?: string; description?: string; presetId?: string } | null {
  const packagesParam = searchParams.get('packages')
  const presetParam = searchParams.get('preset')
  const name = searchParams.get('name') || undefined
  const description = searchParams.get('desc') || undefined

  if (presetParam) {
    return {
      presetId: presetParam,
      packages: [],
      name,
      description,
    }
  }

  if (packagesParam) {
    const packages = decodePackages(packagesParam)
    if (packages.length > 0) {
      return {
        packages,
        name,
        description,
      }
    }
  }

  return null
}

/**
 * Copy share URL to clipboard
 */
export async function copyShareUrl(packageIds: string[], format: ShareFormat = 'standard'): Promise<boolean> {
  try {
    const url = generateShareUrl(packageIds, undefined, format)
    await navigator.clipboard.writeText(url)
    return true
  } catch {
    return false
  }
}

/**
 * Get the optimal format for encoding based on package count
 */
export function getOptimalFormat(packageCount: number): ShareFormat {
  // Use standard format for up to ~10 packages
  if (packageCount <= 10) {
    return 'standard'
  }
  // Use base64 for larger selections
  return 'base64'
}
