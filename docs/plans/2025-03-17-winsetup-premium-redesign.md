# WinSetup Premium Redesign - Design Document

**Date:** 2025-03-17
**Status:** Approved
**Version:** 1.0

## Executive Summary

Comprehensive redesign of WinSetup to include:
- **All winget packages** (2000+ curated packages)
- **Premium UX** with AI-first approach
- **Simple, cost-effective architecture** using JSON and client-side AI

---

## Architecture

### High-Level Design

```
┌─────────────────────────────────────────────────────────────────────┐
│                   NEXTJS 15 SIMPLE PLATFORM                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Frontend (Browser)                                                 │
│    ├── Package Catalog (enhanced with visual discovery)            │
│    ├── AI Assistant (client-side OpenRouter integration)           │
│    ├── Power Tools (bulk operations, CLI export)                   │
│    └── Community Hub (reviews, presets, sharing)                   │
│                                                                     │
│  API Layer (Simple)                                                 │
│    ├── /api/packages - Serve packages.json                         │
│    ├── /api/winget/sync - Trigger winget sync                      │
│    ├── /api/presets - Save/load community presets                  │
│    └── /api/install.ps1 - Generate install script                  │
│                                                                     │
│  Data Storage (JSON)                                                │
│    ├── /data/packages.json - All winget packages                   │
│    ├── /data/categories.json - Category metadata                   │
│    ├── /data/presets.json - Community presets                      │
│    └── /data/stats.json - Usage statistics                         │
│                                                                     │
│  External Integrations                                              │
│    ├── OpenRouter API (client-side) - AI models                    │
│    ├── Winget CLI - Package metadata                               │
│    └── GitHub API - Repo stars for social proof                    │
└─────────────────────────────────────────────────────────────────────┘
```

### Key Design Decisions

1. **No Database** - JSON files stored in repository
2. **No Redis** - Browser localStorage for caching
3. **No Vector DB** - Simple text search + AI filtering
4. **AI on Frontend** - Direct OpenRouter calls from browser
5. **Simple Sync** - Manual or GitHub Action to update packages.json

### Benefits

- **Zero infrastructure costs** - Just Vercel hosting
- **Easy to maintain** - No database migrations, no scaling issues
- **Fast development** - JSON files are easy to debug
- **Privacy-friendly** - AI calls from browser, data stays local
- **Scales to 10K+ packages** easily with JSON

---

## Data Model

### Package Structure

```typescript
interface Package {
  id: string                  // Winget ID: "Microsoft.VisualStudioCode"
  name: string                // Display name
  description: string         // Short description
  category: Category          // Category enum
  tags: string[]              // Searchable tags
  icon: string                // Emoji or icon URL
  popular: boolean            // Is popular?
  size?: string               // Download size
  version?: string            // Latest version
  publisher?: string          // Publisher name
  homepage?: string           // Website URL
  repository?: string         // GitHub repo URL
  license?: string            // License type
  screenshots?: string[]      // Screenshot URLs
  installs?: number           // Install count (tracked locally)
  rating?: number             // Average rating (0-5)
  lastUpdated: string         // ISO timestamp
  aliases?: string[]          // Alternative names for search
}
```

### Category Metadata

```typescript
interface CategoryMeta {
  id: string
  name: string
  icon: string
  description: string
  count: number
  color: string               // Theme color for UI
}
```

### Community Presets

```typescript
interface Preset {
  id: string
  name: string
  description: string
  icon: string
  tags: string[]
  packages: string[]          // Package IDs
  author: string
  createdAt: string
  installs: number
  featured: boolean
}
```

### Statistics

```typescript
interface Stats {
  totalPackages: number
  totalInstalls: number
  popularPackages: string[]   // Top 10 package IDs
  recentSync: string
  categories: Record<string, number>
}
```

---

## UI Components

### Enhanced Package Catalog

```typescript
// PackageCard with rich features
<PackageCard>
  ├── Screenshots carousel
  ├── Version history badge
  ├── Install count & rating
  ├── Quick compare button
  └── Dependency indicator
</PackageCard>

// PackageModal for detailed view
<PackageModal>
  ├── Full description
  ├── All screenshots
  ├── Reviews & ratings
  ├── Related packages
  └── Install command
</PackageModal>

// AI-powered search
<SearchBar>
  ├── Natural language input
  ├── Search suggestions
  └── AI filter toggle
</SearchBar>
```

### AI Assistant (New)

```typescript
// Client-side AI integration
<AIAssistant>
  ├── ChatInterface
  │   ├── Message history
  │   ├── Quick actions
  │   └── Package suggestions
  └── SmartRecommendations
      ├── "Because you installed X"
      ├── "Trending in category"
      └── "Popular this week"
</AIAssistant>
```

### Power Tools (New)

```typescript
<BulkSelector>
  ├── Select all in category
  ├── Select by tag
  └── Import from preset
</BulkSelector>

<CLIExport>
  ├── PowerShell script
  ├── Winget command
  └── Bash script
</CLIExport>

<PackageComparer>
  ├── Side-by-side view
  ├── Feature matrix
  └── Rating comparison
</PackageComparer>
```

### Community Hub (New)

```typescript
<PresetGallery>
  ├── Featured presets
  ├── Community presets
  └── Your presets
</PresetGallery>

<ReviewSection>
  ├── User reviews
  ├── Rating breakdown
  └── Submit review
</ReviewSection>

<ShareModal>
  ├── Share preset URL
  ├── Copy embed code
  └── Social share
</ShareModal>
```

---

## AI Integration

### Client-Side AI Architecture

```typescript
// lib/ai/client.ts
interface AIClient {
  // OpenRouter free models
  model: 'google/gemini-flash-1.5' | 'meta-llama/llama-3.1-8b'

  // AI Features
  recommendPackages(context: string): Promise<Package[]>
  naturalLanguageSearch(query: string): Promise<Package[]>
  generatePreset(description: string): Promise<Preset>
  explainPackage(packageId: string): Promise<string>
  comparePackages(packageIds: string[]): Promise<string>
}
```

### AI Features

1. **Smart Recommendations**
   - "Because you installed VS Code, you might like..."
   - Trending packages in your category
   - Popular packages this week

2. **Natural Language Search**
   - "I need a video editor for YouTube"
   - "Best database tools for PostgreSQL"
   - "Lightweight browser for old laptops"

3. **Preset Generation**
   - Describe your workflow → Get custom preset
   - "Web development starter pack"
   - "Gaming setup essentials"

4. **Package Comparison**
   - Compare features side-by-side
   - Get AI-written summaries
   - Recommendations based on use case

### Cost Management

- **Free models only** (Gemini Flash, Llama 3.1 8B)
- **Client-side calls** (no server costs)
- **Response caching** in localStorage
- **Rate limiting** to prevent abuse

---

## Winget Sync Strategy

### Sync Script Flow

```bash
# scripts/sync-winget.ts
1. Fetch all winget packages from winget source
2. Enrich with metadata:
   - GitHub stars (if repo available)
   - Latest version
   - Package size
   - License info
3. Filter quality:
   - Remove duplicates
   - Remove test packages
   - Keep active packages
4. Generate categories based on tags
5. Update packages.json
6. Commit to git with changelog
```

### Trigger Options

1. **GitHub Action** - Runs daily automatically
2. **Manual API call** - POST /api/winget/sync
3. **Local script** - npm run sync-winget

### Package Quality Filters

- Minimum: 100+ installs or verified publisher
- Exclude: Test packages, beta versions
- Include: All stable packages from official sources

---

## Implementation Phases

### Phase 1: Foundation (Week 1)
- [ ] Set up new JSON data structure
- [ ] Winget sync script
- [ ] Enhanced PackageCard component
- [ ] Screenshot support

### Phase 2: AI Integration (Week 2)
- [ ] OpenRouter client (browser-side)
- [ ] AI chat interface
- [ ] Smart recommendations
- [ ] Natural language search

### Phase 3: Visual Discovery (Week 3)
- [ ] Package comparison modal
- [ ] Enhanced filtering
- [ ] Visual search results
- [ ] Category improvements

### Phase 4: Power Tools (Week 4)
- [ ] Bulk selector
- [ ] CLI export options
- [ ] Keyboard shortcuts
- [ ] Advanced presets

### Phase 5: Community (Week 5)
- [ ] Reviews & ratings
- [ ] Community presets
- [ ] Share functionality
- [ ] Social features

---

## Technology Stack

### Frontend
- Next.js 15 (React 19, TypeScript 5)
- Tailwind CSS v4
- shadcn/ui components
- Zustand (state management)
- Lucide React (icons)

### AI/ML
- OpenRouter API (free models)
- Google Gemini Flash 1.5
- Meta Llama 3.1 8B

### Backend
- Next.js API Routes
- JSON file storage
- GitHub Actions (sync)

### Deployment
- Vercel (hosting)
- GitHub (code & data)

---

## Success Metrics

### User Engagement
- Preset creation rate
- AI assistant usage
- Package selection rate

### Technical
- Page load time < 2s
- AI response time < 3s
- Sync time < 5min

### Growth
- Total packages indexed: 2000+
- Community presets: 100+
- Monthly active users

---

## Open Questions

1. **Screenshots:** How to fetch and store? Vercel Blob or external URLs?
2. **Ratings:** Local only or integrate with external sources?
3. **Rate limiting:** How to prevent OpenRouter abuse?
4. **Presets:** Public sharing or user accounts?

---

## Next Steps

1. Create detailed implementation plan
2. Set up agent team for development
3. Begin Phase 1: Foundation
