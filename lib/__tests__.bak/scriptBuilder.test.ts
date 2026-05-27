import { describe, it, expect } from 'vitest'
import { buildInstallScript, buildCliScript, escapePowerShell } from '../scriptBuilder'

describe('scriptBuilder', () => {
  describe('escapePowerShell', () => {
    it('should escape backticks first (prevent command substitution)', () => {
      expect(escapePowerShell('`hello`')).toBe('``hello``')
    })

    it('should escape dollar signs (prevent variable interpolation)', () => {
      expect(escapePowerShell('$PATH')).toBe('`$PATH')
      expect(escapePowerShell('foo$bar')).toBe('foo`$bar')
    })

    it('should escape double quotes (prevent string breakout)', () => {
      expect(escapePowerShell('hello"world')).toBe('hello`"world')
    })

    it('should escape single quotes (prevent string breakout)', () => {
      expect(escapePowerShell("hello'world")).toBe("hello''world")
    })

    it('should escape multiple special characters in sequence', () => {
      expect(escapePowerShell("`$PATH'")).toBe('```$PATH\'\'')
    })

    it('should handle empty strings', () => {
      expect(escapePowerShell('')).toBe('')
    })

    it('should handle strings without special characters', () => {
      expect(escapePowerShell('Git.Git')).toBe('Git.Git')
    })

    it('should handle common package IDs safely', () => {
      expect(escapePowerShell('Microsoft.VisualStudioCode')).toBe('Microsoft.VisualStudioCode')
      expect(escapePowerShell('Google.Chrome')).toBe('Google.Chrome')
    })

    // Security-focused tests
    it('should prevent command injection through backticks', () => {
      const malicious = '`; rm -rf /; #`'
      expect(escapePowerShell(malicious)).toBe('``; rm -rf /; #``')
    })

    it('should prevent variable injection through dollar signs', () => {
      const malicious = '$(whoami)'
      expect(escapePowerShell(malicious)).toBe('`$(whoami)')
    })

    it('should prevent quote breaking escape sequences', () => {
      expect(escapePowerShell('"; exit; "')).toBe('`"; exit; `"')
      expect(escapePowerShell("'; exit; '")).toBe("''; exit; ''")
    })
  })

  describe('buildInstallScript', () => {
    it('should generate a valid PowerShell script with valid IDs', () => {
      const script = buildInstallScript(['Git.Git', 'Google.Chrome'], [])
      expect(script).toContain('#Requires -Version 5.1')
      expect(script).toContain('Git.Git')
      expect(script).toContain('Google.Chrome')
      expect(script).toContain('2') // package count
      expect(script).toContain('installora-beta.vercel.app')
    })

    it('should include warnings for invalid package IDs', () => {
      const script = buildInstallScript(
        ['Git.Git'],
        ['Invalid.Package', 'Another.Invalid']
      )
      expect(script).toContain('Write-Warning "Skipping unknown package: Invalid.Package"')
      expect(script).toContain('Write-Warning "Skipping unknown package: Another.Invalid"')
    })

    it('should escape package IDs in the script', () => {
      const script = buildInstallScript(['Test$Package'], [])
      // The $ should be escaped in the generated script
      expect(script).toContain('`$Package')
    })

    it('should handle empty valid and invalid lists', () => {
      const script = buildInstallScript([], [])
      expect(script).toContain('0') // package count
      expect(script).toContain('$packages = @()')
    })

    it('should handle scripts with only invalid packages', () => {
      const script = buildInstallScript(
        [],
        ['Invalid.Package1', 'Invalid.Package2']
      )
      expect(script).toContain('Write-Warning "Skipping unknown package: Invalid.Package1"')
      expect(script).toContain('Write-Warning "Skipping unknown package: Invalid.Package2"')
    })

    it('should include ISO timestamp', () => {
      const script = buildInstallScript(['Git.Git'], [])
      // Should contain ISO timestamp format
      expect(script).toMatch(/\.GENERATED \d{4}-\d{2}-\d{2}T/)
    })

    it('should include retry logic for failed installations', () => {
      const script = buildInstallScript(['Git.Git'], [])
      expect(script).toContain('attempt')
      expect(script).toContain('RETRY')
      expect(script).toContain('Attempt 2/2')
    })

    it('should handle special characters in package IDs', () => {
      const script = buildInstallScript(['Package.With.Dots', 'Package-With-Dashes'], [])
      expect(script).toContain('Package.With.Dots')
      expect(script).toContain('Package-With-Dashes')
    })

    it('should generate idempotent script (check for already installed)', () => {
      const script = buildInstallScript(['Git.Git'], [])
      expect(script).toContain('winget list')
      expect(script).toContain('SKIP')
      expect(script).toContain('Already installed')
    })

    it('should include winget auto-install if missing', () => {
      const script = buildInstallScript(['Git.Git'], [])
      expect(script).toContain('Test-WingetInstalled')
      expect(script).toContain('Install-WingetIfMissing')
      expect(script).toContain('api.github.com/repos/microsoft/winget-cli/releases/latest')
    })

    it('should provide retry URL for failed packages', () => {
      const script = buildInstallScript(['Git.Git'], [])
      expect(script).toContain('Retry failed:')
      expect(script).toContain('powershell -c "irm https://installora-beta.vercel.app/api/install.ps1?apps=')
    })

    it('should generate banner with ASCII art', () => {
      const script = buildInstallScript(['Git.Git'], [])
      expect(script).toContain('Write-Banner')
      expect(script).toContain('██╗')
      expect(script).toContain('Installora')
    })

    it('should track and report installation results', () => {
      const script = buildInstallScript(['Git.Git'], [])
      expect(script).toContain('success')
      expect(script).toContain('skipped')
      expect(script).toContain('failed')
      expect(script).toContain('Duration')
    })

    // Edge cases
    it('should handle maximum package limit', () => {
      const manyIds = Array.from({ length: 50 }, (_, i) => `Package.${i}`)
      const script = buildInstallScript(manyIds, [])
      expect(script).toContain('50') // package count
    })

    it('should handle package IDs with underscores', () => {
      const script = buildInstallScript(['Package_With_Underscore'], [])
      expect(script).toContain('Package_With_Underscore')
    })

    it('should escape package IDs with quotes in warnings', () => {
      const script = buildInstallScript([], ['Package"WithQuotes'])
      // Single quotes should be escaped
      expect(script).toContain("''")
    })
  })

  describe('buildCliScript', () => {
    it('should generate an interactive CLI installer script', () => {
      const script = buildCliScript()
      expect(script).toContain('#Requires -Version 5.1')
      expect(script).toContain('Installora CLI')
      expect(script).toContain('Interactive Installer')
    })

    it('should include functions for package selection', () => {
      const script = buildCliScript()
      expect(script).toContain('Get-Packages')
      expect(script).toContain('Show-CategoryMenu')
      expect(script).toContain('Select-Packages')
    })

    it('should fetch packages from the API', () => {
      const script = buildCliScript()
      expect(script).toContain('Invoke-RestMethod "$baseUrl/api/packages"')
    })

    it('should include all, quit, and done options', () => {
      const script = buildCliScript()
      expect(script).toContain('[A] All packages')
      expect(script).toContain('[Q] Quit')
      expect(script).toContain('DONE')
    })

    it('should handle empty selection gracefully', () => {
      const script = buildCliScript()
      expect(script).toContain('No packages selected. Exiting.')
    })

    it('should invoke the install script after selection', () => {
      const script = buildCliScript()
      expect(script).toContain('Invoke-RestMethod $scriptUrl')
      expect(script).toContain('Invoke-Expression $script')
    })

    it('should use the correct base URL', () => {
      const script = buildCliScript()
      expect(script).toContain('$baseUrl = "https://installora-beta.vercel.app"')
    })

    it('should display package counts per category', () => {
      const script = buildCliScript()
      expect(script).toContain('$count = ($packages | Where-Object')
    })
  })
})
