# WinSetup Testing Guide

## Overview

This document describes the comprehensive testing strategy for the WinSetup project. The testing framework covers unit tests, integration tests, component tests, end-to-end tests, and accessibility testing.

## Test Framework

- **Unit & Component Tests**: Vitest + React Testing Library
- **E2E Tests**: Playwright
- **Accessibility**: Axe-core with Playwright
- **Coverage**: Vitest Coverage (v8)

## Test Structure

```
tests/
├── setup.ts                           # Vitest configuration
├── e2e/                               # End-to-end tests
│   ├── catalog.spec.ts                # Main catalog functionality
│   ├── install-script.spec.ts         # Install script generation
│   ├── presets.spec.ts                # Preset management
│   ├── a11y.spec.ts                   # Accessibility tests
│   └── mobile.spec.ts                 # Mobile/responsive tests
├── lib/__tests__/                     # Utility function tests
│   ├── scriptBuilder.test.ts          # PowerShell script generation
│   ├── packageValidator.test.ts       # Package ID validation
│   └── utils.test.ts                  # Utility functions
├── store/__tests__/                   # Zustand store tests
│   ├── selection.test.ts              # Package selection store
│   └── presets.test.ts                # Preset management store
├── app/api/**/__tests__/              # API route tests
│   ├── packages/route.test.ts         # /api/packages endpoint
│   ├── install.ps1/route.test.ts      # /api/install.ps1 endpoint
│   └── cli.ps1/route.test.ts          # /api/cli.ps1 endpoint
└── components/__tests__/              # Component tests
    ├── PackageCard.test.tsx           # Package card component
    ├── SearchBar.test.tsx             # Search input component
    └── PresetManager.test.tsx         # Preset management component
```

## Running Tests

### All Tests
```bash
npm run test:all
```

### Unit & Component Tests
```bash
# Watch mode
npm run test

# Single run
npm run test:run

# With coverage
npm run test:coverage

# UI mode
npm run test:ui
```

### E2E Tests
```bash
# Run all E2E tests
npm run test:e2e

# Run with UI
npm run test:e2e:ui

# Debug mode
npm run test:e2e:debug

# Headed mode (see browser)
npm run test:e2e:headed
```

### Specific Test Suites
```bash
# Run specific test file
npx vitest lib/__tests__/scriptBuilder.test.ts

# Run E2E tests matching pattern
npx playwright test --grep "catalog"

# Run on specific browser
npx playwright test --project=chromium
npx playwright test --project=webkit
```

## Test Coverage

The test suite covers:

### Unit Tests
- ✅ PowerShell script generation (`buildInstallScript`, `buildCliScript`)
- ✅ Package ID validation with security tests
- ✅ Utility functions (`cn` className merger)
- ✅ Escape function security (command injection prevention)

### Integration Tests
- ✅ API route: `/api/packages` (filtering, searching, pagination)
- ✅ API route: `/api/install.ps1` (script generation, error handling)
- ✅ API route: `/api/cli.ps1` (CLI installer script)

### Component Tests
- ✅ PackageCard (selection, styling, accessibility)
- ✅ SearchBar (input, clear, keyboard shortcuts)
- ✅ PresetManager (save, load, custom presets)

### Store Tests
- ✅ SelectionStore (toggle, clear, persistence)
- ✅ PresetsStore (save, load, delete, persistence)

### E2E Tests
- ✅ Full user journey (browse, select, install)
- ✅ Keyboard navigation
- ✅ Mobile responsiveness
- ✅ Cross-browser compatibility
- ✅ Accessibility (WCAG 2.1 AA)
- ✅ Error handling

## Key Test Scenarios

### Security Testing
1. **Command Injection Prevention**
   - Tests PowerShell escape function against injection attempts
   - Validates special character handling: `` ` ``, `$`, `"`, `'`

2. **Input Validation**
   - Tests package ID format validation
   - Tests maximum limits (50 IDs, 100 chars per ID)
   - Tests sanitization of special characters

### Accessibility Testing
1. **Keyboard Navigation**
   - Tab order consistency
   - Focus indicators visible
   - Cmd+K / Ctrl+K shortcuts

2. **Screen Reader Support**
   - Semantic HTML structure
   - ARIA labels and roles
   - Live regions for dynamic content

3. **Color Contrast**
   - WCAG AA compliance (4.5:1 for text)
   - Focus state visibility

4. **Touch Targets**
   - Minimum 44x44px for buttons
   - Adequate spacing

### Performance Testing
1. **Large Dataset Handling**
   - 2000+ package rendering
   - Search/filter performance
   - Script generation speed

2. **Network Conditions**
   - Graceful degradation
   - Loading states
   - Error handling

### Cross-Browser Testing
- Chrome/Chromium
- Firefox
- Safari (WebKit)
- Mobile (iOS Safari, Chrome Mobile)
- Tablet (iPad)

## Writing New Tests

### Unit Test Example
```typescript
import { describe, it, expect } from 'vitest'
import { myFunction } from '../myModule'

describe('myFunction', () => {
  it('should return expected value', () => {
    expect(myFunction('input')).toBe('output')
  })
})
```

### Component Test Example
```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import { MyComponent } from '../MyComponent'

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />)
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })
})
```

### E2E Test Example
```typescript
import { test, expect } from '@playwright/test'

test('user flow', async ({ page }) => {
  await page.goto('/')
  await page.getByText('Click me').click()
  await expect(page.getByText('Success')).toBeVisible()
})
```

## Test Coverage Goals

- **Statements**: >80%
- **Branches**: >75%
- **Functions**: >80%
- **Lines**: >80%

## CI/CD Integration

The tests are designed to run in CI/CD pipelines:

```yaml
# Example GitHub Actions
- name: Install dependencies
  run: npm ci

- name: Run unit tests
  run: npm run test:coverage

- name: Run E2E tests
  run: npm run test:e2e

- name: Upload coverage
  run: npm run test:coverage -- --reporter=json
```

## Accessibility Testing

Automated accessibility tests use Axe-core with WCAG 2.1 AA rules:

```bash
# Run accessibility tests
npx playwright test a11y.spec.ts
```

Manual testing checklist:
- [ ] Keyboard navigation works entirely
- [ ] Screen reader announces changes
- [ ] Focus indicators are visible
- [ ] Color contrast meets WCAG AA
- [ ] Touch targets are 44x44px minimum
- [ ] Forms have proper labels

## Debugging Tests

### Unit Tests
```bash
# Run with inspector
node --inspect-brk node_modules/.bin/vitest

# Or use Vitest UI
npm run test:ui
```

### E2E Tests
```bash
# Debug mode
npm run test:e2e:debug

# Headed mode
npm run test:e2e:headed

# With browser inspector
npx playwright test --debug
```

## Common Issues

### Port Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### Browser Not Installed
```bash
# Install Playwright browsers
npx playwright install
```

### Flaky Tests
- Increase timeouts: `test.setTimeout(10000)`
- Use proper waits: `await page.waitForLoadState('networkidle')`
- Add retry logic: `test.retry(3)`

## Best Practices

1. **Test behavior, not implementation**
2. **Use data-testid selectors when necessary**
3. **Mock external dependencies**
4. **Test happy path and edge cases**
5. **Test error scenarios**
6. **Keep tests fast and isolated**
7. **Use descriptive test names**
8. **One assertion per test when possible**
9. **Clean up after tests**
10. **Test accessibility alongside functionality**

## Test Maintenance

- Review and update tests when features change
- Keep test data in fixtures
- Refactor duplicate test logic
- Monitor flaky tests
- Update test documentation

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Playwright Documentation](https://playwright.dev/)
- [Axe-core](https://www.deque.com/axe/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
