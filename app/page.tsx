import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, Zap, Shield, Bookmark, Package, Github, Terminal, Clock, Users, ChevronRight, Star, Check, FileText, Book, Layers, Code2, Bug, FileCheck, Lock, Scale } from "lucide-react"
import { MetricCounter } from "@/components/MetricCounter"
import { DemoTerminal } from "@/components/DemoTerminal"
import { OsLogos, AppIcons } from "@/components/HeroIllustrations"
import { InstalloraIcon } from "@/components/InstalloraIcon"
import Image from "next/image"

export const metadata: Metadata = {
  title: "Installora - Set Up Windows, macOS & Linux in Minutes",
  description: "Set Up Windows, macOS & Linux in Minutes. One command installs everything. Skip the installer clicking and get your perfect development environment in just 5 minutes.",
  keywords: [
    "winget",
    "homebrew",
    "apt",
    "windows package manager",
    "mac package manager",
    "linux package manager",
    "Installora",
    "mac installer",
    "bulk install apps",
    "powershell installer",
    "brew installer",
    "developer tools",
    "setup automation"
  ],
  authors: [{ name: "Installora" }],
  creator: "Installora",
  publisher: "Installora",
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_APP_URL || "https://installora.vercel.app",
    title: "Installora - Set Up Windows, macOS & Linux in Minutes",
    description: "Set Up Windows, macOS & Linux in Minutes. One command installs everything. Skip the installer clicking.",
    siteName: "Installora",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "Installora - Set Up Windows, macOS & Linux in Minutes"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Installora - Set Up Windows, macOS & Linux in Minutes",
    description: "Set Up Windows, macOS & Linux in Minutes. One command installs everything. Skip the installer clicking.",
    images: ["/logo.png"],
  },
  alternates: {
    canonical: "/"
  }
}

const features = [
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Install 50+ apps in the time it takes to install one manually. Winget, Homebrew, and APT handle everything.",
    gradient: "from-[hsl(var(--color-primary))] to-[hsl(var(--color-accent))] bg-gradient-to-br",
    bgGradient: "from-[hsl(var(--color-primary)/0.1)] to-[hsl(var(--color-accent)/0.05)]",
  },
  {
    icon: Shield,
    title: "Official Sources",
    description: "Every package comes directly from the official publishers via Microsoft's Winget, Apple's Homebrew, and Linux repositories.",
    gradient: "from-[hsl(var(--color-accent))] to-[hsl(var(--color-primary))] bg-gradient-to-br",
    bgGradient: "from-[hsl(var(--color-accent)/0.1)] to-[hsl(var(--color-primary)/0.05)]",
  },
  {
    icon: Bookmark,
    title: "Save & Share",
    description: "Create presets for your team. Quick-restore your complete environment on any machine instantly.",
    gradient: "from-[hsl(var(--color-primary))] to-[hsl(var(--color-accent))] bg-gradient-to-br",
    bgGradient: "from-[hsl(var(--color-primary)/0.1)] to-[hsl(var(--color-accent)/0.05)]",
  },
]

const steps = [
  {
    number: "01",
    title: "Browse",
    description: "Explore our curated catalog of 500+ packages across 8 categories",
    icon: Package,
  },
  {
    number: "02",
    title: "Select",
    description: "Pick the apps you need or use AI to find the perfect setup",
    icon: Check,
  },
  {
    number: "03",
    title: "Generate",
    description: "Copy your custom PowerShell, Homebrew, or Bash command with one click",
    icon: Terminal,
  },
  {
    number: "04",
    title: "Install",
    description: "Paste in terminal and watch everything install automatically",
    icon: Zap,
  },
]

const trustedBy = [
  { name: "Developers", count: 10000, suffix: "+" },
  { name: "Packages", count: 500, suffix: "+" },
  { name: "Installs", count: 1, suffix: "M+" },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[hsl(var(--color-background))]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "Installora",
            "operatingSystem": "Windows, macOS, Linux",
            "applicationCategory": "DeveloperApplication",
            "description": "Set Up Windows, macOS & Linux in Minutes. One command installs everything.",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            }
          })
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "Installora",
            "url": process.env.NEXT_PUBLIC_APP_URL || "https://installora.vercel.app/"
          })
        }}
      />
      {/* Hero Section */}
      <section className="hero-bg relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated background grid */}
        <div className="hero-grid" />

        {/* Floating gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[hsl(var(--color-primary)/0.15)] rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[hsl(var(--color-accent)/0.1)] rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />

        <div className="relative mx-auto max-w-7xl px-6 py-32 z-10 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Column: Text */}
            <div className="text-left">
              {/* Badge */}
              <div className="mb-8 inline-flex items-center gap-2 rounded-full glass px-4 py-2 animate-fade-in-down hover:scale-105 transition-transform duration-300">
                <Zap className="h-4 w-4 text-[hsl(var(--color-primary))] animate-pulse" />
                <span className="text-sm font-medium text-[hsl(var(--color-foreground))]">
                  Introducing Installora
                </span>
                <span className="text-xs text-[hsl(var(--color-muted-foreground))]">Beta</span>
              </div>

              {/* Headline */}
              <h1 className="text-5xl font-bold tracking-tight mb-6 sm:text-6xl lg:text-7xl animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                Set Up Windows, <br className="hidden sm:block" />macOS & Linux
                <span className="gradient-text-animated block mt-2">
                  in Minutes
                </span>
              </h1>

              {/* Subheadline */}
              <p className="text-xl text-[hsl(var(--color-muted-foreground))] mb-10 max-w-xl animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                One command installs everything. Skip the installer clicking and get your perfect development environment in just 5 minutes.
              </p>

              {/* CTA Buttons */}
              <div className="flex items-center gap-4 flex-wrap sm:flex-nowrap animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                <Link
                  href="/app"
                  className="btn-primary group text-base"
                >
                  Start Installing
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
                <a
                  href="https://github.com/eliasemon/Installora"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary group text-base"
                >
                  <Github className="h-5 w-5" />
                  View Source
                  <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1 opacity-0 group-hover:opacity-100" />
                </a>
              </div>
            </div>

            {/* Right Column: Illustrations */}
            <div className="relative hidden lg:flex items-center justify-center min-h-[600px] w-full perspective-[2000px]">

              {/* App Icons (Background Layer) */}
              <div className="absolute left-1/2 top-1/2 -translate-y-1/2 translate-x-[10%] scale-[0.8] opacity-50 blur-[3px] z-0">
                <div className="animate-float" style={{ animationDelay: '1s' }}>
                  <AppIcons />
                </div>
              </div>

              {/* OS Logos (Foreground Layer) */}
              <div className="absolute left-1/2 top-1/2 -translate-y-1/2 -translate-x-[90%] scale-[1.15] opacity-100 blur-0 z-10">
                <div className="animate-float" style={{ animationDelay: '0s' }}>
                  <OsLogos />
                </div>
              </div>

            </div>
          </div>

          {/* Social Proof */}
          <div className="mt-24 grid grid-cols-3 gap-8 max-w-3xl mx-auto lg:mx-0 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            {trustedBy.map((item, index) => (
              <div key={index} className="text-center lg:text-left group">
                <div className="text-3xl font-bold gradient-text flex items-center justify-center lg:justify-start group-hover:scale-110 transition-transform duration-300 lg:origin-left">
                  <MetricCounter end={item.count} suffix={item.suffix} />
                </div>
                <div className="text-sm text-[hsl(var(--color-muted-foreground))] mt-2">{item.name}</div>
              </div>
            ))}
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce hidden sm:block">
            <div className="w-6 h-10 rounded-full border-2 border-[hsl(var(--color-muted-foreground))] flex items-start justify-center p-1">
              <div className="w-1.5 h-3 bg-[hsl(var(--color-primary))] rounded-full animate-pulse" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 relative">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">
              Why Choose <span className="gradient-text">Installora</span>?
            </h2>
            <p className="text-lg text-[hsl(var(--color-muted-foreground))] max-w-2xl mx-auto">
              The fastest way to set up your Windows, macOS, or Linux development environment with trusted, official packages.
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group relative rounded-2xl p-8 bg-gradient-to-br from-[hsl(var(--color-card))] to-[hsl(var(--color-background))] border border-[hsl(var(--color-border))] overflow-hidden transition-all duration-500 hover:scale-[1.02] hover:border-[hsl(var(--color-primary)/0.5)]"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Hover glow effect */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                {/* Icon */}
                <div className={`relative mb-6 flex h-14 w-14 items-center justify-center rounded-xl ${feature.gradient} shadow-lg`}>
                  <feature.icon className="h-7 w-7 text-white" />
                </div>

                {/* Content */}
                <h3 className="relative text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="relative text-[hsl(var(--color-muted-foreground))] leading-relaxed">
                  {feature.description}
                </p>

                {/* Bottom gradient line */}
                <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-32 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[hsl(var(--color-primary)/0.02)] to-transparent" />

        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">
              How It <span className="gradient-text">Works</span>
            </h2>
            <p className="text-lg text-[hsl(var(--color-muted-foreground))] max-w-2xl mx-auto">
              Get your complete development environment ready in four simple steps.
            </p>
          </div>

          {/* Steps */}
          <div className="relative">
            {/* Connection line */}
            <div className="absolute top-24 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[hsl(var(--color-border))] to-transparent hidden lg:block" />

            <div className="grid grid-cols-1 gap-12 lg:grid-cols-4 lg:gap-8">
              {steps.map((step, index) => (
                <div key={index} className="relative group">
                  {/* Step number circle */}
                  <div className="flex flex-col items-center text-center">
                    <div className="relative mb-6">
                      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[hsl(var(--color-card))] border border-[hsl(var(--color-border))] group-hover:border-[hsl(var(--color-primary))] group-hover:shadow-[var(--shadow-glow-primary)] transition-all duration-300">
                        <step.icon className="h-8 w-8 text-[hsl(var(--color-muted-foreground))] group-hover:text-[hsl(var(--color-primary))] group-hover:scale-110 transition-all duration-300" />
                      </div>
                      <div className="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-[hsl(var(--color-primary))] text-sm font-bold text-[hsl(var(--color-primary-foreground))] shadow-lg animate-bounce-subtle">
                        {index + 1}
                      </div>
                    </div>

                    <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                    <p className="text-sm text-[hsl(var(--color-muted-foreground))] max-w-xs">
                      {step.description}
                    </p>
                  </div>

                  {/* Arrow between steps (desktop only) */}
                  {index < steps.length - 1 && (
                    <div className="hidden lg:flex absolute top-24 -right-4 transform translate-x-1/2">
                      <ArrowRight className="h-6 w-6 text-[hsl(var(--color-muted-foreground))]" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Demo Preview Section */}
      <section className="py-32 relative">
        <div className="mx-auto max-w-4xl px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">
              Watch It <span className="gradient-text">Install</span>
            </h2>
            <p className="text-lg text-[hsl(var(--color-muted-foreground))] max-w-2xl mx-auto">
              Experience the magic of automated installation.
            </p>
          </div>
          <DemoTerminal />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="relative rounded-3xl overflow-hidden">
            {/* Gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--color-primary))] to-[hsl(var(--color-accent))] opacity-90" />

            {/* Animated pattern overlay */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(0_0%_100%_/_0.1)_1px,transparent_1px),linear-gradient(to_bottom,hsl(0_0%_100%_/_0.1)_1px,transparent_1px)] bg-[size:2rem_2rem]" />
            </div>

            {/* Floating elements */}
            <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl animate-float" />
            <div className="absolute bottom-10 right-10 w-32 h-32 bg-white/10 rounded-full blur-xl animate-float" style={{ animationDelay: '1s' }} />

            {/* Content */}
            <div className="relative px-8 py-20 sm:px-16 sm:py-28 text-center">
              <h2 className="text-4xl font-bold tracking-tight sm:text-5xl text-white mb-6">
                5 minutes vs 5 hours
              </h2>
              <p className="mx-auto max-w-xl text-lg text-white/90 mb-10">
                One command installs everything. Skip the installer clicking and get back to what matters most—building great software.
              </p>
              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link
                  href="/app"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-8 py-4 text-base font-semibold text-gray-950 transition-all hover:scale-105 hover:shadow-2xl animate-pulse-glow"
                >
                  Start Installing Now
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <a
                  href="https://github.com/eliasemon/Installora"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/10 px-8 py-4 text-base font-semibold text-white border border-white/20 transition-all hover:bg-white/20"
                >
                  <Github className="h-5 w-5" />
                  Star on GitHub
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[hsl(var(--color-border))] py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-4">
            {/* Brand */}
            <div className="lg:col-span-1">
              <Link href="/" className="flex items-center gap-3 mb-4 group hover:scale-[1.02] transition-transform">
                <div className="h-10 w-10 rounded-xl bg-[hsl(var(--color-primary))] flex items-center justify-center shadow-lg group-hover:shadow-[var(--shadow-glow-primary)] transition-shadow">
                  <InstalloraIcon className="text-white group-hover:animate-bounce-subtle" size={24} />
                </div>
                <span className="text-xl font-bold">Installora</span>
              </Link>
              <p className="text-sm text-[hsl(var(--color-muted-foreground))] max-w-xs">
                Open source • Powered by Winget, Homebrew & APT • Built for developers
              </p>
            </div>

            {/* Links */}
            <div className="lg:col-span-3 grid grid-cols-2 gap-8 sm:grid-cols-3">
              <div>
                <h3 className="text-sm font-semibold mb-4">Product</h3>
                <ul className="space-y-3">
                  <li>
                    <Link href="/app" className="flex items-center gap-2 text-sm text-[hsl(var(--color-muted-foreground))] hover:text-[hsl(var(--color-foreground))] hover:translate-x-1 transition-all group">
                      <Package className="h-4 w-4 group-hover:text-[hsl(var(--color-primary))] transition-colors" />
                      Package Catalog
                    </Link>
                  </li>
                  <li>
                    <Link href="/docs" className="flex items-center gap-2 text-sm text-[hsl(var(--color-muted-foreground))] hover:text-[hsl(var(--color-foreground))] hover:translate-x-1 transition-all group">
                      <Book className="h-4 w-4 group-hover:text-[hsl(var(--color-primary))] transition-colors" />
                      Documentation
                    </Link>
                  </li>
                  <li>
                    <Link href="/app" className="flex items-center gap-2 text-sm text-[hsl(var(--color-muted-foreground))] hover:text-[hsl(var(--color-foreground))] hover:translate-x-1 transition-all group">
                      <Layers className="h-4 w-4 group-hover:text-[hsl(var(--color-primary))] transition-colors" />
                      Presets
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold mb-4">Resources</h3>
                <ul className="space-y-3">
                  <li>
                    <a href="https://github.com/eliasemon/Installora" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-[hsl(var(--color-muted-foreground))] hover:text-[hsl(var(--color-foreground))] hover:translate-x-1 transition-all group">
                      <Github className="h-4 w-4 group-hover:text-[hsl(var(--color-primary))] transition-colors" />
                      GitHub
                    </a>
                  </li>
                  <li>
                    <a href="https://github.com/eliasemon/Installora/issues" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-[hsl(var(--color-muted-foreground))] hover:text-[hsl(var(--color-foreground))] hover:translate-x-1 transition-all group">
                      <Bug className="h-4 w-4 group-hover:text-[hsl(var(--color-primary))] transition-colors" />
                      Issues
                    </a>
                  </li>
                  <li>
                    <a href="https://github.com/eliasemon/Installora/releases" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-[hsl(var(--color-muted-foreground))] hover:text-[hsl(var(--color-foreground))] hover:translate-x-1 transition-all group">
                      <FileCheck className="h-4 w-4 group-hover:text-[hsl(var(--color-primary))] transition-colors" />
                      Changelog
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold mb-4">Legal</h3>
                <ul className="space-y-3">
                  <li>
                    <a href="#" className="flex items-center gap-2 text-sm text-[hsl(var(--color-muted-foreground))] hover:text-[hsl(var(--color-foreground))] hover:translate-x-1 transition-all group">
                      <Lock className="h-4 w-4 group-hover:text-[hsl(var(--color-primary))] transition-colors" />
                      Privacy
                    </a>
                  </li>
                  <li>
                    <a href="#" className="flex items-center gap-2 text-sm text-[hsl(var(--color-muted-foreground))] hover:text-[hsl(var(--color-foreground))] hover:translate-x-1 transition-all group">
                      <Scale className="h-4 w-4 group-hover:text-[hsl(var(--color-primary))] transition-colors" />
                      Terms
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-12 pt-8 border-t border-[hsl(var(--color-border))] flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm text-[hsl(var(--color-muted-foreground))]">
              © 2025 Installora. MIT License.
            </p>
            <div className="flex items-center gap-6">
              <a
                href="https://github.com/eliasemon/Installora"
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
