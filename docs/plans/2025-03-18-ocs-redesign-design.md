# oneCommandSetup (OCS) - Complete Redesign Design Document

**Date:** 2025-03-18
**Status:** Approved
**Designer:** Claude (Sonnet 4.6)
**Project:** WinSetup → oneCommandSetup (OCS) Transformation

---

## Executive Summary

This document outlines the complete redesign of WinSetup into **oneCommandSetup (OCS)**, transforming it from a functional package selector into a premium, modern developer tool with a focus on speed, efficiency, and exceptional UX.

### Key Decisions

| Aspect | Decision | Rationale |
|--------|----------|-----------|
| **Visual Identity** | Modern & Minimal | Appeals to developers, reduces cognitive load, matches Vercel/Linear aesthetic |
| **Package Icons** | Brand-first (Simple Icons) | Professional, scalable, consistent visual language |
| **AI Integration** | Subtle Assistant | Adds value without complexity, one-shot queries, optional |
| **Landing Page** | Speed & Efficiency Messaging | Core value prop: "5 minutes vs 5 hours" |
| **Team Structure** | 3 Specialized Teams + Coordinator | Parallel independent work, clear scope ownership |

---

## Table of Contents

1. [Visual Identity & Design System](#1-visual-identity--design-system)
2. [Package Icons Strategy](#2-package-icons-strategy)
3. [AI Integration Approach](#3-ai-integration-approach)
4. [Landing Page Design](#4-landing-page-design)
5. [App Architecture](#5-app-architecture)
6. [Component Specifications](#6-component-specifications)
7. [API Integration](#7-api-integration)
8. [Team Responsibilities](#8-team-responsibilities)
9. [Success Criteria](#9-success-criteria)
10. [Technical Considerations](#10-technical-considerations)

---

## 1. Visual Identity & Design System

### 1.1 Design Philosophy: Modern & Minimal

Inspired by Linear, Vercel, and Raycast—tools that respect developers' time and attention.

**Core Principles:**
- **Clarity over decoration**: Every element serves a purpose
- **Performance-first**: Smooth 60fps interactions
- **Dark mode native**: Optimized for developer workflows
- **Subtle animation**: Micro-interactions that delight without distracting

### 1.2 Color Palette

#### Primary Colors (Dark Mode Base)

```css
/* Base - Slate Grays */
--background: 0 0% 3.9%;      /* #0a0a0a */
--foreground: 0 0% 98%;       /* #fafafa */
--card: 0 0% 3.9%;
--card-foreground: 0 0% 98%;
--border: 0 0% 14.9%;         /* #262626 */
--input: 0 0% 14.9%;

/* Muted */
--muted: 0 0% 14.9%;
--muted-foreground: 0 0% 63.9%; /* #a3a3a3 */

/* Accent - Refined Cyan */
--primary: 188 94% 43%;        /* #0891b2 - cyan-600 */
--primary-foreground: 0 0% 98%;
--primary-hover: 188 94% 48%;  /* #06b6d4 - cyan-500 */

/* Secondary - Emerald */
--secondary: 160 84% 39%;      /* #059669 - emerald-600 */
--secondary-foreground: 0 0% 98%;

/* Destructive */
--destructive: 0 84% 60%;      /* #ef4444 - red-500 */
--destructive-foreground: 0 0% 98%;
```

#### Light Mode Variant

```css
/* Base - Light Grays */
--background: 0 0% 100%;       /* #ffffff */
--foreground: 0 0% 3.9%;       /* #0a0a0a */
--card: 0 0% 100%;
--card-foreground: 0 0% 3.9%;
--border: 0 0% 89.8%;          /* #e5e5e5 */

/* Adjusted for contrast */
--muted: 0 0% 96.1%;           /* #f5f5f5 */
--muted-foreground: 0 0% 45.1%; /* #737373 */
```

### 1.3 Typography

**Font Stack:**
```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```

**Hierarchy:**
| Usage | Size | Weight | Line-height |
|-------|------|--------|-------------|
| H1 (Hero) | 48px → 72px | 700 | 1.1 |
| H2 (Section) | 32px → 40px | 600 | 1.2 |
| H3 (Card title) | 18px → 20px | 600 | 1.3 |
| Body | 15px → 16px | 400 | 1.6 |
| Small/Muted | 13px → 14px | 400 | 1.5 |
| Code/Mono | 14px | 400 | 1.5 |

### 1.4 Spacing Scale

**8px Base Unit:**
```
--spacing-xs: 4px;    /* 0.5rem */
--spacing-sm: 8px;    /* 1rem */
--spacing-md: 16px;   /* 2rem */
--spacing-lg: 24px;   /* 3rem */
--spacing-xl: 32px;   /* 4rem */
--spacing-2xl: 48px;  /* 6rem */
--spacing-3xl: 64px;  /* 8rem */
```

### 1.5 Component Style Guidelines

**Cards:**
```css
.package-card {
  background: rgba(10, 10, 10, 0.8);
  border: 1px solid hsl(var(--border));
  border-radius: 12px;
  padding: 16px;
  transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
}

.package-card:hover {
  border-color: hsl(var(--primary));
  box-shadow: 0 0 0 1px hsl(var(--primary)), 0 4px 12px rgba(8, 145, 178, 0.1);
}
```

**Buttons:**
```css
.btn-primary {
  background: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
  border-radius: 8px;
  padding: 12px 24px;
  font-weight: 500;
  transition: all 150ms;
}

.btn-primary:hover {
  background: hsl(var(--primary-hover));
  transform: translateY(-1px);
}
```

**Glassmorphism Accents:**
```css
.glass {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.05);
}
```

---

## 2. Package Icons Strategy

### 2.1 Brand-First Approach

**Source:** Simple Icons library (simpleicons.org)
- 3,000+ brand SVG icons
- MIT License
- Consistent 24×24 viewBox
- Monochrome for theming

### 2.2 Implementation Architecture

**Data Structure:**
```typescript
// types/package.ts
export interface Package {
  id: string                // "Microsoft.VisualStudioCode"
  name: string              // "Visual Studio Code"
  description: string
  category: Category
  brandSlug?: string        // "visualstudiocode" - maps to Simple Icons
  icon?: string             // Legacy emoji, deprecated
  homepage?: string
  license?: string
}
```

**Icon Component with Security:**
```typescript
// components/PackageIcon.tsx
import { icons } from '@/lib/brand-icons'
import { OCSIcon } from './OCSIcon'

interface PackageIconProps {
  package: Package
  size?: number
  className?: string
}

export function PackageIcon({ package: pkg, size = 24, className }: PackageIconProps) {
  const brandIcon = pkg.brandSlug ? icons[pkg.brandSlug] : null

  if (brandIcon) {
    return (
      <svg
        viewBox="0 0 24 24"
        width={size}
        height={size}
        className={className}
        fill="currentColor"
        // SECURITY: SVGs are sanitized at build time using DOMPurify
        // Simple Icons source is trusted (simpleicons.org, MIT license)
        // Build script validates SVG structure before inclusion
        dangerouslySetInnerHTML={{ __html: brandIcon }}
      />
    )
  }

  return <OCSIcon size={size} className={className} />
}
```

**Icon Library Build with Sanitization:**
```typescript
// scripts/build-brand-icons.ts
import simpleIcons from 'simple-icons'
import DOMPurify from 'isomorphic-dompurify'
import fs from 'fs'

const iconMap: Record<string, string> = {}

for (const [key, icon] of Object.entries(simpleIcons)) {
  // SECURITY: Sanitize all SVGs to prevent XSS
  const cleanSvg = DOMPurify.sanitize(icon.svg, {
    USE_PROFILES: { svg: true },
    KEEP_CONTENT: true,
    ALLOWED_TAGS: ['svg', 'path', 'circle', 'rect', 'polygon', 'ellipse', 'line'],
    ALLOWED_ATTR: ['viewBox', 'width', 'height', 'fill', 'd', 'cx', 'cy', 'r', 'x', 'y', 'x1', 'y1', 'x2', 'y2']
  })

  // Validate SVG structure
  if (!cleanSvg.startsWith('<svg') || !cleanSvg.includes('viewBox')) {
    console.warn(`Skipping invalid SVG for ${key}`)
    continue
  }

  iconMap[key] = cleanSvg
}

const output = `// Auto-generated from Simple Icons with DOMPurify sanitization
// Source: https://simpleicons.org
// License: MIT

export const icons = ${JSON.stringify(iconMap, null, 2)} as const

export type BrandSlug = keyof typeof icons
`

fs.writeFileSync('lib/brand-icons.ts', output)
console.log(`Built ${Object.keys(iconMap).length} brand icons`)
```

### 2.3 Fallback: OCS Monogram

**Design:** Minimal geometric "OCS" monogram
```
   ┌─────────┐
   │ ◯ C S   │   Circle enclosing stylized CS
   └─────────┘
```

**SVG Component (Safe - No user input):**
```typescript
// components/OCSIcon.tsx
export function OCSIcon({ size = 24, className }: { size?: number, className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <circle cx="12" cy="12" r="10" />
      <text x="12" y="16" textAnchor="middle" fontSize="8" fontWeight="600" fill="currentColor">
        OCS
      </text>
    </svg>
  )
}
```

### 2.4 Performance Optimization

**Build-Time Optimization:**
1. Download Simple Icons at build time
2. Sanitize SVGs with DOMPurify
3. Validate SVG structure
4. Create TypeScript types for all brand slugs
5. Output to `lib/brand-icons.ts`

**Runtime Optimization:**
1. Icons cached in component state
2. No external network requests
3. SVG inline (no additional requests)

---

## 3. AI Integration Approach

### 3.1 Subtle Assistant Pattern

**Philosophy:** AI augments, doesn't dominate

### 3.2 UI Specification

**Search Bar Enhancement:**
```tsx
// components/SearchBar.tsx
import { Switch } from '@/components/ui/switch'
import { Sparkles } from 'lucide-react'

export function SearchBar() {
  const [aiEnabled, setAiEnabled] = useState(false)
  const [query, setQuery] = useState('')

  return (
    <div className="relative">
      <div className="flex items-center gap-3">
        <Input
          placeholder={aiEnabled ? "Describe what you need..." : "Search packages..."}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-cyan-500" />
          <Switch
            checked={aiEnabled}
            onCheckedChange={setAiEnabled}
            aria-label="Enable AI search"
          />
        </div>
      </div>
      {aiEnabled && (
        <p className="text-xs text-muted-foreground mt-2">
          AI will find packages based on your description
        </p>
      )}
    </div>
  )
}
```

### 3.3 User Flow

**Standard Search:**
```
User types "chrome" → Filters catalog by name/description
```

**AI Search:**
```
User enables AI → User types "web development tools"
  ↓
POST /api/ai/search { query: "web development tools" }
  ↓
AI returns: { packages: ["Git.Git", "VSCode", ...], explanation: "..." }
  ↓
Catalog updates → Banner shows: "Found 8 packages for web development"
```

### 3.4 API Integration

**Request:**
```typescript
// app/api/ai/search/route.ts
export async function POST(request: NextRequest) {
  const { query } = await request.json()

  // Validate input
  if (!query || typeof query !== 'string' || query.length > 500) {
    return NextResponse.json({ error: 'Invalid query' }, { status: 400 })
  }

  // Call AI service (OpenAI, Anthropic, or local)
  const results = await aiSearchService(query, packages)

  return NextResponse.json({
    packages: results.packageIds,
    explanation: results.explanation,
    confidence: results.confidence
  })
}
```

**Response Handling:**
```typescript
// hooks/useAISearch.ts
export function useAISearch() {
  const [isSearching, setIsSearching] = useState(false)
  const [results, setResults] = useState<AISearchResult | null>(null)

  const search = async (query: string) => {
    setIsSearching(true)
    try {
      const response = await fetch('/api/ai/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      })
      const data = await response.json()
      setResults(data)
      return data
    } finally {
      setIsSearching(false)
    }
  }

  return { search, isSearching, results }
}
```

### 3.5 Edge Cases & Fallbacks

| Scenario | Behavior |
|----------|----------|
| AI returns no results | Show "No packages found. Try different keywords." |
| AI service down | Gracefully degrade to standard search |
| Ambiguous query | Show "Try being more specific" hint |
| Low confidence | Show results but label as "Possible matches" |

---

## 4. Landing Page Design

### 4.1 Messaging: Speed & Efficiency

**Core Value Proposition:**
```
"Set Up Windows in Minutes"
"One command installs everything"
"5 minutes vs 5 hours"
```

### 4.2 Hero Section

```tsx
// app/page.tsx - Hero
<section className="relative min-h-screen flex items-center justify-center">
  <div className="max-w-4xl text-center px-6">
    {/* Badge */}
    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-950/50 border border-cyan-500/20 mb-8">
      <Zap className="h-4 w-4 text-cyan-400" />
      <span className="text-sm font-medium text-cyan-400">Now: oneCommandSetup</span>
    </div>

    {/* Headline */}
    <h1 className="text-6xl font-bold tracking-tight mb-6">
      Set Up Windows
      <span className="block bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
        in Minutes
      </span>
    </h1>

    {/* Subheadline */}
    <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
      One command installs everything. Skip the installer clicking.
    </p>

    {/* CTA */}
    <div className="flex items-center justify-center gap-4">
      <Link href="/app" className="btn-primary">
        Start Installing
        <ArrowRight className="ml-2 h-5 w-5" />
      </Link>
      <a href="https://github.com" target="_blank" className="btn-secondary">
        <Github className="mr-2 h-5 w-5" />
        View Source
      </a>
    </div>

    {/* Social Proof */}
    <div className="mt-12 flex items-center justify-center gap-8 text-sm text-muted-foreground">
      <div className="flex items-center gap-2">
        <Package className="h-5 w-5" />
        <span>500+ Packages</span>
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
```

### 4.3 Features Section

**Grid Layout:**
```tsx
<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
  {/* Feature 1: Lightning Fast */}
  <FeatureCard
    icon={<Zap className="h-6 w-6 text-cyan-400" />}
    title="Lightning Fast"
    description="Install 50+ apps in the time it takes to install one manually. Winget handles everything."
  />

  {/* Feature 2: Official Sources */}
  <FeatureCard
    icon={<Shield className="h-6 w-6 text-emerald-400" />}
    title="Official Sources"
    description="Every package from the official publisher via Microsoft's winget repository."
  />

  {/* Feature 3: Presets */}
  <FeatureCard
    icon={<Bookmark className="h-6 w-6 text-purple-400" />}
    title="Save & Share"
    description="Create presets for your team. Quick-restore your environment on any machine."
  />
</div>
```

### 4.4 How It Works Section

**Three-Step Process:**
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   1. Browse  │ → │  2. Generate │ → │  3. Install  │
│             │    │             │    │             │
│ Select apps │    │ Copy command│    │ Paste & done│
└─────────────┘    └─────────────┘    └─────────────┘
```

### 4.5 Performance Metrics

**Dynamic Counter:**
```tsx
// components/MetricCounter.tsx
export function MetricCounter() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    // Animate from 0 to 500
    const duration = 2000
    const steps = 60
    const increment = 500 / steps
    const interval = duration / steps

    const timer = setInterval(() => {
      setCount(prev => {
        if (prev >= 500) {
          clearInterval(timer)
          return 500
        }
        return prev + increment
      })
    }, interval)

    return () => clearInterval(timer)
  }, [])

  return (
    <div className="text-center">
      <div className="text-5xl font-bold text-cyan-400">
        {Math.round(count)}+
      </div>
      <div className="text-muted-foreground mt-2">
        Packages Available
      </div>
    </div>
  )
}
```

---

## 5. App Architecture

### 5.1 Layout Structure

```
┌────────────────────────────────────────────────────┐
│                    Navbar                          │
│  [Logo] [Search + AI Toggle]        [Theme] [App] │
├────────────────────────────────────────────────────┤
│                                                    │
│  ┌──────────┬──────────────────────────────────┐  │
│  │          │                                   │  │
│  │ Sidebar  │         Catalog                   │  │
│  │          │  ┌─────┐ ┌─────┐ ┌─────┐         │  │
│  │ Filters │  │Card │ │Card │ │Card │ ...     │  │
│  │          │  └─────┘ └─────┘ └─────┘         │  │
│  │ Categories│   (Virtual Scrolling)            │  │
│  │          │                                   │  │
│  │ Presets  │                                   │  │
│  │          │                                   │  │
│  └──────────┴───────────────────────────────────┘  │
│                                                    │
│                   Footer                           │
└────────────────────────────────────────────────────┘
```

### 5.2 Component Hierarchy

```
app/app/page.tsx
├── Navbar
│   ├── Logo
│   ├── SearchBar (with AI toggle)
│   ├── ThemeToggle
│   └── CommandButton
├── Main
│   ├── Sidebar
│   │   ├── CategoryFilter
│   │   ├── PresetManager
│   │   └── SelectionSummary
│   └── Catalog
│       └── VirtualList
│           └── PackageCard[]
└── Footer
```

### 5.3 State Management (Zustand)

**Store Structure:**
```typescript
// store/useAppStore.ts
interface AppStore {
  // Selection state
  selectedIds: string[]
  togglePackage: (id: string) => void
  clearSelection: () => void

  // Filter state
  selectedCategory: string | null
  searchQuery: string
  aiEnabled: boolean

  // UI state
  sidebarOpen: boolean
  theme: 'light' | 'dark'

  // Computed
  filteredPackages: Package[]
  selectedCount: number
  installScript: string
}
```

---

## 6. Component Specifications

### 6.1 PackageCard Redesign

```tsx
// components/PackageCard.tsx
export function PackageCard({ package: pkg, isSelected, onSelect }: PackageCardProps) {
  return (
    <div
      className={cn(
        "package-card group cursor-pointer",
        isSelected && "ring-2 ring-cyan-500"
      )}
      onClick={() => onSelect(pkg.id)}
    >
      {/* Header: Icon + Name */}
      <div className="flex items-start gap-4">
        <PackageIcon package={pkg} size={48} className="flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg truncate">{pkg.name}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {pkg.description}
          </p>
        </div>
        <Checkbox checked={isSelected} />
      </div>

      {/* Footer: Category + Badge */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
        <Badge variant="secondary">{pkg.category}</Badge>
        {pkg.license && (
          <span className="text-xs text-muted-foreground">{pkg.license}</span>
        )}
      </div>
    </div>
  )
}
```

### 6.2 SearchBar with AI Toggle

```tsx
// components/SearchBar.tsx
export function SearchBar() {
  const { searchQuery, setSearchQuery, aiEnabled, setAiEnabled } = useAppStore()
  const [inputValue, setInputValue] = useState(searchQuery)

  const debouncedSearch = useMemo(
    () => debounce((value: string) => setSearchQuery(value), 300),
    []
  )

  useEffect(() => {
    debouncedSearch(inputValue)
  }, [inputValue])

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && aiEnabled) {
      // Trigger AI search
      triggerAISearch(inputValue)
    }
  }

  return (
    <div className="relative">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={aiEnabled ? "Describe what you need..." : "Search packages..."}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="pl-10"
          />
        </div>

        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 border border-border">
          <Sparkles className={cn(
            "h-4 w-4 transition-colors",
            aiEnabled ? "text-cyan-400" : "text-muted-foreground"
          )} />
          <Switch
            checked={aiEnabled}
            onCheckedChange={setAiEnabled}
            aria-label="Enable AI search"
          />
        </div>
      </div>

      {aiEnabled && (
        <p className="text-xs text-muted-foreground mt-2">
          Press Enter to search with AI
        </p>
      )}
    </div>
  )
}
```

### 6.3 Navbar Redesign

```tsx
// components/Navbar.tsx
export function Navbar() {
  const { selectedCount } = useAppStore()

  return (
    <nav className="sticky top-4 z-50 mx-4">
      <div className="max-w-7xl mx-auto">
        <div className="glass rounded-xl px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="h-10 w-10 bg-gradient-to-br from-cyan-500 to-emerald-500 rounded-lg flex items-center justify-center">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <span className="font-bold text-xl">OCS</span>
          </Link>

          {/* Search */}
          <div className="flex-1 max-w-xl mx-8">
            <SearchBar />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <CommandModal>
              <Button variant={selectedCount > 0 ? "default" : "outline"}>
                <Terminal className="mr-2 h-4 w-4" />
                {selectedCount > 0 ? `Install ${selectedCount}` : "Command"}
              </Button>
            </CommandModal>
          </div>
        </div>
      </div>
    </nav>
  )
}
```

---

## 7. API Integration

### 7.1 Package Icon Service

**Endpoint:** `GET /api/packages/icons`

**Response:**
```json
{
  "icons": {
    "Microsoft.VisualStudioCode": "<svg>...</svg>",
    "Google.Chrome": "<svg>...</svg>"
  }
}
```

**Implementation:**
```typescript
// app/api/packages/icons/route.ts
import { icons } from '@/lib/brand-icons'

export async function GET() {
  return NextResponse.json({ icons })
}
```

### 7.2 AI Search Integration

**Endpoint:** `POST /api/ai/search`

**Request:**
```json
{
  "query": "web development tools"
}
```

**Response:**
```json
{
  "packages": ["Git.Git", "Microsoft.VisualStudioCode", "OpenJS.NodeJS.LTS"],
  "explanation": "Found essential tools for web development including version control, code editor, and runtime.",
  "confidence": 0.92
}
```

**Implementation:**
```typescript
// app/api/ai/search/route.ts
export async function POST(request: NextRequest) {
  const { query } = await request.json()

  // Load packages
  const packages = await getAllPackages()

  // Call AI service
  const aiResult = await aiService.searchPackages(query, packages)

  // Return filtered package IDs
  return NextResponse.json({
    packages: aiResult.packageIds,
    explanation: aiResult.explanation,
    confidence: aiResult.confidence
  })
}
```

### 7.3 Preset Sharing via URL

**URL Format:**
```
/app?preset=fullstack-dev
/app?packages=Git.Git,VSCode,NodeJS
```

**Implementation:**
```typescript
// hooks/usePresetFromURL.ts
export function usePresetFromURL() {
  const searchParams = useSearchParams()
  const presetId = searchParams.get('preset')
  const packageIds = searchParams.get('packages')?.split(',')

  useEffect(() => {
    if (presetId) {
      const preset = getPresetById(presetId)
      if (preset) {
        selectPackages(preset.packageIds)
      }
    } else if (packageIds) {
      selectPackages(packageIds)
    }
  }, [presetId, packageIds])
}
```

---

## 8. Team Responsibilities

### Team 1: UI/UX Redesign

**Scope:**
- Landing page redesign
- App layout restructure
- Component redesign
- Responsive polish
- Accessibility improvements

**Deliverables:**
1. Redesigned landing page at `/app/page.tsx`
2. New navbar, sidebar, and catalog layout
3. Redesigned PackageCard with brand icon integration
4. SearchBar with AI toggle UI
5. Mobile-responsive breakpoints
6. Accessibility audit fixes

**Files to Modify:**
- `app/page.tsx` (landing page)
- `app/app/layout.tsx` (app layout)
- `components/Navbar.tsx`
- `components/Sidebar.tsx`
- `components/Catalog.tsx`
- `components/PackageCard.tsx`
- `components/SearchBar.tsx`
- `app/globals.css` (design system tokens)

**Success Criteria:**
- Lighthouse Performance > 90
- Lighthouse Accessibility > 90
- Visual consistency across all pages
- Smooth 60fps animations
- Mobile-responsive at 375px, 768px, 1024px

### Team 2: Backend Integration

**Scope:**
- Package icon service
- AI search API integration
- Package metadata enrichment
- Virtual scrolling implementation
- URL preset sharing

**Deliverables:**
1. Brand icon library build script with DOMPurify sanitization
2. PackageIcon component
3. AI search API integration
4. Virtual scrolling for Catalog
5. URL-based preset sharing
6. Enhanced package data with brandSlug

**Files to Modify:**
- `scripts/build-brand-icons.ts` (new)
- `lib/brand-icons.ts` (new)
- `components/PackageIcon.tsx` (new)
- `components/OCSIcon.tsx` (new)
- `app/api/packages/icons/route.ts` (new)
- `app/api/ai/search/route.ts`
- `data/packages.json` (add brandSlug field)
- `components/Catalog.tsx` (add virtual scrolling)
- `hooks/usePresetFromURL.ts` (new)

**Success Criteria:**
- All packages have icons (brand or fallback)
- AI search returns relevant results
- Virtual scrolling handles 500+ packages smoothly
- URL sharing works correctly
- All SVGs sanitized with DOMPurify

### Team 3: Backend QA & Fixes

**Scope:**
- Security audit
- Performance optimization
- API route testing
- Error handling
- Rate limiting

**Deliverables:**
1. Security vulnerability fixes
2. API route unit tests
3. Response caching implementation
4. Rate limiting for AI endpoints
5. Error handling improvements
6. Performance benchmarks

**Files to Modify:**
- `app/api/packages/route.ts` (pagination, caching)
- `app/api/ai/search/route.ts` (rate limiting)
- `lib/__tests__/` (add API tests)
- `lib/packageValidator.ts` (security fixes)
- `lib/scriptBuilder.ts` (security fixes)

**Success Criteria:**
- All security tests passing
- API routes have unit tests
- Response time < 200ms for package queries
- Rate limiting prevents abuse
- Error messages are user-friendly

### Coordinator

**Responsibilities:**
- Write and maintain design document (this document)
- Create implementation plan
- Review team deliverables
- Resolve conflicts between teams
- Final integration and QA
- Success criteria validation

---

## 9. Success Criteria

### 9.1 Visual Design
- [ ] Design system implemented consistently
- [ ] All components use proper color tokens
- [ ] Dark/light mode both polished
- [ ] Animations smooth at 60fps
- [ ] Mobile-responsive at all breakpoints

### 9.2 Package Icons
- [ ] 100% of packages have icons (brand or fallback)
- [ ] Icons load without external requests
- [ ] Icons scale properly at all sizes
- [ ] Brand icons are accurate and up-to-date
- [ ] All SVGs sanitized with DOMPurify at build time

### 9.3 AI Integration
- [ ] AI toggle appears in search bar
- [ ] AI search returns relevant results
- [ ] Graceful fallback when AI is down
- [ ] Clear explanation of AI results
- [ ] Input validation prevents abuse

### 9.4 Landing Page
- [ ] Speed-focused messaging clear
- [ ] CTA prominent and compelling
- [ ] Social proof visible
- [ ] Performance metrics animated

### 9.5 Performance
- [ ] Lighthouse Performance > 90
- [ ] Lighthouse Accessibility > 90
- [ ] Lighthouse SEO > 90
- [ ] First Contentful Paint < 1.5s
- [ ] Time to Interactive < 3s

### 9.6 Code Quality
- [ ] All tests passing
- [ ] No console errors
- [ ] TypeScript no errors
- [ ] ESLint passing
- [ ] Accessibility audit passing
- [ ] Security audit passing

---

## 10. Technical Considerations

### 10.1 Performance Optimization

**Virtual Scrolling:**
```typescript
// Use @tanstack/react-virtual
import { useVirtualizer } from '@tanstack/react-virtual'

const virtualizer = useVirtualizer({
  count: filteredPackages.length,
  getScrollElement: () => parentRef.current,
  estimateSize: () => 200,
  overscan: 5
})
```

**Image Optimization:**
- Icons are inline SVG (no additional requests)
- Lazy load package details on-demand
- Progressive enhancement for icons

**Code Splitting:**
```typescript
// Dynamic imports for heavy components
const CommandModal = dynamic(() => import('./CommandModal'), {
  loading: () => <Skeleton />
})
```

### 10.2 Security

**Input Validation:**
```typescript
// Validate package IDs
function validatePackageId(id: string): boolean {
  return /^[a-zA-Z0-9.-]+$/.test(id) && id.length < 100
}

// Validate AI search queries
function validateQuery(query: string): boolean {
  return typeof query === 'string' && query.length > 0 && query.length <= 500
}
```

**Rate Limiting:**
```typescript
// Rate limit AI endpoint
import { Ratelimit } from '@upstash/ratelimit'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '1 m')
})
```

**XSS Prevention:**
- All user input escaped
- SVGs sanitized at build time with DOMPurify
- dangerouslySetInnerHTML only for sanitized SVGs
- CSP headers configured

### 10.3 Accessibility

**ARIA Labels:**
```tsx
<Button aria-label="Toggle AI search">
  <Sparkles />
</Button>
```

**Keyboard Navigation:**
- Tab order matches visual order
- Enter/Space for activations
- Escape to close modals
- Arrow keys for list navigation

**Focus Management:**
- Visible focus indicators
- Focus trapped in modals
- Focus returned after modal close

### 10.4 Browser Support

**Target Browsers:**
- Chrome/Edge: Last 2 versions
- Firefox: Last 2 versions
- Safari: Last 2 versions

**Progressive Enhancement:**
- Core functionality works without JS
- Enhanced experience with JS
- Fallbacks for unsupported features

---

## Conclusion

This design transforms WinSetup into **oneCommandSetup (OCS)**, a premium, modern developer tool that respects users' time and attention. The focus on speed, efficiency, and subtle AI assistance creates a differentiated product in the Windows package management space.

**Next Steps:**
1. Create detailed implementation plan using writing-plans skill
2. Set up agent teams with tmux sessions (user handles)
3. Execute parallel work streams
4. Coordinate integration and QA
5. Deploy and validate success criteria

---

**Document Version:** 1.0
**Last Updated:** 2025-03-18
**Status:** Approved for Implementation
