# WinSetup Premium - Test Implementation Plan

**Date:** 2026-03-18
**Priority:** HIGH - Security tests are critical

---

## Phase 1: Critical Security Tests (Week 1)

### 1.1 Library Unit Tests

**Priority: CRITICAL**

#### lib/scriptBuilder.ts ✅ CREATED
- [x] `escapePowerShell()` - Command injection prevention
- [x] `buildInstallScript()` - Script generation security
- [x] `buildCliScript()` - CLI script security
- [x] Edge cases for special characters
- [x] SQL/Command injection attempts

#### lib/packageValidator.ts ✅ CREATED
- [x] `validatePackageIds()` - Input validation
- [x] `isValidPackageId()` - ID format checking
- [x] MAX_IDS boundary testing
- [x] MAX_ID_LENGTH boundary testing
- [x] Sanitization logic
- [x] Injection attempt handling

### 1.2 API Route Tests (New)

**Priority: CRITICAL**

Create `/app/api/__tests__/` directory structure:

```
app/api/__tests__/
├── packages.test.ts
├── install.test.ts
├── cli.test.ts
├── presets.test.ts
└── ai.test.ts
```

#### app/api/packages/route.test.ts
```typescript
describe('GET /api/packages', () => {
  it('should return all packages by default')
  it('should filter by category')
  it('should filter by popular')
  it('should search by name')
  it('should search by ID')
  it('should search by description')
  it('should search by tags')
  it('should respect limit parameter')
  it('should combine multiple filters')
  it('should return 404 for non-existent [id]')
  it('should set cache headers')
  it('should handle SQL injection in search')
  it('should handle XSS in search')
})
```

#### app/api/install.ps1/route.test.ts
```typescript
describe('GET /api/install.ps1', () => {
  it('should generate valid PowerShell script')
  it('should escape package IDs in script')
  it('should handle single package')
  it('should handle multiple packages')
  it('should warn about invalid IDs')
  it('should return error for empty apps param')
  it('should set content-type to text/plain')
  it('should prevent cache')
  it('should handle command injection in package IDs')
  it('should enforce MAX_IDS limit')
  it('should handle very long package IDs')
  it('should sanitize special characters')
})
```

#### app/api/cli.ps1/route.test.ts
```typescript
describe('GET /api/cli.ps1', () => {
  it('should return CLI installer script')
  it('should include base URL')
  it('should be a valid PowerShell script')
  it('should set content-type to text/plain')
})
```

#### app/api/presets/route.test.ts
```typescript
describe('GET /api/presets', () => {
  it('should return built-in presets')
  it('should return presets as JSON')
  it('should set cache headers')
})
```

#### app/api/ai/recommend/route.test.ts
```typescript
describe('POST /api/ai/recommend', () => {
  it('should return mock recommendations when no API key')
  it('should call OpenRouter API when configured')
  it('should fall back on error')
  it('should validate limit parameter (1-20)')
  it('should handle invalid JSON')
  it('should set no-cache headers')
  it('should indicate mock response in headers')
  it('should exclude already selected packages')
  it('should filter by category when specified')
})
```

---

## Phase 2: Store Tests (Week 2)

### 2.1 Selection Store Tests

**Priority: HIGH**

Create `/store/__tests__/selection.test.ts`:

```typescript
describe('SelectionStore', () => {
  describe('initial state', () => {
    it('should start with empty selection')
    it('should have count of 0')
  })

  describe('togglePackage', () => {
    it('should add package when not selected')
    it('should remove package when already selected')
    it('should update count correctly')
    it('should handle rapid toggles')
    it('should persist to localStorage')
  })

  describe('isSelected', () => {
    it('should return true for selected packages')
    it('should return false for unselected packages')
  })

  describe('clearAll', () => {
    it('should clear all selections')
    it('should reset count to 0')
    it('should persist to localStorage')
  })

  describe('loadPreset', () => {
    it('should load preset packages')
    it('should replace current selection')
    it('should handle empty preset')
    it('should handle duplicate IDs in preset')
    it('should persist to localStorage')
  })

  describe('localStorage persistence', () => {
    it('should save state to localStorage')
    it('should restore state from localStorage')
    it('should handle corrupted localStorage')
    it('should handle localStorage quota exceeded')
    it('should handle disabled localStorage')
  })

  describe('Set serialization', () => {
    it('should serialize Set to Array')
    it('should deserialize Array to Set')
    it('should maintain Set semantics')
  })
})
```

### 2.2 Presets Store Tests

Create `/store/__tests__/presets.test.ts`:

```typescript
describe('PresetsStore', () => {
  describe('initial state', () => {
    it('should start with empty custom presets')
  })

  describe('savePreset', () => {
    it('should add new preset')
    it('should update preset with same ID')
    it('should persist to localStorage')
    it('should handle preset with no package IDs')
  })

  describe('deletePreset', () => {
    it('should remove preset by ID')
    it('should persist to localStorage')
    it('should handle non-existent ID')
  })

  describe('getPreset', () => {
    it('should return preset by ID')
    it('should return undefined for non-existent')
  })

  describe('localStorage persistence', () => {
    it('should save state to localStorage')
    it('should restore state from localStorage')
    it('should handle corrupted localStorage')
    it('should handle localStorage quota exceeded')
  })
})
```

---

## Phase 3: Component Tests (Week 2-3)

### 3.1 CategoryFilter Tests

Create `/components/__tests__/CategoryFilter.test.tsx`:

```typescript
describe('CategoryFilter', () => {
  it('should render all category buttons')
  it('should highlight active category')
  it('should call onCategoryChange when clicked')
  it('should display package count per category')
  it('should be keyboard accessible')
  it('should have proper aria-labels')
  it('should handle categories with no packages')
})
```

### 3.2 CommandModal Tests

Create `/components/__tests__/CommandModal.test.tsx`:

```typescript
describe('CommandModal', () => {
  it('should display generated command')
  it('should have copy button')
  it('should copy to clipboard on button click')
  it('should close on close button click')
  it('should close on Escape key')
  it('should show install command for PowerShell')
  it('should show install command for CLI')
  it('should handle zero selected packages')
  it('should have focus trap')
  it('should have aria-modal="true"')
})
```

### 3.3 Sidebar Tests

Create `/components/__tests__/Sidebar.test.tsx`:

```typescript
describe('Sidebar', () => {
  it('should render navigation links')
  it('should highlight current page')
  it('should toggle on mobile')
  it('should be collapsible')
  it('should display logo')
  it('should have skip link')
  it('should be keyboard accessible')
})
```

### 3.4 ThemeToggle Tests

Create `/components/__tests__/ThemeToggle.test.tsx`:

```typescript
describe('ThemeToggle', () => {
  it('should toggle between light and dark')
  it('should persist theme preference')
  it('should respect system preference initially')
  it('should have aria-label')
  it('should be keyboard accessible')
  it('should prevent flash of wrong theme')
})
```

### 3.5 Catalog Tests

Create `/components/__tests__/Catalog.test.tsx`:

```typescript
describe('Catalog', () => {
  it('should render all packages')
  it('should filter by search query')
  it('should filter by category')
  it('should show empty state for no results')
  it('should show loading state')
  it('should render package cards')
  it('should debounce search input')
  it('should handle API errors')
  it('should virtualize long lists (if implemented)')
})
```

---

## Phase 4: Integration Tests (Week 3-4)

### 4.1 State Integration Tests

Create `/tests/integration/state.test.tsx`:

```typescript
describe('State Integration', () => {
  it('should sync package selection across components')
  it('should update count when packages selected')
  it('should clear selection from all components')
  it('should load preset and update all views')
  it('should persist state across page navigation')
  it('should restore state after refresh')
})
```

### 4.2 API Integration Tests

Create `/tests/integration/api.test.ts`:

```typescript
describe('API Integration', () => {
  it('should fetch and display packages')
  it('should handle API errors gracefully')
  it('should retry failed requests')
  it('should cache package data')
  it('should refresh cache when needed')
})
```

### 4.3 Workflow Tests

Create `/tests/integration/workflows.test.ts`:

```typescript
describe('User Workflows', () => {
  it('should complete: search → select → generate command')
  it('should complete: load preset → modify → save preset')
  it('should complete: select packages → share URL')
  it('should complete: select category → filter → select package')
  it('should complete: clear selection → select new packages')
  it('should recover from: API failure during search')
  it('should recover from: localStorage quota exceeded')
})
```

---

## Phase 5: Performance & Accessibility (Week 4)

### 5.1 Performance Tests

Create `/tests/performance/performance.test.ts`:

```typescript
describe('Performance', () => {
  it('should render 100 packages in under 1s')
  it('should filter 100 packages in under 100ms')
  it('should not leak memory over time')
  it('should debounce search input appropriately')
  it('should virtualize long lists')
  it('should lazy load images')
  it('should have bundle size under target')
})
```

### 5.2 Accessibility Tests (Expand)

Add to `/tests/e2e/a11y.spec.ts`:

```typescript
describe('Extended Accessibility', () => {
  it('should work with NVDA screen reader')
  it('should work in high contrast mode')
  it('should work with 200% font scaling')
  it('should respect prefers-reduced-motion')
  it('should have visible focus indicators at all times')
  it('should announce dynamic content changes')
  it('should have skip links implemented')
  it('should have proper heading hierarchy throughout')
})
```

---

## Phase 6: Visual Regression (Optional)

### 6.1 Setup

Consider adding Percy or Chromatic for visual testing:

```bash
npm install -D @percy/playwright
# or
npm install -D chromatic
```

### 6.2 Test Components

Create `/tests/visual/visual.spec.ts`:

```typescript
describe('Visual Regression', () => {
  it('should match PackageCard screenshot')
  it('should match SearchBar screenshot')
  it('should match full catalog screenshot')
  it('should match modal screenshot')
  it('should match mobile screenshot')
  it('should match dark mode screenshot')
})
```

---

## Implementation Order

### Week 1: Security First
1. ✅ lib/scriptBuilder.test.ts
2. ✅ lib/packageValidator.test.ts
3. app/api/install.ps1/route.test.ts
4. app/api/packages/route.test.ts

### Week 2: State & Core Components
5. store/selection.test.ts
6. store/presets.test.ts
7. components/CategoryFilter.test.tsx
8. components/CommandModal.test.tsx

### Week 3: Remaining Components
9. components/Sidebar.test.tsx
10. components/ThemeToggle.test.tsx
11. components/Catalog.test.tsx
12. tests/integration/workflows.test.ts

### Week 4: Polish & Coverage
13. tests/performance/performance.test.ts
14. Expand accessibility tests
15. API route tests for remaining endpoints
16. Coverage verification (target 80%)

---

## Test Configuration Updates

### Update vitest.config.ts

Add coverage thresholds:

```typescript
coverage: {
  provider: 'v8',
  reporter: ['text', 'json', 'html'],
  include: ['app/**/*.{ts,tsx}', 'components/**/*.{ts,tsx}', 'lib/**/*.{ts,tsx}', 'store/**/*.{ts,tsx}'],
  exclude: ['**/*.d.ts', '**/*.config.{ts,js}', '**/node_modules/**'],
  thresholds: {
    lines: 80,
    functions: 80,
    branches: 75,
    statements: 80,
  },
}
```

### Add Test Scripts to package.json

```json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage",
    "test:watch": "vitest --watch",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:all": "npm run test:run && npm run test:e2e"
  }
}
```

---

## Success Metrics

| Metric | Current | Target |
|--------|---------|--------|
| Unit Test Coverage | ~30% | 80% |
| Critical Security Tests | 0% | 100% |
| API Route Tests | 0% | 100% |
| Store Tests | 0% | 100% |
| Component Tests | 60% | 100% |
| Integration Tests | 0% | 80% |
| Accessibility Violations | 0 | 0 |

---

## Notes

1. **Security tests are the highest priority** - the script generation function handles user input that becomes executable code
2. **API route tests should use MSW** for mocking external dependencies
3. **Store tests need special handling** for localStorage (already mocked in setup.ts)
4. **Consider adding contract testing** with Zod schemas for API validation
5. **Flaky tests should be addressed immediately** - they undermine confidence
6. **Test execution time** should stay under 5 minutes for full suite
