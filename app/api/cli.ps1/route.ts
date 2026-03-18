import { NextResponse } from "next/server"
import { buildCliScript } from "@/lib/scriptBuilder"

export async function GET() {
  return new NextResponse(buildCliScript(), {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" }
  })
}
