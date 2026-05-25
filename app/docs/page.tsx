import Link from "next/link"

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-[hsl(var(--color-background))] text-[hsl(var(--color-foreground))]">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <Link href="/" className="text-[hsl(var(--color-primary))] hover:text-[hsl(var(--color-primary-hover))] transition-colors">
          ← Back to WinSetup
        </Link>

        <h1 className="text-4xl font-bold mt-8 mb-4">WinSetup Documentation</h1>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold text-[hsl(var(--color-primary))]">What is WinSetup?</h2>
          <p className="mt-2 text-[hsl(var(--color-muted-foreground))]">
            WinSetup is a web-based tool that helps you install Windows applications using winget (Windows Package Manager).
            Select your apps, generate a PowerShell command, and install everything with a single line.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold text-[hsl(var(--color-primary))]">How It Works</h2>
          <ol className="mt-4 space-y-4 list-decimal list-inside text-[hsl(var(--color-muted-foreground))]">
            <li>Select your applications from the catalog</li>
            <li>Click "Generate Install Command"</li>
            <li>Copy and run the PowerShell command on your Windows machine</li>
          </ol>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold text-[hsl(var(--color-primary))]">Example Command</h2>
          <pre className="mt-4 p-4 bg-[hsl(var(--color-card))] rounded-lg border border-[hsl(var(--color-border))] overflow-x-auto">
            <code className="text-sm text-[hsl(var(--color-primary))]">
              powershell -ExecutionPolicy Bypass -c "irm https://winsetup.app/api/install.ps1?apps=Git.Git,Google.Chrome | iex"
            </code>
          </pre>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold text-[hsl(var(--color-primary))]">Master CLI Command</h2>
          <p className="mt-2 text-[hsl(var(--color-muted-foreground))]">Run this in PowerShell for an interactive terminal installer:</p>
          <pre className="mt-4 p-4 bg-[hsl(var(--color-card))] rounded-lg border border-[hsl(var(--color-border))] overflow-x-auto">
            <code className="text-sm text-[hsl(var(--color-primary))]">
              powershell -c "irm https://winsetup.app/api/cli.ps1 | iex"
            </code>
          </pre>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold text-[hsl(var(--color-primary))]">FAQ</h2>
          <dl className="mt-4 space-y-4">
            <div>
              <dt className="font-semibold text-[hsl(var(--color-foreground))]">Is it safe?</dt>
              <dd className="text-[hsl(var(--color-muted-foreground))]">Yes. WinSetup only generates PowerShell scripts that use winget, Microsoft's official package manager.</dd>
            </div>
            <div>
              <dt className="font-semibold text-[hsl(var(--color-foreground))]">What's winget?</dt>
              <dd className="text-[hsl(var(--color-muted-foreground))]">Windows Package Manager — Microsoft's official command-line package manager for Windows 10/11.</dd>
            </div>
            <div>
              <dt className="font-semibold text-[hsl(var(--color-foreground))]">Does it require admin?</dt>
              <dd className="text-[hsl(var(--color-muted-foreground))]">Some packages may require administrator privileges. Run PowerShell as Administrator for best results.</dd>
            </div>
            <div>
              <dt className="font-semibold text-[hsl(var(--color-foreground))]">Which Windows versions?</dt>
              <dd className="text-[hsl(var(--color-muted-foreground))]">Windows 10 version 1709 or later, and Windows 11.</dd>
            </div>
          </dl>
        </section>
      </div>
    </div>
  )
}
