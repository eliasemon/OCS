import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, Zap, Shield, Bookmark, Package, Github } from "lucide-react"
import { MetricCounter } from "@/components/MetricCounter"

export const metadata: Metadata = {
  title: "oneCommandSetup (OCS) - Set Up Windows in Minutes",
  description: "Set Up Windows in Minutes. One command installs everything. Skip the installer clicking and get your perfect development environment in just 5 minutes.",
  keywords: [
    "winget",
    "windows package manager",
    "oneCommandSetup",
    "OCS",
    "windows installer",
    "bulk install windows apps",
    "powershell installer",
    "developer tools",
    "windows setup automation"
  ],
  authors: [{ name: "oneCommandSetup" }],
  creator: "oneCommandSetup",
  publisher: "oneCommandSetup",
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://onecommandsetup.app",
    title: "oneCommandSetup - Set Up Windows in Minutes",
    description: "Set Up Windows in Minutes. One command installs everything. Skip the installer clicking.",
    siteName: "oneCommandSetup",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "oneCommandSetup - Set Up Windows in Minutes"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "oneCommandSetup - Set Up Windows in Minutes",
    description: "Set Up Windows in Minutes. One command installs everything. Skip the installer clicking.",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: "https://onecommandsetup.app"
  }
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[hsl(var(--color-background))]">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center">
        {/* Background grid effect */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--color-border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--color-border))_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20" />

        <div className="relative mx-auto max-w-4xl px-6 py-24 text-center">
          {/* Badge */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full bg-cyan-950/50 border border-cyan-500/20 px-4 py-2">
            <Zap className="h-4 w-4 text-cyan-400" />
            <span className="text-sm font-medium text-cyan-400">Now: oneCommandSetup</span>
          </div>

          {/* Headline */}
          <h1 className="text-6xl font-bold tracking-tight mb-6 sm:text-7xl lg:text-8xl">
            Set Up Windows
            <span className="gradient-text block">
              in Minutes
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl text-[hsl(var(--color-muted-foreground))] mb-10 max-w-2xl mx-auto">
            One command installs everything. Skip the installer clicking.
          </p>

          {/* CTA */}
          <div className="flex items-center justify-center gap-4 flex-wrap sm:flex-nowrap">
            <Link
              href="/app"
              className="btn-primary group"
            >
              Start Installing
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary"
            >
              <Github className="mr-2 h-5 w-5" />
              View Source
            </a>
          </div>

          {/* Social Proof */}
          <div className="mt-12 flex items-center justify-center gap-8 text-sm text-[hsl(var(--color-muted-foreground))] flex-wrap">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              <span><MetricCounter end={500} suffix="+" /> Packages</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-cyan-400" />
              <span>One Command</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-emerald-400" />
              <span>Official Sources</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1: Lightning Fast */}
            <div className="package-card group">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-950/50 ring-1 ring-cyan-500/20 mb-4">
                <Zap className="h-6 w-6 text-cyan-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Lightning Fast</h3>
              <p className="text-sm text-[hsl(var(--color-muted-foreground))]">
                Install 50+ apps in the time it takes to install one manually. Winget handles everything.
              </p>
            </div>

            {/* Feature 2: Official Sources */}
            <div className="package-card group">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-950/50 ring-1 ring-emerald-500/20 mb-4">
                <Shield className="h-6 w-6 text-emerald-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Official Sources</h3>
              <p className="text-sm text-[hsl(var(--color-muted-foreground))]">
                Every package from the official publisher via Microsoft's winget repository.
              </p>
            </div>

            {/* Feature 3: Save & Share */}
            <div className="package-card group sm:col-span-2 lg:col-span-1">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-950/50 ring-1 ring-purple-500/20 mb-4">
                <Bookmark className="h-6 w-6 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Save & Share</h3>
              <p className="text-sm text-[hsl(var(--color-muted-foreground))]">
                Create presets for your team. Quick-restore your environment on any machine.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              How It Works
            </h2>
          </div>

          <div className="mx-auto max-w-5xl">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-12">
              {/* Step 1 */}
              <div className="flex flex-col items-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-cyan-950/50 text-3xl font-bold text-cyan-400 ring-1 ring-cyan-500/20 mb-4">
                  1
                </div>
                <h3 className="text-lg font-semibold mb-2">Browse</h3>
                <p className="text-sm text-[hsl(var(--color-muted-foreground))]">
                  Select apps from our curated catalog of 500+ packages
                </p>
              </div>

              {/* Arrow */}
              <div className="hidden lg:flex items-center justify-center text-[hsl(var(--color-muted-foreground))]">
                <ArrowRight className="h-6 w-6" />
              </div>

              {/* Step 2 */}
              <div className="flex flex-col items-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-cyan-950/50 text-3xl font-bold text-cyan-400 ring-1 ring-cyan-500/20 mb-4">
                  2
                </div>
                <h3 className="text-lg font-semibold mb-2">Generate</h3>
                <p className="text-sm text-[hsl(var(--color-muted-foreground))]">
                  Copy your custom PowerShell installation command
                </p>
              </div>

              {/* Arrow */}
              <div className="hidden lg:flex items-center justify-center text-[hsl(var(--color-muted-foreground))]">
                <ArrowRight className="h-6 w-6" />
              </div>

              {/* Step 3 */}
              <div className="flex flex-col items-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-cyan-950/50 text-3xl font-bold text-cyan-400 ring-1 ring-cyan-500/20 mb-4">
                  3
                </div>
                <h3 className="text-lg font-semibold mb-2">Install</h3>
                <p className="text-sm text-[hsl(var(--color-muted-foreground))]">
                  Paste in terminal. Everything installs automatically
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-600 to-emerald-600 px-6 py-16 sm:px-12 sm:py-24">
            <div className="relative mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                5 minutes vs 5 hours
              </h2>
              <p className="mx-auto mt-6 max-w-xl text-lg opacity-90">
                One command installs everything. Skip the installer clicking and get back to what matters.
              </p>
              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link
                  href="/app"
                  className="inline-flex items-center justify-center rounded-xl bg-white px-8 py-4 text-base font-semibold text-gray-950 transition-all hover:scale-105"
                >
                  Start Installing Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[hsl(var(--color-border))] py-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-gradient-to-br from-cyan-500 to-emerald-500 rounded-lg flex items-center justify-center">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-semibold">OCS</span>
            </div>
            <p className="text-sm text-[hsl(var(--color-muted-foreground))]">
              Open source • Powered by winget • Built for developers
            </p>
            <div className="flex items-center gap-6">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[hsl(var(--color-muted-foreground))] transition-colors hover:text-[hsl(var(--color-foreground))]"
              >
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
