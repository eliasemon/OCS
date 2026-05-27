import type { Metadata } from "next"
import packagesData from "@/data/packages.json"
import type { Package } from "@/types/package"
import { Catalog } from "@/components/Catalog"
import { Sidebar } from "@/components/Sidebar"
import { ShareBanner } from "@/components/ShareBanner"
import { getPresetById } from "@/lib/presets"

interface Props {
  searchParams: Promise<{ apps?: string; preset?: string }>
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams
  const count = params.apps?.split(",").filter(Boolean).length ?? 0
  return {
    title: `Appnest — ${count} apps pre-selected`,
    description: "Someone shared a Appnest configuration with you.",
  }
}

export default async function SharePage({ searchParams }: Props) {
  const params = await searchParams
  const preset = params.preset ? getPresetById(params.preset) : null
  const appIds = preset?.packageIds ?? params.apps?.split(",").filter(Boolean) ?? [] as const
  const packages = packagesData as Package[]

  return (
    <div className="flex flex-col min-h-screen">
      <ShareBanner appIds={appIds} presetId={params.preset ?? null} count={appIds.length} />
      <div className="flex flex-1">
        <main className="flex-1 overflow-y-auto p-6">
          <Catalog packages={packages} initialSelected={appIds} />
        </main>
        <aside className="hidden md:flex flex-col w-80 border-l border-[hsl(var(--color-border))]">
          <Sidebar packages={packages} />
        </aside>
      </div>
    </div>
  )
}
