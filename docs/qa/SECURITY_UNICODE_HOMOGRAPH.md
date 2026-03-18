# Security Vulnerability: Unicode Homograph Attack

**Severity:** P1 - HIGH
**Discovered:** 2026-03-18
**Status:** Open - Fix Required

## Description

The package validator silently strips non-ASCII characters from package IDs during sanitization. This allows Unicode homograph attacks where visually similar characters are used to trick users.

## Vulnerability Details

### Current Behavior
```typescript
// lib/packageValidator.ts line 16
const sanitized = id.replace(/[^A-Za-z0-9._-]/g, "")
```

This regex removes ALL non-ASCII characters, including:
- Unicode letters (e.g., Cyrillic, Greek, CJK)
- Emoji
- Special symbols

### Attack Vector
```typescript
// Attacker provides:
validatePackageIds(['GіtHub.Git'], ['GitHub.Git'])
// Note: 'і' is U+0456 (Cyrillic) not U+0069 (Latin 'i')

// After sanitization: 'GitHub.Git' (matches catalog!)
// Result: { valid: ['GitHub.Git'], invalid: [] }

// User sees: "GіtHub.Git" (looks like GitHub)
// Actually installs: GitHub.Git (if attacker also swaps the dot part)
```

### Real-World Impact
1. **Confusion Attacks:** Users can't distinguish between legitimate and malicious packages
2. **Supply Chain Substitution:** Attacker substitutes similar-looking packages
3. **Brand Impersonation:** Use of homographs for well-known publishers

## Examples of Homograph Characters

| Character | Code Point | Homograph For | Visual |
|-----------|------------|---------------|--------|
| і (Cyrillic) | U+0456 | i (Latin) | і vs i |
| о (Cyrillic) | U+043E | o (Latin) | о vs o |
| а (Cyrillic) | U+0430 | a (Latin) | а vs a |
| е (Cyrillic) | U+0435 | e (Latin) | е vs e |
| р (Cyrillic) | U+0440 | p (Latin) | р vs p |

### Attack Scenario
```
Attacker creates: "Microsoft®.VSCode"
  → Sanitizes to: "Microsoft.VSCode"
  → If "Microsoft.VSCode" exists in catalog, it passes!
  → User sees: "Microsoft®.VSCode" (looks official)
  → Could trick user into thinking it's the official package
```

## Recommended Fix

### Option 1: Reject Non-ASCII (Recommended)
```typescript
function sanitizePackageId(id: string): string | null {
  // Reject if contains non-ASCII characters
  if (/[^\x00-\x7F]/.test(id)) {
    return null; // or throw error
  }
  return id.replace(/[^A-Za-z0-9._-]/g, "")
}

// In validatePackageIds:
const sanitized = sanitizePackageId(id)
if (sanitized === null) {
  // Reject with error: "Package ID contains invalid characters"
  continue
}
```

### Option 2: Preserve Original for Display
```typescript
interface ValidationResult {
  valid: string[]
  invalid: string[]
  warnings: string[]  // New field for security warnings
}

// If sanitization changed the ID, add warning:
if (id !== sanitized) {
  warnings.push(`"${id}" was sanitized to "${sanitized}"`)
}
```

### Option 3: Whitelist Approach
```typescript
// Only allow specific character ranges
const ID_REGEX = /^[\x00-\x7F]*$/  // ASCII only
if (!ID_REGEX.test(id)) {
  invalid.push(id)
  continue
}
```

## Implementation Priority

**P1 - HIGH** (Fix before production use)

1. Add ASCII-only validation
2. Add tests for Unicode homograph detection
3. Consider adding user-facing warnings when IDs are sanitized
4. Document the security decision in code comments

## Testing

Current tests in `lib/__tests__/packageValidator.test.ts` verify this behavior exists:

```typescript
it('should handle unicode characters - SECURITY CONCERN', () => {
  // WARNING: "Git中文.Git" sanitizes to "Git.Git" which IS in catalog!
  // This is a potential security issue - Unicode homograph attacks possible
  const unicode = 'Git中文.Git'
  const result = validatePackageIds([unicode], catalogIds)

  // Non-ASCII chars are removed during sanitization
  // Result becomes "Git.Git" which IS in catalog - goes to valid!
  expect(result.valid).toEqual(['Git.Git'])
  expect(result.invalid).toEqual([])
})
```

After fix, this test should be updated to expect rejection.

## References

- [Unicode Security Considerations](https://www.unicode.org/reports/tr36/)
- [Homograph Attacks](https://en.wikipedia.org/wiki/IDN_homograph_attack)
- [Punycode](https://en.wikipedia.org/wiki/Punycode) - Internationalized domain names face similar issues

## Related Files

- `lib/packageValidator.ts` - Contains vulnerable code
- `lib/__tests__/packageValidator.test.ts` - Tests verifying behavior
- `lib/__tests__/security-integration.test.ts` - Security integration tests
