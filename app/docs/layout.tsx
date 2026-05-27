import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Documentation",
  description: "Learn how to install, configure, and use Appnest across Windows, macOS, and Linux.",
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_APP_URL || "https://appnest-beta.vercel.app"}/docs`
  }
}

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
