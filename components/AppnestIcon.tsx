/**
 * Appnest Default Icon
 *
 * Fallback icon for packages without a brand icon.
 * Displays a geometric monogram with "Appnest" text.
 */

import { cn } from '@/lib/utils'

interface AppnestIconProps {
  /** Icon size in pixels */
  size?: number
  /** Additional CSS classes */
  className?: string
}

export function AppnestIcon({ size = 24, className }: AppnestIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={cn('flex-shrink-0', className)}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {/* Top layer */}
      <path d="M12 2L2 7l10 5 10-5-10-5z" />
      {/* Middle layer */}
      <path d="M2 12l10 5 10-5" />
      {/* Bottom layer */}
      <path d="M2 17l10 5 10-5" />
    </svg>
  )
}

