import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Documentation",
  description: "Learn how to install, configure, and use Installora across Windows, macOS, and Linux.",
  alternates: {
    canonical: "/docs"
  }
}

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
