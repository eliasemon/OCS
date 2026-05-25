import type { PackageCategory } from "./category"

/**
 * Core Package interface - represents a Windows package that can be installed via winget
 */
export interface Package {
  /** Unique winget package identifier (e.g., "Microsoft.VisualStudioCode") */
  id: string
  /** Display name of the package */
  name: string
  /** Short description of what the package does */
  description: string
  /** Category classification for the package */
  category: PackageCategory
  /** Tags for search and discoverability */
  tags: readonly string[]
  /** Icon name/emoji for visual identification */
  icon: string
  /** Brand slug for Simple Icons mapping (e.g., 'visualstudiocode', 'git') */
  brandSlug?: string
  /** Path to downloaded company logo (e.g., '/images/logos/git-git.png') */
  logoUrl?: string
  /** Whether this package is popular/featured */
  popular: boolean
  /** Approximate download size */
  size?: string
  /** Current version of the package */
  version?: string
  /** Publisher/author name */
  publisher?: string
  /** Homepage URL for the package */
  homepage?: string
  /** Source code repository URL */
  repository?: string
  /** License information (SPDX identifier or name) */
  license?: string
  /** Array of screenshot URLs for preview */
  screenshots?: readonly string[]
  /** Number of times this package has been installed */
  installs?: number
  /** User rating (0-5) */
  rating?: number
  /** Number of ratings submitted */
  ratingCount?: number
  /** ISO timestamp when package info was last updated */
  lastUpdated?: string
  /** Alternative package IDs (aliases) */
  aliases?: readonly string[]
}

/**
 * Minimal package info for list views
 */
export interface PackageSummary {
  id: string
  name: string
  description: string
  category: PackageCategory
  icon: string
  popular: boolean
}

/**
 * Package with installation status
 */
export interface PackageWithStatus extends Package {
  /** Whether the package is currently installed */
  installed: boolean
  /** Installed version (if installed) */
  installedVersion?: string
  /** Whether an update is available */
  updateAvailable?: boolean
}

/**
 * Install configuration format
 */
export interface InstallConfig {
  version: string
  created: string
  packages: string[]
  preset?: string
}

/**
 * Validation result for package IDs
 */
export interface ValidationResult {
  valid: string[]
  invalid: string[]
}

/**
 * Package search filters
 */
export interface PackageSearchFilters {
  category?: PackageCategory | "All"
  query?: string
  popularOnly?: boolean
  installedOnly?: boolean
  minRating?: number
}

/**
 * Package sort options
 */
export type PackageSortOption =
  | "name"       // Alphabetical by name
  | "popular"    // Most popular first
  | "recent"     // Most recently updated
  | "rating"     // Highest rated
  | "size"       // Smallest size first

// Re-export category types for convenience
export type { Category, CategoryMeta, CategoryFilter } from "./category"
// Re-export preset types for convenience
export type { Preset, CommunityPreset, CommunityPresetPackage, PresetCreateInput, PresetValidationResult, PresetSortOption } from "./preset"
