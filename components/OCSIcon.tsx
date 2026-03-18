/**
 * OCS (oneCommandSetup) Default Icon
 *
 * Fallback icon for packages without a brand icon.
 * Displays a geometric monogram with "OCS" text.
 */

import { cn } from '@/lib/utils'

interface OCSIconProps {
  /** Icon size in pixels */
  size?: number
  /** Additional CSS classes */
  className?: string
}

export function OCSIcon({ size = 24, className }: OCSIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={cn('flex-shrink-0', className)}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {/* Outer circle */}
      <circle cx="12" cy="12" r="9" />
      {/* Inner "OCS" text - centered */}
      <text
        x="12"
        y="14"
        textAnchor="middle"
        fontSize="6"
        fontWeight="600"
        fill="currentColor"
        stroke="none"
      >
        OCS
      </text>
    </svg>
  )
}
