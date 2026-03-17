/**
 * Category type for package classification
 * "All" is reserved for filtering UI, not for actual package assignment
 */
export type Category =
  | "All"
  | "Developer"
  | "Browsers"
  | "Media"
  | "Communication"
  | "Utilities"
  | "Productivity"
  | "Design"
  | "Gaming"
  | "Security"
  | "Virtualization"
  | "Networking"
  | "Data"
  | "Cloud"
  | "System"
  | "Education"

/**
 * Valid categories for a package (excludes "All")
 */
export type PackageCategory = Exclude<Category, "All">

/**
 * Metadata for a category display in UI
 */
export interface CategoryMeta {
  /** Category identifier */
  id: PackageCategory
  /** Display name for the category */
  name: string
  /** Short description of the category */
  description: string
  /** Icon/emoji for the category */
  icon: string
  /** Accent color for the category (hex or CSS variable) */
  color: string
}

/**
 * Filter state for category selection
 */
export interface CategoryFilter {
  /** Currently selected category */
  selected: Category
  /** Available categories */
  available: readonly Category[]
  /** Package count per category */
  counts: Readonly<Record<Category, number>>
}

/**
 * Category groupings for organized display
 */
export interface CategoryGroup {
  /** Group heading */
  name: string
  /** Categories in this group */
  categories: readonly PackageCategory[]
}
