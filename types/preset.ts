/**
 * Base Preset interface for both built-in and custom presets
 */
export interface Preset {
  /** Unique identifier for the preset */
  id: string
  /** Display name */
  name: string
  /** Short description of what this preset installs */
  description: string
  /** Icon/emoji for visual identification */
  icon: string
  /** List of package IDs to install */
  packageIds: readonly string[]
}

/**
 * Community-sourced preset with additional metadata
 */
export interface CommunityPreset extends Omit<Preset, "packageIds"> {
  /** Package IDs with optional versions */
  packages: readonly CommunityPresetPackage[]
  /** Author/display name of creator */
  author: string
  /** Author's unique identifier */
  authorId: string
  /** Number of times this preset has been used */
  installs: number
  /** User rating (0-5) */
  rating: number
  /** Number of ratings */
  ratingCount: number
  /** When the preset was created */
  createdAt: string
  /** When the preset was last updated */
  updatedAt: string
  /** Optional tags for discoverability */
  tags?: readonly string[]
  /** Whether this preset is featured/curated */
  featured?: boolean
}

/**
 * Package reference with optional version constraint
 */
export interface CommunityPresetPackage {
  /** Package identifier */
  id: string
  /** Optional version constraint (semver) */
  version?: string
  /** Whether this package is required vs optional */
  required: boolean
}

/**
 * Preset creation form data
 */
export interface PresetCreateInput {
  name: string
  description: string
  icon: string
  packageIds: string[]
}

/**
 * Preset validation result
 */
export interface PresetValidationResult {
  /** Whether the preset is valid */
  valid: boolean
  /** Number of valid package IDs */
  validCount: number
  /** Number of invalid/unknown package IDs */
  invalidCount: number
  /** Invalid package IDs that couldn't be resolved */
  invalidIds: readonly string[]
}

/**
 * Preset sort options
 */
export type PresetSortOption =
  | "popular"    // Most installed
  | "rating"     // Highest rated
  | "recent"     // Recently created
  | "updated"    // Recently updated
  | "name"       // Alphabetical
