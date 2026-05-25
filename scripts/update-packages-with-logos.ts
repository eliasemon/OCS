#!/usr/bin/env node
/**
 * Update packages.json with logoUrl field
 *
 * Reads logo-url-map.json and updates packages.json
 * to add logoUrl field to each package.
 */

import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const PACKAGES_JSON = path.join(__dirname, '../data/packages.json')
const LOGO_MAP_JSON = path.join(__dirname, '../data/logo-url-map.json')

async function main() {
  console.log('📝 Updating packages.json with logoUrl field...')

  // Read both files
  const packagesJson = await readFile(PACKAGES_JSON, 'utf-8')
  const logoMapJson = await readFile(LOGO_MAP_JSON, 'utf-8')

  const packages = JSON.parse(packagesJson) as Array<{ id: string }>
  const logoMap = JSON.parse(logoMapJson) as Record<string, string>

  // Update packages with logoUrl
  let updatedCount = 0
  for (const pkg of packages) {
    if (logoMap[pkg.id]) {
      (pkg as any).logoUrl = logoMap[pkg.id]
      updatedCount++
    }
  }

  // Write back to packages.json
  await writeFile(PACKAGES_JSON, JSON.stringify(packages, null, 2))

  console.log(`✅ Updated ${updatedCount} packages with logoUrl field`)
  console.log(`💾 Saved to: ${PACKAGES_JSON}`)
}

main().catch(console.error)
