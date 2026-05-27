import { Suspense } from "react"
import { AppPageClient } from "@/components/AppPageClient"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Package Catalog",
  description: "Browse and select from hundreds of developer tools, applications, and utilities to install with a single command.",
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_APP_URL || "https://appnest-beta.vercel.app"}/app`
  }
}

export default function AppPage() {
  return (
    <Suspense fallback={<AppPageFallback />}>
      <AppPageClient />
    </Suspense>
  )
}

function AppPageFallback() {
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[hsl(var(--color-background))]">
      <div className="h-16 border-b border-[hsl(var(--color-border))] animate-pulse" />
      <div className="flex flex-1 px-4 pb-4 gap-4">
        <div className="flex-1 space-y-4">
          <div className="h-12 animate-pulse rounded-lg bg-gray-900" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-40 animate-pulse rounded-xl bg-gray-900" />
            ))}
          </div>
        </div>
        <div className="hidden md:block w-80 h-96 animate-pulse rounded-xl bg-gray-900" />
      </div>
    </div>
  )
}
