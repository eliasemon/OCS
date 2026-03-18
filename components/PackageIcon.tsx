/**
 * Package Icon Component
 *
 * Displays brand icons for packages using Simple Icons library.
 * Falls back to OCS default icon if no brand icon is available.
 *
 * SECURITY: All SVGs are pre-sanitized at BUILD TIME using DOMPurify
 * - Source: Simple Icons (https://simpleicons.org, MIT License)
 * - Sanitization: scripts/build-brand-icons.ts with strict whitelist
 * - SVGs are rendered using React.createElement, not innerHTML
 * - No user-generated content is ever rendered
 */

import { cn } from '@/lib/utils'
import { OCSIcon } from './OCSIcon'
import type { Package } from '@/types/package'
import React from 'react'

// Import the brand icons library
import { icons, getIcon, type BrandSlug } from '@/lib/brand-icons'

// Common brand slug mappings for popular packages
const BRAND_SLUG_MAP: Record<string, string> = {
  'Git.Git': 'git',
  'Microsoft.VisualStudioCode': 'visualstudiocode',
  'OpenJS.NodeJS.LTS': 'nodejs',
  'OpenJS.NodeJS': 'nodejs',
  'Python.Python.3.13': 'python',
  'Python.Python': 'python',
  'Docker.DockerDesktop': 'docker',
  'Google.Chrome': 'googlechrome',
  'Mozilla.Firefox': 'firefox',
  'Microsoft.Edge': 'microsoftedge',
  'Microsoft.VisualStudio.2022.BuildTools': 'visualstudio',
  'Microsoft.WindowsTerminal': 'windowsterminal',
  'Adobe.Acrobat.Reader.64-bit': 'adobeacrobatreader',
  'Microsoft.OneDrive': 'microsoftonedrive',
  'Spotify.Spotify': 'spotify',
  'Valve.Steam': 'steam',
  'Discord.Discord': 'discord',
  'Slack.Slack': 'slack',
  'Notion.Notion': 'notion',
  'Tencent.WeChat': 'wechat',
  'Microsoft.Teams': 'microsoftteams',
  'Zoom.Zoom': 'zoom',
  'VideoLAN.VLC': 'vlcmediaplayer',
  'Bitwarden.Bitwarden': 'bitwarden',
  '1Password.1Password': '1password',
  'Microsoft.PowerToys': 'microsoft',
  'GitHub.cli': 'github',
  'Golang.Go': 'go',
  'Rustlang.Rust.MSVC': 'rust',
  'Java.OpenJDK': 'openjdk',
}

interface PackageIconProps {
  /** Package to display icon for */
  package: Package | Pick<Package, 'id' | 'name' | 'icon'> & { brandSlug?: string }
  /** Icon size in pixels */
  size?: number
  /** Additional CSS classes */
  className?: string
  /** Whether to show the fallback icon if brand is not found */
  showFallback?: boolean
}

/**
 * Parse SVG string and extract path data for rendering
 * The SVG is pre-sanitized at build time, so we only extract safe path data
 */
function parseSVGPath(svg: string): string | null {
  // Extract the 'd' attribute from path elements
  const pathMatch = svg.match(/<path[^>]*d="([^"]*)"[^>]*>/)
  return pathMatch ? pathMatch[1] : null
}

/**
 * Get brand slug from package
 */
function getBrandSlugForPackage(pkg: PackageIconProps['package']): string | undefined {
  // First check if package has explicit brandSlug
  if ('brandSlug' in pkg && pkg.brandSlug) {
    return pkg.brandSlug
  }

  // Check mapping table
  if (pkg.id in BRAND_SLUG_MAP) {
    return BRAND_SLUG_MAP[pkg.id]
  }

  // Try to extract from icon field if it looks like a brand slug
  if (pkg.icon && /^[a-z0-9]+$/.test(pkg.icon)) {
    return pkg.icon
  }

  // Try to guess from package ID
  const match = pkg.id.match(/^([^.]+)\./)
  if (match) {
    const appName = pkg.id.substring(pkg.id.indexOf('.') + 1).toLowerCase()
    return appName.replace(/\./g, '')
  }

  return undefined
}

/**
 * Brand Icon sub-component that renders a path-based SVG
 * Only renders the 'd' (path data) attribute, which is safe
 */
function BrandIcon({ svg, size, className }: { svg: string; size: number; className?: string }) {
  const pathData = React.useMemo(() => parseSVGPath(svg), [svg])

  if (!pathData) {
    return <OCSIcon size={size} className={className} />
  }

  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={cn('flex-shrink-0', className)}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d={pathData} />
    </svg>
  )
}

/**
 * Main Package Icon Component
 */
export function PackageIcon({ package: pkg, size = 24, className, showFallback = true }: PackageIconProps) {
  const brandSlug = getBrandSlugForPackage(pkg)

  // Try to get the brand icon from our pre-sanitized library
  const iconSvg = brandSlug ? getIcon(brandSlug) : null

  if (iconSvg && brandSlug) {
    return <BrandIcon svg={iconSvg} size={size} className={className} />
  }

  if (showFallback) {
    return <OCSIcon size={size} className={className} />
  }

  return null
}
