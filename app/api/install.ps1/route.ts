import { NextRequest, NextResponse } from "next/server"
import packages from "@/data/packages.json"
import { validatePackageIds } from "@/lib/packageValidator"
import { buildInstallScript } from "@/lib/scriptBuilder"

const PLAIN_TEXT = { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" }

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const appsParam = searchParams.get("apps") ?? ""
  const rawIds = appsParam.split(",").map(s => s.trim()).filter(Boolean)

  if (rawIds.length === 0) {
    return new NextResponse(
      `Write-Error "No packages specified. Usage: ?apps=Git.Git,Google.Chrome"; exit 1`,
      { headers: PLAIN_TEXT }
    )
  }

  const catalogIds = (packages as Array<{ id: string }>).map(p => p.id)
  const { valid, invalid } = validatePackageIds(rawIds, catalogIds)

  if (valid.length === 0) {
    return new NextResponse(
      `Write-Error "No valid package IDs found. Check IDs at appnest-beta.vercel.app"; exit 1`,
      { headers: PLAIN_TEXT }
    )
  }

  const script = buildInstallScript(valid, invalid)
  return new NextResponse(script, { headers: PLAIN_TEXT })
}
