import Link from "next/link"

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <Link href="/" className="text-cyan-400 hover:text-cyan-300 transition-colors">
          ← Back to WinSetup
        </Link>

        <h1 className="text-4xl font-bold mt-8 mb-4">WinSetup Documentation</h1>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold text-cyan-400">What is WinSetup?</h2>
          <p className="mt-2 text-gray-400">
            WinSetup is a web-based tool that helps you install Windows applications using winget (Windows Package Manager).
            Select your apps, generate a PowerShell command, and install everything with a single line.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold text-cyan-400">How It Works</h2>
          <ol className="mt-4 space-y-4 list-decimal list-inside text-gray-400">
            <li>Select your applications from the catalog</li>
            <li>Click "Generate Install Command"</li>
            <li>Copy and run the PowerShell command on your Windows machine</li>
          </ol>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold text-cyan-400">Example Command</h2>
          <pre className="mt-4 p-4 bg-gray-900 rounded-lg border border-gray-800 overflow-x-auto">
            <code className="text-sm text-cyan-400">
              powershell -ExecutionPolicy Bypass -c "irm https://winsetup.app/api/install.ps1?apps=Git.Git,Google.Chrome | iex"
            </code>
          </pre>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold text-cyan-400">Master CLI Command</h2>
          <p className="mt-2 text-gray-400">Run this in PowerShell for an interactive terminal installer:</p>
          <pre className="mt-4 p-4 bg-gray-900 rounded-lg border border-gray-800 overflow-x-auto">
            <code className="text-sm text-cyan-400">
              powershell -c "irm https://winsetup.app/api/cli.ps1 | iex"
            </code>
          </pre>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold text-cyan-400">FAQ</h2>
          <dl className="mt-4 space-y-4">
            <div>
              <dt className="font-semibold text-gray-300">Is it safe?</dt>
              <dd className="text-gray-400">Yes. WinSetup only generates PowerShell scripts that use winget, Microsoft's official package manager.</dd>
            </div>
            <div>
              <dt className="font-semibold text-gray-300">What's winget?</dt>
              <dd className="text-gray-400">Windows Package Manager — Microsoft's official command-line package manager for Windows 10/11.</dd>
            </div>
            <div>
              <dt className="font-semibold text-gray-300">Does it require admin?</dt>
              <dd className="text-gray-400">Some packages may require administrator privileges. Run PowerShell as Administrator for best results.</dd>
            </div>
            <div>
              <dt className="font-semibold text-gray-300">Which Windows versions?</dt>
              <dd className="text-gray-400">Windows 10 version 1709 or later, and Windows 11.</dd>
            </div>
          </dl>
        </section>
      </div>
    </div>
  )
}
