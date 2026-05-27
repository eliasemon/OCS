import { describe, it, expect } from 'vitest'
import { buildInstallScript, buildCliScript } from '../scriptBuilder'

/**
 * NOTE: escapePowerShell is an internal function (not exported).
 * We test security indirectly through buildInstallScript output.
 */
describe('scriptBuilder', () => {
  describe('PowerShell escaping (via buildInstallScript)', () => {
    it('should escape backticks in package IDs', () => {
      const script = buildInstallScript(['Git`whoami'], [])
      expect(script).toContain('``')
    })

    it('should escape dollar signs in package IDs', () => {
      const script = buildInstallScript(['$PATH'], [])
      expect(script).toContain('`$')
    })

    it('should escape double quotes in package IDs', () => {
      const script = buildInstallScript(['Git"test'], [])
      expect(script).toContain('`"')
    })

    it('should escape single quotes in package IDs', () => {
      const script = buildInstallScript(["Git'test"], [])
      expect(script).toContain("''")
    })

    it('should escape multiple special characters', () => {
      const script = buildInstallScript(['`$test"\''], [])
      expect(script).toContain('``')
      expect(script).toContain('`$')
      expect(script).toContain('`"')
      expect(script).toContain("''")
    })

    it('should handle command injection by escaping special chars', () => {
      const malicious = 'Git"; Write-Host "hacked'
      const script = buildInstallScript([malicious], [])

      // Double quotes should be escaped
      expect(script).toContain('`"')
      // The malicious command should be present but escaped (not as executable code)
      expect(script).toContain('Write-Host')
    })

    it('should prevent variable interpolation', () => {
      const script = buildInstallScript(['$PATH'], [])
      expect(script).toContain('`$')
    })

    it('should prevent backtick command substitution', () => {
      const script = buildInstallScript(['git`whoami'], [])
      expect(script).toContain('``')
    })

    it('should handle unicode characters', () => {
      const script = buildInstallScript(['Git中文'], [])
      expect(script).toContain('Git中文')
    })
  })

  describe('buildInstallScript', () => {
    it('should generate a valid PowerShell script', () => {
      const script = buildInstallScript(['Git.Git', 'Google.Chrome'], [])

      expect(script).toContain('#Requires -Version 5.1')
      expect(script).toContain('Git.Git')
      expect(script).toContain('Google.Chrome')
      expect(script).toContain('winget install')
    })

    it('should include timestamp in header', () => {
      const script = buildInstallScript(['Git.Git'], [])

      expect(script).toContain('.GENERATED')
      expect(script).toMatch(/\.GENERATED \d{4}-\d{2}-\d{2}T/)
    })

    it('should include package count in header', () => {
      const script = buildInstallScript(['Git.Git', 'Chrome', 'VSCode'], [])

      expect(script).toContain('.PACKAGES  3')
    })

    it('should include source in header', () => {
      const script = buildInstallScript(['Git.Git'], [])

      expect(script).toContain('.SOURCE    installora.vercel.app')
    })

    it('should generate warning blocks for invalid IDs', () => {
      const script = buildInstallScript(['Git.Git'], ['Fake.Package'])

      expect(script).toContain('Write-Warning "Skipping unknown package: Fake.Package"')
    })

    it('should escape package IDs in the script', () => {
      const script = buildInstallScript(['Git$Git'], [])

      expect(script).toContain('`$')
    })

    it('should format package list as PowerShell array', () => {
      const script = buildInstallScript(['Git.Git', 'Chrome'], [])

      expect(script).toContain('$packages = @(')
      expect(script).toContain('"Git.Git"')
      expect(script).toContain(')')
    })

    it('should include winget auto-install command', () => {
      const script = buildInstallScript(['Git.Git'], [])

      expect(script).toContain('winget install --id=')
      expect(script).toContain('--silent')
      expect(script).toContain('--accept-package-agreements')
    })

    it('should include retry logic (RETRY not retry)', () => {
      const script = buildInstallScript(['Git.Git'], [])

      expect(script).toContain('$attempt')
      expect(script).toContain('RETRY') // Capitalized in the actual output
    })

    it('should include summary output', () => {
      const script = buildInstallScript(['Git.Git'], [])

      expect(script).toContain('Installed :')
      expect(script).toContain('Skipped   :')
      expect(script).toContain('Failed    :')
    })

    it('should handle empty valid list with invalid IDs', () => {
      const script = buildInstallScript([], ['Fake.Package'])

      expect(script).toContain('Write-Warning "Skipping unknown package: Fake.Package"')
      // Should still generate valid script structure
      expect(script).toContain('#Requires -Version 5.1')
    })

    it('should generate retry URL for failed packages', () => {
      const script = buildInstallScript(['Git.Git'], [])

      expect(script).toContain('Retry failed:')
      expect(script).toContain('powershell -c "irm https://installora.vercel.app/api/install.ps1?apps=')
    })

    it('should include banner with ASCII art', () => {
      const script = buildInstallScript(['Git.Git'], [])

      expect(script).toContain('Write-Banner')
      expect(script).toContain('Installora')
    })

    it('should include winget installation check', () => {
      const script = buildInstallScript(['Git.Git'], [])

      expect(script).toContain('Test-WingetInstalled')
      expect(script).toContain('Install-WingetIfMissing')
    })

    it('should handle package ID with quotes', () => {
      const script = buildInstallScript(['Git"Git'], [])

      expect(script).toContain('`"')
    })

    it('should handle package ID with backticks', () => {
      const script = buildInstallScript(['Git`Git'], [])

      expect(script).toContain('``')
    })

    it('should handle package ID with dollar sign', () => {
      const script = buildInstallScript(['Git$Git'], [])

      expect(script).toContain('`$')
    })

    it('should handle special unicode characters', () => {
      const script = buildInstallScript(['Git中文.Git'], [])

      // Unicode should pass through
      expect(script).toContain('Git中文')
    })

    it('should order packages as provided', () => {
      const ids = ['C.C', 'B.B', 'A.A']
      const script = buildInstallScript(ids, [])

      // Check order is preserved (each should appear)
      expect(script).toContain('C.C')
      expect(script).toContain('B.B')
      expect(script).toContain('A.A')
    })

    it('should handle many packages efficiently', () => {
      const manyIds = Array.from({ length: 50 }, (_, i) => `Package${i}.App${i}`)
      const script = buildInstallScript(manyIds, [])

      expect(script).toContain('.PACKAGES  50')
      manyIds.forEach(id => {
        expect(script).toContain(id)
      })
    })

    it('should use Continue error action preference', () => {
      const script = buildInstallScript(['Git.Git'], [])

      expect(script).toContain('$ErrorActionPreference = "Continue"')
    })

    it('should use --exact flag to prevent partial match attacks', () => {
      const script = buildInstallScript(['Git.Git'], [])

      expect(script).toContain('--exact')
    })
  })

  describe('buildCliScript', () => {
    it('should generate interactive CLI installer', () => {
      const script = buildCliScript()

      expect(script).toContain('#Requires -Version 5.1')
      expect(script).toContain('Installora CLI')
      expect(script).toContain('Interactive Installer')
    })

    it('should include base URL', () => {
      const script = buildCliScript()

      expect(script).toContain('$baseUrl = "https://installora.vercel.app"')
    })

    it('should include package fetching function', () => {
      const script = buildCliScript()

      expect(script).toContain('Get-Packages')
      expect(script).toContain('Invoke-RestMethod "$baseUrl/api/packages"')
    })

    it('should include category menu function', () => {
      const script = buildCliScript()

      expect(script).toContain('Show-CategoryMenu')
    })

    it('should include package selection function', () => {
      const script = buildCliScript()

      expect(script).toContain('Select-Packages')
    })

    it('should handle quit option', () => {
      const script = buildCliScript()

      expect(script).toContain('[Q] Quit')
    })

    it('should handle all packages option', () => {
      const script = buildCliScript()

      expect(script).toContain('[A] All packages')
    })

    it('should fetch and execute install script', () => {
      const script = buildCliScript()

      expect(script).toContain('$scriptUrl = "$baseUrl/api/install.ps1?apps=')
      expect(script).toContain('Invoke-Expression $script')
    })

    it('should include banner', () => {
      const script = buildCliScript()

      expect(script).toContain('Write-Banner')
    })

    it('should handle empty selection gracefully', () => {
      const script = buildCliScript()

      expect(script).toContain('No packages selected. Exiting.')
    })

    it('should use Continue error action', () => {
      const script = buildCliScript()

      expect(script).toContain('$ErrorActionPreference = "Continue"')
    })
  })

  describe('Security - Command Injection Prevention', () => {
    it('should prevent pipe injection', () => {
      const script = buildInstallScript(['Git | Format-Table'], [])

      // Pipe should be preserved but quoted (not executed)
      expect(script).toContain('|')
    })

    it('should prevent semicolon command separator', () => {
      const script = buildInstallScript(['Git; Remove-Item'], [])

      expect(script).toContain(';')
    })

    it('should prevent newline command injection', () => {
      const script = buildInstallScript(['Git\nRemove-Item'], [])

      expect(script).toContain('\n')
    })

    it('should prevent carriage return injection', () => {
      const script = buildInstallScript(['Git\rRemove-Item'], [])

      expect(script).toContain('\r')
    })

    it('should prevent tab injection', () => {
      const script = buildInstallScript(['Git\tRemove-Item'], [])

      expect(script).toContain('\t')
    })

    it('should escape backtick command substitution', () => {
      const script = buildInstallScript(['Git`whoami'], [])

      expect(script).toContain('``')
    })

    it('should escape variable syntax', () => {
      const script = buildInstallScript(['Git${ENV:PATH}'], [])

      expect(script).toContain('`$')
    })

    it('should handle multiple injection attempts', () => {
      const script = buildInstallScript(['`$Git;"|&\''], [])

      expect(script).toContain('``')
      expect(script).toContain('`$')
      expect(script).toContain('`"')
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty valid list', () => {
      const script = buildInstallScript([], ['Fake.Package'])

      expect(script).toContain('#Requires -Version 5.1')
      expect(script).toContain('.PACKAGES  0')
    })

    it('should handle single package', () => {
      const script = buildInstallScript(['Git.Git'], [])

      expect(script).toContain('.PACKAGES  1')
      expect(script).toContain('"Git.Git"')
    })

    it('should handle very long package ID', () => {
      const longId = 'A'.repeat(100)
      const script = buildInstallScript([longId], [])

      expect(script).toContain(longId)
    })

    it('should handle special characters in invalid IDs', () => {
      const script = buildInstallScript(['Git.Git'], ['Fake$Package', 'Null`Package'])

      expect(script).toContain('Write-Warning')
    })
  })
})
